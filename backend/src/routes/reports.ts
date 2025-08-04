import express from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

const router = express.Router();

// GET /api/reports/orders
router.get('/orders', authenticate, requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const format = req.query.format as string || 'json';
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    const where: any = {};
    if (startDate && endDate) {
      where.orderDate = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        customer: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
      orderBy: { orderDate: 'desc' },
    });

    if (format === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Orders Report');

      // Add headers
      worksheet.columns = [
        { header: 'Order ID', key: 'id', width: 10 },
        { header: 'Customer Name', key: 'customerName', width: 20 },
        { header: 'Customer Email', key: 'customerEmail', width: 25 },
        { header: 'Order Date', key: 'orderDate', width: 15 },
        { header: 'Status', key: 'status', width: 12 },
        { header: 'Items Count', key: 'itemsCount', width: 12 },
        { header: 'Total Amount', key: 'totalAmount', width: 15 },
        { header: 'Delivery Country', key: 'deliveryCountry', width: 20 },
        { header: 'Delivery Date', key: 'deliveryDate', width: 15 },
      ];

      // Add data
      orders.forEach(order => {
        worksheet.addRow({
          id: order.id,
          customerName: order.customer?.name || 'Unknown',
          customerEmail: order.customer?.email || '',
          orderDate: order.orderDate.toISOString().split('T')[0],
          status: order.status,
          itemsCount: Array.isArray(order.items) ? order.items.length : 0,
          totalAmount: order.totalAmount || 0,
          deliveryCountry: order.deliveryAddress ? (order.deliveryAddress as any).country : '',
          deliveryDate: order.deliveryDate ? order.deliveryDate.toISOString().split('T')[0] : '',
        });
      });

      // Style the header
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=orders-report.xlsx');
      
      await workbook.xlsx.write(res);
      res.end();
    } else if (format === 'pdf') {
      const doc = new PDFDocument();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=orders-report.pdf');
      
      doc.pipe(res);
      
      // Title
      doc.fontSize(20).text('Orders Report', 50, 50);
      doc.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString()}`, 50, 80);
      
      // Table headers
      let y = 120;
      doc.text('ID', 50, y);
      doc.text('Customer', 100, y);
      doc.text('Date', 200, y);
      doc.text('Status', 280, y);
      doc.text('Amount', 350, y);
      doc.text('Country', 420, y);
      
      y += 20;
      doc.moveTo(50, y).lineTo(550, y).stroke();
      y += 10;
      
      // Table data
      orders.forEach(order => {
        if (y > 700) {
          doc.addPage();
          y = 50;
        }
        
        doc.text(order.id.toString(), 50, y);
        doc.text(order.customer?.name?.substring(0, 15) || 'Unknown', 100, y);
        doc.text(order.orderDate.toISOString().split('T')[0], 200, y);
        doc.text(order.status || '', 280, y);
        doc.text(`$${order.totalAmount || 0}`, 350, y);
        doc.text((order.deliveryAddress as any)?.country?.substring(0, 10) || '', 420, y);
        y += 20;
      });
      
      doc.end();
    } else {
      res.json({
        orders,
        summary: {
          totalOrders: orders.length,
          totalRevenue: orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0),
          statusBreakdown: orders.reduce((acc: any, order) => {
            acc[order.status || 'unknown'] = (acc[order.status || 'unknown'] || 0) + 1;
            return acc;
          }, {}),
        },
      });
    }
  } catch (error) {
    next(error);
  }
});

// GET /api/reports/customers/analytics
router.get('/customers/analytics', authenticate, requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        orders: {
          select: { 
            id: true, 
            totalAmount: true, 
            status: true, 
            orderDate: true,
            deliveryAddress: true 
          },
        },
      },
    });

    // Customer acquisition channels (based on email domains)
    const acquisitionChannels = customers.reduce((acc: any, customer) => {
      const domain = customer.email.split('@')[1];
      if (domain.includes('gmail') || domain.includes('yahoo') || domain.includes('hotmail')) {
        acc['Social Media'] = (acc['Social Media'] || 0) + 1;
      } else if (domain.includes('company') || domain.includes('corp')) {
        acc['Direct Visit'] = (acc['Direct Visit'] || 0) + 1;
      } else {
        acc['Online Search'] = (acc['Online Search'] || 0) + 1;
      }
      return acc;
    }, {});

    // Customer lifetime value analysis
    const customerAnalytics = customers.map(customer => {
      const totalSpent = customer.orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      const orderCount = customer.orders.length;
      
      let valueSegment = 'Low Value (<$200)';
      if (totalSpent >= 500) valueSegment = 'High Value ($500+)';
      else if (totalSpent >= 200) valueSegment = 'Medium Value ($200-$500)';
      
      return {
        ...customer,
        totalSpent,
        orderCount,
        valueSegment,
        avgOrderValue: orderCount > 0 ? totalSpent / orderCount : 0,
        lastOrderDate: orderCount > 0 ? 
          new Date(Math.max(...customer.orders.map(o => new Date(o.orderDate).getTime()))) : null,
      };
    });

    // Customer retention analysis
    const currentMonth = new Date();
    const lastMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    const twoMonthsAgo = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 2, 1);

    const newCustomers = customers.filter(c => 
      c.orders.length > 0 && new Date(c.orders[0].orderDate) >= lastMonth
    ).length;

    const returningCustomers = customers.filter(c => 
      c.orders.some(o => new Date(o.orderDate) >= lastMonth) &&
      c.orders.some(o => new Date(o.orderDate) < lastMonth)
    ).length;

    // Geographic analysis
    const locationAnalysis = customers.reduce((acc: any, customer) => {
      customer.orders.forEach(order => {
        const country = (order.deliveryAddress as any)?.country || 'Unknown';
        if (!acc[country]) {
          acc[country] = { customers: new Set(), revenue: 0, orders: 0 };
        }
        acc[country].customers.add(customer.id);
        acc[country].revenue += order.totalAmount || 0;
        acc[country].orders += 1;
      });
      return acc;
    }, {});

    const topLocations = Object.entries(locationAnalysis)
      .map(([country, data]: [string, any]) => ({
        country,
        customers: data.customers.size,
        revenue: data.revenue,
        orders: data.orders,
        avgOrderValue: data.orders > 0 ? data.revenue / data.orders : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    res.json({
      acquisitionChannels,
      customerAnalytics,
      retentionAnalysis: {
        newCustomers,
        returningCustomers,
        retentionRate: customers.length > 0 ? (returningCustomers / customers.length) * 100 : 0,
      },
      locationAnalysis: topLocations,
      summary: {
        totalCustomers: customers.length,
        totalRevenue: customerAnalytics.reduce((sum, c) => sum + c.totalSpent, 0),
        averageOrderValue: customerAnalytics.reduce((sum, c) => sum + c.totalSpent, 0) / 
          customerAnalytics.reduce((sum, c) => sum + c.orderCount, 0) || 0,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/reports/customers
router.get('/customers', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { format = 'excel' } = req.query;

    const customers = await prisma.customer.findMany({
      include: {
        orders: {
          select: {
            id: true,
            totalAmount: true,
            status: true,
            orderDate: true,
            deliveryAddress: true
          }
        }
      }
    });

    if (format === 'excel') {
      const ExcelJS = require('exceljs');
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Customers Report');

      // Headers
      worksheet.columns = [
        { header: 'Customer ID', key: 'id', width: 12 },
        { header: 'Name', key: 'name', width: 20 },
        { header: 'Email', key: 'email', width: 25 },
        { header: 'Phone', key: 'phone', width: 15 },
        { header: 'Total Orders', key: 'totalOrders', width: 12 },
        { header: 'Total Spent', key: 'totalSpent', width: 15 },
        { header: 'Last Order', key: 'lastOrder', width: 12 },
        { header: 'Status', key: 'status', width: 12 }
      ];

      // Add data
      customers.forEach(customer => {
        const totalSpent = customer.orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        const lastOrder = customer.orders.length > 0 
          ? new Date(Math.max(...customer.orders.map(o => new Date(o.orderDate).getTime())))
          : null;

        worksheet.addRow({
          id: customer.id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          totalOrders: customer.orders.length,
          totalSpent: totalSpent,
          lastOrder: lastOrder ? lastOrder.toISOString().split('T')[0] : 'Never',
          status: customer.orders.length > 0 ? 'Active' : 'Inactive'
        });
      });

      // Style the header
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=customers-report.xlsx');

      await workbook.xlsx.write(res);
      res.end();
    } else {
      res.json({ customers });
    }
  } catch (error) {
    next(error);
  }
});

export default router;
