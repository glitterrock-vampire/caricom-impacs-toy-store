import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { join } from 'path';

// Define the Order type for our raw SQL results
interface Order {
  id: number;
  status: string | null;
  orderDate: Date;
  shippedDate: Date | null;
  deliveryDate: Date | null;
}

const prisma = new PrismaClient();

async function main() {
  console.log('Updating order status dates...');
  
  // Execute each SQL command separately
  const sqlCommands = [
    `ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "pending_date" TIMESTAMP WITH TIME ZONE`,
    `ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "processing_date" TIMESTAMP WITH TIME ZONE`,
    `COMMENT ON COLUMN "orders"."pending_date" IS 'When the order entered pending status'`,
    `COMMENT ON COLUMN "orders"."processing_date" IS 'When the order started being processed'`
  ];

  for (const cmd of sqlCommands) {
    await prisma.$executeRawUnsafe(cmd);
  }
  console.log('✅ Added pending_date and processing_date columns to orders table');
  
  // Update dates based on order status
  console.log('\nUpdating dates based on order status...');
  
  // Get all orders that need updating
  const orders = await prisma.$queryRaw<Order[]>`
    SELECT 
      id, 
      status, 
      order_date as "orderDate",
      shipped_date as "shippedDate",
      delivery_date as "deliveryDate"
    FROM "orders"
  `;

  let updatedCount = 0;
  
  for (const order of orders) {
    const orderId = order.id;
    const updates: any = {};
    
    // Set pending_date for all orders (when they were created)
    updates.pending_date = order.orderDate;
    
    // Set processing_date for processing, shipped, and delivered orders
    if (['processing', 'shipped', 'delivered'].includes(order.status || '')) {
      // Set processing date to 1 hour after order date
      const processingDate = new Date(order.orderDate);
      processingDate.setHours(processingDate.getHours() + 1);
      updates.processing_date = processingDate;
    }
    
    // Update the order with the new dates using raw SQL to avoid TypeScript issues
    await prisma.$executeRaw`
      UPDATE "orders"
      SET 
        pending_date = ${updates.pending_date}::timestamp with time zone,
        processing_date = ${updates.processing_date}::timestamp with time zone
      WHERE id = ${order.id}
    `;
    
    updatedCount++;
  }
  
  console.log(`✅ Updated ${updatedCount} orders with status-based dates`);
  
  // Verify the updates
  console.log('\nSample of updated orders:');
  interface OrderWithDates extends Order {
    pendingDate: Date | null;
    processingDate: Date | null;
  }
  
  const sampleOrders = await prisma.$queryRaw<OrderWithDates[]>`
    SELECT 
      id, 
      status, 
      order_date as "orderDate",
      pending_date as "pendingDate",
      processing_date as "processingDate",
      shipped_date as "shippedDate",
      delivery_date as "deliveryDate"
    FROM "orders"
    ORDER BY id DESC
    LIMIT 5
  `;
  
  console.table(sampleOrders);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
