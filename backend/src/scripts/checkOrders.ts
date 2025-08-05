import { Prisma, PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Define the type for order selection
const orderSelect = {
  id: true,
  status: true,
  orderNumber: true,
  orderDate: true,
  shippedDate: true,  // Using the Prisma client field name (mapped to shipped_date in the database)
  deliveryDate: true,
  customer: {
    select: { name: true, email: true }
  },
  _count: {
    select: { orderItems: true }
  }
} as const;

type OrderWithCustomer = Prisma.OrderGetPayload<{
  select: typeof orderSelect;
}>;

async function main() {
  // Check some delivered orders
  console.log('Checking delivered orders:');
  const deliveredOrders = await prisma.order.findMany({
    where: { status: 'delivered' },
    select: orderSelect,
    take: 5,
    orderBy: { id: 'desc' }
  }) as OrderWithCustomer[];

  console.table(deliveredOrders);

  // Check some shipped orders
  console.log('\nChecking shipped orders:');
  const shippedOrders = await prisma.order.findMany({
    where: { status: 'shipped' },
    select: orderSelect,
    take: 5,
    orderBy: { id: 'desc' }
  }) as OrderWithCustomer[];

  console.table(shippedOrders);

  // Check orders with potential issues
  console.log('\nChecking for orders with potential issues:');
  const potentialIssues = await prisma.order.findMany({
    where: {
      OR: [
        { status: 'shipped', shippedDate: null },
        { status: 'delivered', shippedDate: null },
        { status: 'delivered', deliveryDate: null }
      ]
    } as Prisma.OrderWhereInput,
    select: orderSelect,
    orderBy: { id: 'desc' }
  }) as OrderWithCustomer[];

  console.log(`\nFound ${potentialIssues.length} orders with potential issues:`);
  console.table(potentialIssues);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
