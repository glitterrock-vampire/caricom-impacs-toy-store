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
  console.log('Starting to fix future dates...');
  const now = new Date();

  try {
    // Find all orders with any future dates
    const orders = await prisma.$queryRaw<OrderWithDates[]>`
      SELECT id, status, "order_date", "shipped_date", "delivery_date"
      FROM "orders"
      WHERE 
        "order_date" > NOW() OR
        ("shipped_date" IS NOT NULL AND "shipped_date" > NOW()) OR
        ("delivery_date" IS NOT NULL AND "delivery_date" > NOW())
      ORDER BY "order_date" DESC
    `;

    console.log(`Found ${orders.length} orders with future dates to fix`);

    for (const order of orders) {
      try {
        let orderDate = order.order_date ? new Date(order.order_date) : new Date();
        
        // If order date is in the future, set it to now - 1 year
        if (orderDate > now) {
          orderDate = new Date(now);
          orderDate.setFullYear(now.getFullYear() - 1);
        }

        // Calculate shipped date (1-3 days after order)
        let shippedDate = order.shipped_date ? new Date(order.shipped_date) : null;
        if (shippedDate && (shippedDate > now || shippedDate < orderDate)) {
          shippedDate = new Date(orderDate);
          shippedDate.setDate(orderDate.getDate() + Math.floor(Math.random() * 3) + 1);
        }

        // Calculate delivery date (2-5 days after shipping)
        let deliveryDate = order.delivery_date ? new Date(order.delivery_date) : null;
        if (deliveryDate && (deliveryDate > now || (shippedDate && deliveryDate < shippedDate))) {
          if (shippedDate) {
            deliveryDate = new Date(shippedDate);
            deliveryDate.setDate(shippedDate.getDate() + Math.floor(Math.random() * 4) + 2);
          } else {
            deliveryDate = new Date(orderDate);
            deliveryDate.setDate(orderDate.getDate() + Math.floor(Math.random() * 7) + 3);
          }
        }

        // Update the order with corrected dates
        await prisma.$executeRaw`
          UPDATE "orders"
          SET 
            "order_date" = ${orderDate},
            ${shippedDate ? `"shipped_date" = ${shippedDate},` : ''}
            ${deliveryDate ? `"delivery_date" = ${deliveryDate}` : ''}
          WHERE id = ${order.id}
        `;

        console.log(`Fixed dates for order ${order.id}:`);
        console.log(`  Order Date: ${orderDate}`);
        if (shippedDate) console.log(`  Shipped Date: ${shippedDate}`);
        if (deliveryDate) console.log(`  Delivery Date: ${deliveryDate}`);
        console.log('---');
      } catch (error) {
        console.error(`Error processing order ${order.id}:`, error);
      }
    }

    console.log('Finished fixing future dates');
  } catch (error) {
    console.error('Error in main process:', error);
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
