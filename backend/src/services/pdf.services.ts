// pdf.services.ts
import { Customer, Order } from '@prisma/client';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

interface CustomerWithOrders extends Customer {
  orders?: Array<{
    orderDate: Date;
    totalAmount: number;
    status: string;
  }>;
}

export class PDFService {
  async generateCustomerReport(customers: CustomerWithOrders[]): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument();
      const buffers: Buffer[] = [];
      
      doc.on('data', (chunk: Buffer) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (error: Error) => reject(error));

      // Header
      doc
        .fillColor('#333')
        .fontSize(20)
        .text('Toy Store Customer Report', { align: 'center' })
        .moveDown(0.5);

      // Report metadata
      doc
        .fontSize(10)
        .text(`Generated on: ${new Date().toLocaleString()}`, { align: 'right' })
        .moveDown(1);

      // Customer table
      this.generateCustomerTable(doc, customers);

      doc.end();
    });
  }

  private generateCustomerTable(doc: PDFKit.PDFDocument, customers: CustomerWithOrders[]) {
    // Table headers
    doc
      .fillColor('#444')
      .font('Helvetica-Bold')
      .text('Name', 50, 120)
      .text('Email', 200, 120)
      .text('Country', 350, 120)
      .text('Orders', 450, 120)
      .moveDown(0.5);

    // Customer rows
    let y = 150;
    customers.forEach((customer) => {
      if (y > 700) { // Add new page if needed
        doc.addPage();
        y = 100;
      }

      doc
        .font('Helvetica')
        .fillColor('#333')
        .text(customer.name || '-', 50, y)
        .text(customer.email, 200, y)
        .text(customer.country || '-', 350, y)
        .text(String(customer.orders?.length || 0), 450, y);

      // Add order details if present
      if (customer.orders?.length) {
        customer.orders.forEach((order) => {
          y += 20;
          doc
            .font('Helvetica-Oblique')
            .fontSize(8)
            .text(
              `• ${order.orderDate.toLocaleDateString()} - $${order.totalAmount.toFixed(2)} (${order.status})`,
              70,
              y
            );
        });
      }

      y += 30;
    });
  }
}