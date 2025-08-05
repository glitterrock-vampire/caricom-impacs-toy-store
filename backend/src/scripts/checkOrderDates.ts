import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface OrderWithDates {
  id: number;
  order_number: string | null;
  status: string | null;
  order_date: Date | null;
  shipped_date: Date | null;
  delivery_date: Date | null;
  customer: {
    name: string;
    email: string;
  } | null;
}

async function main() {
  console.log('Checking order dates...');
  const now = new Date();
  
  try {
    // Get all orders with their dates
    const orders = await prisma.$queryRaw<OrderWithDates[]>`
      SELECT 
        o.id, 
        o.order_number,
        o.status,
        o.order_date,
        o.shipped_date,
        o.delivery_date,
        json_build_object(
          'name', c.name,
          'email', c.email
        ) as customer
      FROM "orders" o
      LEFT JOIN "customers" c ON o.customer_id = c.id
      ORDER BY o.order_date DESC
      LIMIT 10
    `;

    console.log(`\n=== First 10 orders with their dates ===`);
    for (const order of orders) {
      console.log(`\nOrder #${order.order_number} (ID: ${order.id})`);
      console.log(`Status: ${order.status}`);
      console.log(`Customer: ${order.customer?.name} (${order.customer?.email})`);
      console.log(`Order Date: ${order.order_date?.toISOString()}`);
      console.log(`Shipped Date: ${order.shipped_date?.toISOString() || 'Not shipped'}`);
      console.log(`Delivery Date: ${order.delivery_date?.toISOString() || 'Not delivered'}`);
      
      // Check for date issues
      if (order.order_date && order.order_date > now) {
        console.log('⚠️  Order date is in the future!');
      }
      
      if (order.shipped_date && order.shipped_date > now) {
        console.log('⚠️  Shipped date is in the future!');
      }
      
      if (order.delivery_date && order.delivery_date > now) {
        console.log('⚠️  Delivery date is in the future!');
      }
      
      if (order.shipped_date && order.order_date && order.shipped_date < order.order_date) {
        console.log('⚠️  Shipped date is before order date!');
      }
      
      if (order.delivery_date && order.shipped_date && order.delivery_date < order.shipped_date) {
        console.log('⚠️  Delivery date is before shipped date!');
      }
    }

    // First, get the current timestamp from the database to ensure timezone consistency
    const dbNow = (await prisma.$queryRaw<Array<{now: Date}>>`SELECT NOW() as now`)[0].now;
    console.log(`\nCurrent database time: ${dbNow.toISOString()}`);

    // Check for orders with future dates using the database's current time
    const futureOrderDates = await prisma.$queryRaw<Array<{count: bigint}>>`
      SELECT COUNT(*) as count
      FROM "orders"
      WHERE "order_date" > NOW()
        AND "order_date" IS NOT NULL
    `;
    
    const futureShippedDates = await prisma.$queryRaw<Array<{count: bigint}>>`
      SELECT COUNT(*) as count
      FROM "orders"
      WHERE "shipped_date" > NOW()
        AND "shipped_date" IS NOT NULL
    `;
    
    const futureDeliveryDates = await prisma.$queryRaw<Array<{count: bigint}>>`
      SELECT COUNT(*) as count
      FROM "orders"
      WHERE "delivery_date" > NOW()
        AND "delivery_date" IS NOT NULL
    `;

    console.log('\n=== Date Issues Summary ===');
    console.log(`Orders with future order dates: ${futureOrderDates[0]?.count.toString() || '0'}`);
    console.log(`Orders with future shipped dates: ${futureShippedDates[0]?.count.toString() || '0'}`);
    console.log(`Orders with future delivery dates: ${futureDeliveryDates[0]?.count.toString() || '0'}`);

  } catch (error) {
    console.error('Error checking order dates:', error);
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
