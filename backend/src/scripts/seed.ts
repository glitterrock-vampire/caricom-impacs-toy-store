import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../lib/auth';

const prisma = new PrismaClient();

const toyTypes = ['Action Figures', 'Dolls', 'Building Blocks', 'Educational', 'Electronic', 'Outdoor', 'Board Games', 'Puzzles'];
const countries = ['United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Australia', 'Japan', 'Brazil', 'Mexico', 'Spain'];
const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const customers = [
  { name: 'John Smith', email: 'john.smith@gmail.com', phone: '+1-555-0101' },
  { name: 'Sarah Johnson', email: 'sarah.j@yahoo.com', phone: '+1-555-0102' },
  { name: 'Michael Brown', email: 'mike.brown@hotmail.com', phone: '+1-555-0103' },
  { name: 'Emily Davis', email: 'emily.davis@gmail.com', phone: '+1-555-0104' },
  { name: 'David Wilson', email: 'david.w@company.com', phone: '+1-555-0105' },
  { name: 'Lisa Anderson', email: 'lisa.anderson@corp.com', phone: '+1-555-0106' },
  { name: 'James Taylor', email: 'james.taylor@gmail.com', phone: '+1-555-0107' },
  { name: 'Maria Garcia', email: 'maria.garcia@yahoo.com', phone: '+1-555-0108' },
  { name: 'Robert Miller', email: 'robert.m@business.com', phone: '+1-555-0109' },
  { name: 'Jennifer Lee', email: 'jennifer.lee@gmail.com', phone: '+1-555-0110' },
  { name: 'Christopher White', email: 'chris.white@hotmail.com', phone: '+1-555-0111' },
  { name: 'Amanda Thompson', email: 'amanda.t@company.com', phone: '+1-555-0112' },
  { name: 'Daniel Martinez', email: 'daniel.martinez@gmail.com', phone: '+1-555-0113' },
  { name: 'Jessica Rodriguez', email: 'jessica.r@yahoo.com', phone: '+1-555-0114' },
  { name: 'Matthew Clark', email: 'matthew.clark@corp.com', phone: '+1-555-0115' }
];

const products = [
  { name: 'Super Hero Action Figure', description: 'Detailed superhero figure with accessories', price: 24.99, stock: 150, category: 'Action Figures', sku: 'SH-001' },
  { name: 'Princess Doll Set', description: 'Beautiful princess doll with dress-up accessories', price: 34.99, stock: 120, category: 'Dolls', sku: 'PD-001' },
  { name: 'LEGO Castle Set', description: 'Medieval castle building set with 500+ pieces', price: 89.99, stock: 75, category: 'Building Blocks', sku: 'LC-001' },
  { name: 'Learning Tablet', description: 'Educational tablet for kids with games and activities', price: 79.99, stock: 90, category: 'Educational', sku: 'LT-001' },
  { name: 'Remote Control Car', description: 'Fast RC car with LED lights and sound effects', price: 45.99, stock: 110, category: 'Electronic', sku: 'RC-001' },
  { name: 'Soccer Ball Set', description: 'Professional size soccer ball with pump and cones', price: 29.99, stock: 200, category: 'Outdoor', sku: 'SB-001' },
  { name: 'Monopoly Board Game', description: 'Classic family board game for ages 8+', price: 19.99, stock: 180, category: 'Board Games', sku: 'MG-001' },
  { name: '1000 Piece Puzzle', description: 'Beautiful landscape jigsaw puzzle', price: 15.99, stock: 95, category: 'Puzzles', sku: 'PZ-001' },
  { name: 'Robot Building Kit', description: 'Build and program your own robot', price: 129.99, stock: 45, category: 'Educational', sku: 'RB-001' },
  { name: 'Barbie Dream House', description: 'Three-story dollhouse with furniture', price: 199.99, stock: 30, category: 'Dolls', sku: 'BD-001' },
  { name: 'Nerf Blaster', description: 'Foam dart blaster with 20 darts', price: 39.99, stock: 85, category: 'Outdoor', sku: 'NB-001' },
  { name: 'Chess Set', description: 'Wooden chess set with storage box', price: 49.99, stock: 60, category: 'Board Games', sku: 'CS-001' }
];

function getRandomDate(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();

  // Create admin user
  const hashedPassword = await hashPassword('admin123');
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@toystore.com',
      hashedPassword,
      role: 'ADMIN',
      isAdmin: true,
    },
  });

  console.log('👤 Created admin user');

  // Create customers
  const createdCustomers = [];
  for (const customer of customers) {
    const customerPassword = await hashPassword('password123');
    const createdCustomer = await prisma.customer.create({
      data: {
        ...customer,
        hashedPassword: customerPassword,
        userId: adminUser.id,
      },
    });
    createdCustomers.push(createdCustomer);
  }

  console.log(`👥 Created ${createdCustomers.length} customers`);

  // Create products
  const createdProducts = [];
  for (const product of products) {
    const createdProduct = await prisma.product.create({
      data: {
        ...product,
        userId: adminUser.id,
      },
    });
    createdProducts.push(createdProduct);
  }

  console.log(`📦 Created ${createdProducts.length} products`);

  // Create orders with realistic data
  const startDate = new Date('2023-01-01');
  const endDate = new Date();
  
  for (let i = 0; i < 200; i++) {
    const customer = getRandomElement(createdCustomers);
    const orderDate = getRandomDate(startDate, endDate);
    const deliveryDate = new Date(orderDate.getTime() + Math.random() * 14 * 24 * 60 * 60 * 1000);
    
    // Generate 1-5 items per order
    const itemCount = Math.floor(Math.random() * 5) + 1;
    const orderItems = [];
    let totalAmount = 0;
    
    for (let j = 0; j < itemCount; j++) {
      const product = getRandomElement(createdProducts);
      const quantity = Math.floor(Math.random() * 3) + 1;
      const itemTotal = product.price * quantity;
      totalAmount += itemTotal;
      
      orderItems.push({
        toy: product.name,
        quantity,
        price: product.price,
        total: itemTotal,
        sku: product.sku
      });
    }

    const country = getRandomElement(countries);
    const status = getRandomElement(statuses);

    await prisma.order.create({
      data: {
        customerId: customer.id,
        userId: adminUser.id,
        orderDate,
        deliveryDate,
        status,
        totalAmount,
        items: orderItems,
        deliveryAddress: {
          street: `${Math.floor(Math.random() * 9999) + 1} Main St`,
          city: 'Sample City',
          state: 'Sample State',
          zipCode: `${Math.floor(Math.random() * 90000) + 10000}`,
          country
        }
      },
    });
  }

  console.log('📋 Created 200 orders with realistic data');
  console.log('✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
