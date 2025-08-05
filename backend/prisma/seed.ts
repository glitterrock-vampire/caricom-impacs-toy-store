// prisma/seed.ts
import { PrismaClient, Prisma } from '@prisma/client';
import { hashPassword } from '../src/lib/auth';
import { faker } from '@faker-js/faker';
import { Order } from '@prisma/client';

const prisma = new PrismaClient();

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

const COUNTRIES = [
  { code: 'US', name: 'United States', cities: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'] },
  { code: 'CA', name: 'Canada', cities: ['Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Ottawa'] },
  { code: 'GB', name: 'United Kingdom', cities: ['London', 'Manchester', 'Birmingham', 'Glasgow', 'Liverpool'] }
];

async function main() {
  console.log('🌱 Starting seed...');

  await prisma.$transaction([
    prisma.orderItem.deleteMany(),
    prisma.order.deleteMany(),
    prisma.product.deleteMany(),
    prisma.customer.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  const hashedPassword = await hashPassword('admin123');
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@toystore.com',
      name: 'Admin User',
      hashedPassword,
      role: 'ADMIN',
      isAdmin: true,
    },
  });
  console.log('👤 Created admin user');

  const createdCustomers = await Promise.all(customers.map(async (customer) => {
    const country = faker.helpers.arrayElement(COUNTRIES);
    const city = faker.helpers.arrayElement(country.cities);

    return prisma.customer.create({
      data: {
        ...customer,
        hashedPassword: await hashPassword('password123'),
        userId: adminUser.id,
        isVerified: faker.datatype.boolean(0.7),
        address: {
          street: faker.location.streetAddress(),
          city,
          state: faker.location.state(),
          country: country.name,
          postalCode: faker.location.zipCode(),
          phone: customer.phone
        } as Prisma.JsonObject
      }
    });
  }));
  console.log(`👥 Created ${createdCustomers.length} customers`);

  const createdProducts = await Promise.all(products.map(product =>
    prisma.product.create({
      data: {
        ...product,
        userId: adminUser.id,
        status: faker.helpers.weightedArrayElement([
          { weight: 8, value: 'in_stock' },
          { weight: 2, value: 'out_of_stock' }
        ]),
        imageUrl: faker.image.urlLoremFlickr({ category: 'toys' }),
        gender: faker.helpers.arrayElement(['boys', 'girls', 'unisex']),
        ageRange: faker.helpers.arrayElement(['0-2', '3-5', '6-8', '9-12', '13+']),
      }
    })
  ));
  console.log(`📦 Created ${createdProducts.length} products`);

  const orders = [];
  const startDate = new Date('2023-01-01');
  const endDate = new Date();

  for (let i = 0; i < 200; i++) {
    const customer = faker.helpers.arrayElement(createdCustomers);
    const orderDate = faker.date.between({ from: startDate, to: endDate });
    const status = faker.helpers.weightedArrayElement([
      { weight: 6, value: 'delivered' },
      { weight: 2, value: 'shipped' },
      { weight: 1, value: 'processing' },
      { weight: 1, value: 'pending' },
    ]);

    const country = faker.helpers.arrayElement(COUNTRIES);
    const city = faker.helpers.arrayElement(country.cities);
    const shippingMethod = faker.helpers.arrayElement(['standard', 'express', 'next-day']);
    const shippingCost = shippingMethod === 'standard' ? 4.99 : shippingMethod === 'express' ? 9.99 : 19.99;
    const hasDiscount = faker.datatype.boolean(0.3);
    const discountAmount = hasDiscount ? parseFloat(faker.commerce.price({ min: 1, max: 20, dec: 2 })) : 0;

    const itemCount = faker.number.int({ min: 1, max: 5 });
    const shuffledProducts = [...createdProducts].sort(() => 0.5 - Math.random());
    const selectedProducts = shuffledProducts.slice(0, itemCount);

    let subtotal = 0;
    const orderItems = selectedProducts.map(product => {
      const quantity = faker.number.int({ min: 1, max: 3 });
      const discount = faker.helpers.arrayElement([0, 5, 10, 15, 20]);
      const itemTotal = product.price * quantity * (1 - discount / 100);
      subtotal += itemTotal;
      return {
        productId: product.id,
        quantity,
        unitPrice: product.price,
        discount,
        totalPrice: parseFloat(itemTotal.toFixed(2))
      };
    });

    const tax = subtotal * 0.1;
    const total = subtotal + tax + shippingCost - discountAmount;

    const orders: Order[] = [];
    const deliveryAddress: Prisma.JsonObject = {
      street: faker.location.streetAddress(),
      city,
      state: faker.location.state(),
      country: country.name,
      postalCode: faker.location.zipCode(),
      phone: customer.phone
    };
    const order = await prisma.order.create({
      data: {
        orderNumber: `ORD-${orderDate.getFullYear()}${String(orderDate.getMonth() + 1).padStart(2, '0')}${String(orderDate.getDate()).padStart(2, '0')}-${faker.string.numeric(4)}`,
        orderDate,
        status,
        shippingMethod,
        trackingNumber: `TRK${country.code}${faker.string.numeric(10)}`,
        shippingCost,
        discountAmount,
        taxAmount: parseFloat(tax.toFixed(2)),
        totalAmount: parseFloat(total.toFixed(2)),
        deliveryAddress,
        customer: { connect: { id: customer.id } },
        user: { connect: { id: adminUser.id } }
      }
    });

    for (const item of orderItems) {
      await prisma.orderItem.create({
        data: {
          order: { connect: { id: order.id } },
          product: { connect: { id: item.productId } },
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount,
          totalPrice: item.totalPrice
        }
      });
    }
    orders.push(order);
    console.log(`📦 Created order #${order.orderNumber} with ${orderItems.length} items`);
  }

  console.log('✅ Seed completed successfully!');
  console.log(`📊 Created ${orders.length} orders with realistic data`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });