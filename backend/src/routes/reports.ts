import express from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';

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

    if (format === 'csv') {
      const csvData = orders.map(order => ({
        'Order ID': order.id,
        'Customer Name': order.customer?.name || 'Unknown',
        'Customer Email': order.customer?.email || '',
        'Order Date': order.orderDate.toISOString().split('T')[0],
        'Status': order.status,
        'Items Count': Array.isArray(order.items) ? order.items.length : 0,
        'Total Amount': order.totalAmount || 0,
        'Delivery Country': order.deliveryAddress ? (order.deliveryAddress as any).country : '',
        'Delivery Date': order.deliveryDate ? order.deliveryDate.toISOString().split('T')[0] : '',
      }));

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=orders-report.csv');
      
      const csvHeader = Object.keys(csvData[0] || {}).join(',');
      const csvRows = csvData.map(row => Object.values(row).join(','));
      const csvContent = [csvHeader, ...csvRows].join('\n');
      
      res.send(csvContent);
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

// GET /api/reports/customers
router.get('/customers', authenticate, requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const format = req.query.format as string || 'json';

    const customers = await prisma.customer.findMany({
      include: {
        orders: {
          select: { id: true, totalAmount: true, status: true },
        },
      },
    });

    const customerData = customers.map(customer => ({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      totalOrders: customer.orders.length,
      totalSpent: customer.orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0),
      lastOrderDate: customer.orders.length > 0 ? 
        Math.max(...customer.orders.map(o => new Date(o.id).getTime())) : null,
    }));

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=customers-report.csv');
      
      const csvHeader = 'Customer ID,Name,Email,Phone,Total Orders,Total Spent\n';
      const csvRows = customerData.map(customer => 
        `${customer.id},"${customer.name}","${customer.email}","${customer.phone || ''}",${customer.totalOrders},${customer.totalSpent}`
      ).join('\n');
      
      res.send(csvHeader + csvRows);
    } else {
      res.json({
        customers: customerData,
        summary: {
          totalCustomers: customers.length,
          totalRevenue: customerData.reduce((sum, c) => sum + c.totalSpent, 0),
          averageOrderValue: customerData.reduce((sum, c) => sum + c.totalSpent, 0) / 
            customerData.reduce((sum, c) => sum + c.totalOrders, 0) || 0,
        },
      });
    }
  } catch (error) {
    next(error);
  }
});

// GET /api/reports/inventory
router.get('/inventory', authenticate, requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const format = req.query.format as string || 'json';

    const products = await prisma.product.findMany({
      orderBy: { name: 'asc' },
    });

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=inventory-report.csv');
      
      const csvHeader = 'Product ID,Name,SKU,Category,Price,Stock,Status,Total Value\n';
      const csvRows = products.map(product => 
        `${product.id},"${product.name}","${product.sku}","${product.category}",${product.price},${product.stock},"${product.status}",${product.price * product.stock}`
      ).join('\n');
      
      res.send(csvHeader + csvRows);
    } else {
      res.json({
        products,
        summary: {
          totalProducts: products.length,
          totalValue: products.reduce((sum, p) => sum + (p.price * p.stock), 0),
          lowStockItems: products.filter(p => p.stock > 0 && p.stock <= 10).length,
          outOfStockItems: products.filter(p => p.stock === 0).length,
        },
      });
    }
  } catch (error) {
    next(error);
  }
});

export default router;