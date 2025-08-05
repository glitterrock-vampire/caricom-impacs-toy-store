import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface OrderWithDates {
  id: number;
  order_number: string | null;
  status: string | null;
  order_date: Date | null;
  shipped_date: Date | null;
  delivery_date: Date | null;
  customer_id: number | null;
}

// This is the current real date (2025-03-11)
const REAL_CURRENT_DATE = new Date('2025-03-11T00:00:00.000Z');

// This is the database's "current" date (2025-08-05)
const DB_CURRENT_DATE = new Date('2025-08-05T00:00:00.000Z');

// Calculate the difference in days between the database's date and the real date
const DAYS_DIFF = Math.ceil((DB_CURRENT_DATE.getTime() - REAL_CURRENT_DATE.getTime()) / (1000 * 60 * 60 * 24));

console.log(`Adjusting dates by ${DAYS_DIFF} days to correct future dates...`);

async function main() {
  try {
    // First, get the current timestamp from the database
    const dbNow = (await prisma.$queryRaw<Array<{now: Date}>>`SELECT NOW() as now`)[0].now;
    console.log(`Current database time: ${dbNow.toISOString()}`);

    // Get all orders with dates in 2025 (which are in the future)
    const orders = await prisma.$queryRaw<OrderWithDates[]>`
      SELECT 
        id, 
        order_number,
        status,
        order_date,
        shipped_date,
        delivery_date,
        customer_id
      FROM "orders"
      WHERE 
        EXTRACT(YEAR FROM order_date) = 2025
      ORDER BY order_date ASC
    `;

    console.log(`Found ${orders.length} orders with future dates to adjust.`);

    for (const order of orders) {
      console.log(`\nProcessing Order #${order.order_number} (ID: ${order.id})`);
      console.log(`Status: ${order.status}`);
      console.log(`Original Dates:`);
      console.log(`- Order Date: ${order.order_date?.toISOString()}`);
      console.log(`- Shipped Date: ${order.shipped_date?.toISOString() || 'Not shipped'}`);
      console.log(`- Delivery Date: ${order.delivery_date?.toISOString() || 'Not delivered'}`);

      // Calculate new dates by subtracting the difference
      const newOrderDate = order.order_date ? new Date(order.order_date.getTime() - (DAYS_DIFF * 24 * 60 * 60 * 1000)) : null;
      const newShippedDate = order.shipped_date ? new Date(order.shipped_date.getTime() - (DAYS_DIFF * 24 * 60 * 60 * 1000)) : null;
      const newDeliveryDate = order.delivery_date ? new Date(order.delivery_date.getTime() - (DAYS_DIFF * 24 * 60 * 60 * 1000)) : null;

      console.log(`\nAdjusted Dates:`);
      console.log(`- Order Date: ${newOrderDate?.toISOString()}`);
      console.log(`- Shipped Date: ${newShippedDate?.toISOString() || 'Not shipped'}`);
      console.log(`- Delivery Date: ${newDeliveryDate?.toISOString() || 'Not delivered'}`);

      // Update the order with the adjusted dates
      await prisma.$executeRaw`
        UPDATE "orders"
        SET 
          order_date = ${newOrderDate},
          shipped_date = ${newShippedDate},
          delivery_date = ${newDeliveryDate}
        WHERE id = ${order.id}
      `;

      console.log(`✅ Updated order #${order.order_number} with corrected dates.`);
    }

    console.log('\n✅ All future dates have been adjusted to the past.');

  } catch (error) {
    console.error('Error fixing order dates:', error);
  } finally {
    await prisma.$disconnect();
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
