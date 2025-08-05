import { Prisma, PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Helper function to add days to a date
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// Type for order items
interface OrderItemData {
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

// Type for order with items
interface OrderWithItems extends Prisma.OrderGetPayload<{
  include: { orderItems: true; customer: { select: { name: true; email: true } } };
}> {}

async function main() {
  // 1. First, process delivered orders
  const deliveredOrders = await prisma.order.findMany({
    where: {
      status: 'delivered',
      OR: [
        { deliveryDate: null },
        { shippedDate: { equals: null } }
      ]
    } as Prisma.OrderWhereInput,
    include: {
      orderItems: true,
      customer: {
        select: {
          name: true,
          email: true
        }
      }
    }
  }) as OrderWithItems[];

  console.log(`Found ${deliveredOrders.length} delivered orders needing updates`);

  // 2. Update delivery and shipped dates for these orders
  for (const order of deliveredOrders) {
    // If no delivery date, set one (1-3 days after order date)
    const deliveryDate = order.deliveryDate || (() => {
      const date = new Date(order.orderDate);
      date.setDate(date.getDate() + Math.floor(Math.random() * 3) + 1);
      return date;
    })();
    
    // Set shipped date to 1-2 days before delivery date
    const shippedDate = new Date(deliveryDate);
    shippedDate.setDate(shippedDate.getDate() - (Math.floor(Math.random() * 2) + 1));

    // Prepare the update data
    const updateData: any = {
      shippedDate: shippedDate
    };

    // Only update deliveryDate if it's not set
    if (!order.deliveryDate) {
      updateData.deliveryDate = deliveryDate;
    }

    // Update items if needed
    if (!order.items || (Array.isArray(order.items) && order.items.length === 0)) {
      updateData.items = order.orderItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice
      }));
    }

    await prisma.order.update({
      where: { id: order.id },
      data: updateData
    });
    
    console.log(`Updated order #${order.id} with delivery date: ${deliveryDate}, shipped date: ${shippedDate}`);
  }
  
  // 3. Process shipped (but not yet delivered) orders
  const shippedOrders = await prisma.order.findMany({
    where: {
      OR: [
        { status: 'shipped' },
        { status: 'delivered' }
      ],
      shippedDate: null
    } as Prisma.OrderWhereInput,
    include: {
      orderItems: true,
      customer: {
        select: {
          name: true,
          email: true
        }
      }
    }
  }) as OrderWithItems[];
  
  console.log(`\nFound ${shippedOrders.length} shipped/delivered orders without shipped date`);
  
  for (const order of shippedOrders) {
    console.log(`\nProcessing order #${order.id} (Status: ${order.status}):`);
    
    // For shipped orders, set shipped date to 1-3 days before now
    // For delivered orders, set shipped date to 2-4 days before delivery date
    let shippedDate: Date;
    
    if (order.status === 'delivered' && order.deliveryDate) {
      // For delivered orders, set shipped date before delivery date
      shippedDate = new Date(order.deliveryDate);
      shippedDate.setDate(shippedDate.getDate() - (Math.floor(Math.random() * 3) + 2));
      console.log(`- Order is delivered on ${order.deliveryDate}, setting shipped date to ${shippedDate}`);
    } else {
      // For shipped orders, set shipped date to 1-3 days before now
      shippedDate = new Date();
      shippedDate.setDate(shippedDate.getDate() - (Math.floor(Math.random() * 3) + 1));
      console.log(`- Order is shipped, setting shipped date to ${shippedDate}`);
    }
    
    // Prepare the update data
    const updateData: any = {
      shippedDate: shippedDate
    };

    // Update items if needed
    if (!order.items || (Array.isArray(order.items) && order.items.length === 0)) {
      if (order.orderItems && order.orderItems.length > 0) {
        updateData.items = order.orderItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice
        }));
        console.log(`- Updated items field with ${order.orderItems.length} order items`);
      } else {
        console.log('- No order items found to update');
      }
    }
    
    await prisma.order.update({
      where: { id: order.id },
      data: updateData
    });
    
    console.log(`Updated order #${order.id} with shipped date: ${shippedDate}`);
  }

  // 3. Find all orders with empty items array but having orderItems
  const allOrders = await prisma.order.findMany({
    include: {
      orderItems: true
    }
  });

  // Filter orders that need updating
  const ordersNeedingUpdate = allOrders.filter(order => {
    // Check if items is null, empty array, or empty object
    const hasEmptyItems = !order.items || 
                         (Array.isArray(order.items) && order.items.length === 0) ||
                         (typeof order.items === 'object' && Object.keys(order.items).length === 0);
    
    // Check if there are order items
    const hasOrderItems = order.orderItems && order.orderItems.length > 0;
    
    return hasEmptyItems && hasOrderItems;
  });

  console.log(`\nFound ${ordersNeedingUpdate.length} orders with empty items but having order items`);

  // 4. Update items field for these orders
  for (const order of ordersNeedingUpdate) {
    const orderItems = order.orderItems || [];
    
    await prisma.order.update({
      where: { id: order.id },
      data: {
        items: orderItems.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice
        }))
      }
    });
    
    console.log(`Updated items for order #${order.id}`);
  }

  console.log('\n✅ All updates completed successfully!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
