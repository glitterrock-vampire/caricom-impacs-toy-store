// fixShippedDates.ts
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

// Define the order type with the fields we need
type OrderWithCustomer = Prisma.OrderGetPayload<{
  include: {
    customer: {
      select: {
        name: true;
        email: true;
      };
    };
  };
}>;

async function main() {
  console.log('Fixing shipped dates for shipped/delivered orders...');
  
  // 1. Find all shipped or delivered orders with null shippedDate
  const ordersToUpdate = await prisma.$queryRaw<OrderWithCustomer[]>`
    SELECT o.*, 
           json_build_object('name', c.name, 'email', c.email) as customer
    FROM "orders" o
    JOIN "customers" c ON o.customer_id = c.id
    WHERE o.status IN ('shipped', 'delivered')
    AND o.shipped_date IS NULL
  `;

  console.log(`Found ${ordersToUpdate.length} orders that need shipped dates`);

  // 2. Update each order with appropriate shipped date
  for (const order of ordersToUpdate) {
    // For shipped orders, set shipped date to 1-3 days before now
    // For delivered orders, set shipped date to 2-4 days before delivery date
    let shippedDate: Date;

    if (order.status === 'delivered' && order.deliveryDate) {
      // For delivered orders, set shipped date before delivery date
      shippedDate = new Date(order.deliveryDate);
      shippedDate.setDate(shippedDate.getDate() - (Math.floor(Math.random() * 3) + 2));
      console.log(`- Order #${order.id} is delivered, setting shipped date to ${shippedDate} (2-4 days before delivery)`);
    } else {
      // For shipped orders, set shipped date to 1-3 days before now
      shippedDate = new Date();
      shippedDate.setDate(shippedDate.getDate() - (Math.floor(Math.random() * 3) + 1));
      console.log(`- Order #${order.id} is shipped, setting shipped date to ${shippedDate} (1-3 days ago)`);
    }

    // Update the order using raw query to avoid TypeScript issues
    await prisma.$executeRaw`
      UPDATE "orders"
      SET shipped_date = ${shippedDate}
      WHERE id = ${order.id}
    `;
  }

  console.log('\n✅ All shipped dates have been updated successfully!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());