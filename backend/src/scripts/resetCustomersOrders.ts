import prisma from '../lib/prisma';

async function resetCustomersOrders() {
  try {
    console.log('🗑️ Clearing existing customers and orders...');

    // Delete all orders first (due to foreign key constraints)
    await prisma.order.deleteMany({});
    console.log('✅ Deleted all orders');

    // Delete all customers
    await prisma.customer.deleteMany({});
    console.log('✅ Deleted all customers');

    console.log('🎉 Reset completed successfully!');
  } catch (error) {
    console.error('❌ Error resetting data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the reset function
if (require.main === module) {
  resetCustomersOrders()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export default resetCustomersOrders;