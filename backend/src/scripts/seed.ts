import prisma from '../lib/prisma';
import { hashPassword } from '../lib/auth';

const caribbeanCountries = [
  'Jamaica', 'Trinidad & Tobago', 'Barbados', 'Guyana', 'Suriname',
  'Belize', 'Antigua & Barbuda', 'Dominica', 'Grenada', 'St. Lucia',
  'St. Vincent & Grenadines', 'St. Kitts & Nevis', 'Bahamas'
];

const cities = [
  'Kingston', 'Port of Spain', 'Bridgetown', 'Georgetown', 'Paramaribo',
  'Belize City', 'St. Johns', 'Roseau', 'St. Georges', 'Castries',
  'Kingstown', 'Basseterre', 'Nassau'
];

const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

async function seed() {
  try {
    console.log('🌱 Starting database seed...');

    // Create admin user
    const adminEmail = 'admin@toystore.com';
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    let adminUser;
    if (!existingAdmin) {
      const hashedPassword = await hashPassword('admin123');
      adminUser = await prisma.user.create({
        data: {
          email: adminEmail,
          name: 'Admin User',
          hashedPassword,
          isAdmin: true,
        },
      });
      console.log('✅ Created admin user');
    } else {
      adminUser = existingAdmin;
      console.log('✅ Admin user already exists');
    }

    // Skip products creation since they don't exist in Python backend
    console.log('✅ Skipped products (not in Python backend schema)');

    // Create customers and orders
    for (let i = 1; i <= 30; i++) {
      const email = `customer${i}@example.com`;
      const existingCustomer = await prisma.customer.findUnique({
        where: { email }
      });

      if (existingCustomer) continue;

      const hashedPassword = await hashPassword('customer123');
      const customer = await prisma.customer.create({
        data: {
          name: `Customer ${i}`,
          email,
          phone: `+1${Math.floor(Math.random() * 900) + 100}${Math.floor(Math.random() * 9000000) + 1000000}`,
          hashedPassword,
          userId: adminUser.id,
        },
      });

      // Create 1-3 orders per customer
      const orderCount = Math.floor(Math.random() * 3) + 1;
      for (let j = 0; j < orderCount; j++) {
        const itemCount = Math.floor(Math.random() * 3) + 1;
        const items = [];

        for (let k = 0; k < itemCount; k++) {
          items.push({
            name: `Toy Item ${k + 1}`,
            price: Math.floor(Math.random() * 50) + 10,
            quantity: Math.floor(Math.random() * 3) + 1
          });
        }

        const randomCountry = caribbeanCountries[Math.floor(Math.random() * caribbeanCountries.length)];
        const orderDate = new Date();
        orderDate.setDate(orderDate.getDate() - Math.floor(Math.random() * 90)); // Random date within last 90 days

        await prisma.order.create({
          data: {
            items: [
              { name: 'Toy Car', price: 15.99, quantity: 2 },
              { name: 'Doll', price: 25.50, quantity: 1 },
            ],
            orderDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
            deliveryAddress: {
              street: `${Math.floor(Math.random() * 999) + 1} Main St`,
              city: cities[Math.floor(Math.random() * cities.length)],
              country: caribbeanCountries[Math.floor(Math.random() * caribbeanCountries.length)],
            },
            deliveryDate: new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000),
            status: statuses[Math.floor(Math.random() * statuses.length)],
            customerId: customer.id,
            userId: adminUser.id,
          },
        });
      }
    }

    console.log('✅ Created customers and orders');
    console.log('🎉 Database seeded successfully!');
    console.log('\n📋 Login credentials:');
    console.log('Email: admin@toystore.com');
    console.log('Password: admin123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
if (require.main === module) {
  seed()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export default seed;
