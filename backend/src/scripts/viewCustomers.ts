// scripts/viewCustomers.ts
import { Prisma, PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

type OrderWithItems = Prisma.OrderGetPayload<{
  include: {
    orderItems: true;
    customer: {
      select: {
        id: true;
        name: true;
        email: true;
      };
    };
  };
}> & {
  shippedDate: Date | null;
  deliveryDate: Date | null;
  status: string | null;
  totalAmount: number | null;
};

async function main() {
  // Get all orders with their items and include shippedDate
  const orders = await prisma.order.findMany({
    include: {
      orderItems: true,
      customer: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    },
    orderBy: {
      orderDate: 'desc'
    }
  }) as OrderWithItems[];

  console.log('Total orders:', orders.length);
  
  // Log each order with its items
  orders.forEach((order, index) => {
    console.log(`\n--- Order #${index + 1} ---`);
    console.log(`Order ID: ${order.id}`);
    console.log(`Order Number: ${order.orderNumber}`);
    console.log(`Customer: ${order.customer.name} (${order.customer.email})`);
    console.log(`Order Date: ${order.orderDate}`);
    console.log(`Status: ${order.status}`);
    console.log(`Shipped Date: ${order.shippedDate || 'Not shipped yet'}`);
    console.log(`Delivery Date: ${order.deliveryDate || 'Not delivered yet'}`);
    console.log(`Total Amount: $${order.totalAmount?.toFixed(2)}`);
    
    console.log('\nOrder Items:');
    if (order.orderItems && order.orderItems.length > 0) {
      order.orderItems.forEach((item, itemIndex) => {
        console.log(`  ${itemIndex + 1}. Product ID: ${item.productId}, ` +
                   `Quantity: ${item.quantity}, ` +
                   `Unit Price: $${item.unitPrice.toFixed(2)}, ` +
                   `Total: $${item.totalPrice.toFixed(2)}`);
      });
    } else {
      console.log('  No items found for this order');
    }
    
    console.log('------------------');
  });
  
  // Count orders with/without items
  const ordersWithItems = orders.filter(order => order.orderItems.length > 0).length;
  const ordersWithoutItems = orders.length - ordersWithItems;
  
  console.log('\nSummary:');
  console.log(`- Total orders: ${orders.length}`);
  console.log(`- Orders with items: ${ordersWithItems}`);
  console.log(`- Orders without items: ${ordersWithoutItems}`);
  
  // Count delivered vs pending orders
  const deliveredOrders = orders.filter(order => order.status === 'delivered').length;
  const pendingOrders = orders.filter(order => 
    ['pending', 'processing', 'shipped'].includes(order.status || '')
  ).length;
  
  console.log(`\nOrder Status:`);
  console.log(`- Delivered: ${deliveredOrders}`);
  console.log(`- Pending/Processing/Shipped: ${pendingOrders}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());