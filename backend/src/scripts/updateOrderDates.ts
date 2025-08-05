import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Interface for orders with dates
interface OrderWithDates {
  id: number;
  status: string | null;
  order_date: Date | null;
  shipped_date: Date | null;
  delivery_date: Date | null;
}

async function main() {
  console.log('Starting to update order dates...');

  try {
    // 1. Update processing orders (should have order_date)
    console.log('Updating processing orders...');
    const processingResult = await prisma.$executeRaw`
      UPDATE "orders"
      SET "order_date" = NOW()
      WHERE status = 'processing' 
      AND "order_date" IS NULL
      RETURNING id, status, "order_date", "shipped_date", "delivery_date"
    `;
    console.log(`Updated ${processingResult} processing orders with order date`);

    // 2. Update shipped orders (should have order_date and shipped_date)
    console.log('Updating shipped orders...');
    const shippedOrders = await prisma.$queryRaw<OrderWithDates[]>`
      SELECT id, status, "order_date", "shipped_date", "delivery_date"
      FROM "orders"
      WHERE status = 'shipped' 
      AND ("order_date" IS NULL OR "shipped_date" IS NULL)
    `;

    for (const order of shippedOrders) {
      const orderDate = order.order_date || new Date();
      const shippedDate = order.shipped_date || new Date(orderDate.getTime() + 24 * 60 * 60 * 1000);

      await prisma.$executeRaw`
        UPDATE "orders"
        SET 
          "order_date" = ${orderDate},
          "shipped_date" = ${shippedDate}
        WHERE id = ${order.id}
      `;
      console.log(`Updated shipped order ${order.id} with order and shipped dates`);
    }

    // 3. Update delivered orders (should have all dates)
    console.log('Updating delivered orders...');
    const deliveredOrders = await prisma.$queryRaw<OrderWithDates[]>`
      SELECT id, status, "order_date", "shipped_date", "delivery_date"
      FROM "orders"
      WHERE status = 'delivered' 
      AND ("order_date" IS NULL OR "shipped_date" IS NULL OR "delivery_date" IS NULL)
    `;

    for (const order of deliveredOrders) {
      const orderDate = order.order_date || new Date();
      const shippedDate = order.shipped_date || new Date(orderDate.getTime() + 24 * 60 * 60 * 1000);
      const deliveryDate = order.delivery_date || new Date(shippedDate.getTime() + 2 * 24 * 60 * 60 * 1000);

      await prisma.$executeRaw`
        UPDATE "orders"
        SET 
          "order_date" = ${orderDate},
          "shipped_date" = ${shippedDate},
          "delivery_date" = ${deliveryDate}
        WHERE id = ${order.id}
      `;
      console.log(`Updated delivered order ${order.id} with all dates`);
    }

    console.log('Finished updating order dates');
  } catch (error) {
    console.error('Error updating order dates:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
