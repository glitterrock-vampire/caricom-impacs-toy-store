import prisma from '../lib/prisma';
import { hashPassword } from '../lib/auth';

const firstNames = [
  'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda',
  'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica',
  'Thomas', 'Sarah', 'Christopher', 'Karen', 'Charles', 'Nancy', 'Daniel', 'Lisa',
  'Matthew', 'Betty', 'Anthony', 'Helen', 'Mark', 'Sandra', 'Donald', 'Donna',
  'Steven', 'Carol', 'Paul', 'Ruth', 'Andrew', 'Sharon', 'Joshua', 'Michelle',
  'Kenneth', 'Laura', 'Kevin', 'Sarah', 'Brian', 'Kimberly', 'George', 'Deborah',
  'Timothy', 'Dorothy', 'Ronald', 'Lisa', 'Jason', 'Nancy', 'Edward', 'Karen'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas',
  'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White',
  'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young',
  'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell'
];

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

function getRandomName() {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${firstName} ${lastName}`;
}

function getRandomEmail(name: string) {
  const cleanName = name.toLowerCase().replace(/\s+/g, '.');
  return `${cleanName}@example.co`;
}

function getRandomPhone() {
  const areaCode = Math.floor(Math.random() * 900) + 100;
  const exchange = Math.floor(Math.random() * 900) + 100;
  const number = Math.floor(Math.random() * 9000) + 1000;
  return `+1-${areaCode}-${exchange}-${number}`;
}

function getRandomAddress() {
  const streetNumber = Math.floor(Math.random() * 9999) + 1;
  const streetNames = ['Main St', 'Oak Ave', 'Pine Rd', 'Elm St', 'Maple Dr', 'Cedar Ln', 'Park Ave', 'First St'];
  const street = streetNames[Math.floor(Math.random() * streetNames.length)];
  const city = cities[Math.floor(Math.random() * cities.length)];
  const country = caribbeanCountries[Math.floor(Math.random() * caribbeanCountries.length)];
  
  return {
    street: `${streetNumber} ${street}`,
    city,
    country,
    zipCode: `${Math.floor(Math.random() * 90000) + 10000}`
  };
}

async function seedRealistic() {
  try {
    console.log('🌱 Starting realistic data seed...');

    // Get admin user
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@toystore.com' }
    });

    if (!adminUser) {
      throw new Error('Admin user not found. Run main seed first.');
    }

    // Get all existing products
    const products = await prisma.product.findMany();
    
    if (products.length === 0) {
      throw new Error('No products found. Run toy seed first.');
    }

    console.log(`📦 Found ${products.length} products to work with`);

    // Create 50 realistic customers
    const customers = [];
    for (let i = 0; i < 50; i++) {
      const name = getRandomName();
      const email = getRandomEmail(name);
      const hashedPassword = await hashPassword('customer123');
      
      const customer = await prisma.customer.create({
        data: {
          name,
          email,
          phone: getRandomPhone(),
          hashedPassword,
          userId: adminUser.id,
        },
      });
      
      customers.push(customer);
    }

    console.log(`✅ Created ${customers.length} customers`);

    // Create realistic orders for each customer
    let totalOrders = 0;
    let orderCounter = 1;
    
    for (const customer of customers) {
      // Each customer gets 1-5 orders
      const orderCount = Math.floor(Math.random() * 5) + 1;
      
      for (let j = 0; j < orderCount; j++) {
        // Select 1-4 random products for this order
        const orderProducts = products
          .sort(() => 0.5 - Math.random())
          .slice(0, Math.floor(Math.random() * 4) + 1);

        const items = orderProducts.map(product => ({
          name: product.name,
          price: product.price,
          quantity: Math.floor(Math.random() * 3) + 1,
          sku: product.sku
        }));

        // Calculate total amount
        const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // Random order date within last 6 months
        const orderDate = new Date();
        orderDate.setDate(orderDate.getDate() - Math.floor(Math.random() * 180));

        // Delivery date 1-14 days after order date
        const deliveryDate = new Date(orderDate);
        deliveryDate.setDate(deliveryDate.getDate() + Math.floor(Math.random() * 14) + 1);

        // Generate unique order number
        const orderNumber = `ORD-${Date.now()}-${orderCounter.toString().padStart(4, '0')}`;
        orderCounter++;

        await prisma.order.create({
          data: {
            customerId: customer.id,
            userId: adminUser.id,
            items: items,
            orderDate,
            deliveryDate,
            deliveryAddress: getRandomAddress(),
            status: statuses[Math.floor(Math.random() * statuses.length)],
            totalAmount,
            orderNumber,
            shippingMethod: ['standard', 'express', 'overnight'][Math.floor(Math.random() * 3)],
            trackingNumber: Math.random() > 0.3 ? `TRK${Math.floor(Math.random() * 1000000000)}` : null,
          },
        });

        totalOrders++;
        
        // Add small delay to ensure unique timestamps
        await new Promise(resolve => setTimeout(resolve, 1));
      }
    }

    console.log(`✅ Created ${totalOrders} orders`);
    console.log('🎉 Realistic data seeded successfully!');
    
    // Print summary
    const summary = await prisma.customer.count();
    const orderSummary = await prisma.order.count();
    const totalRevenue = await prisma.order.aggregate({
      _sum: { totalAmount: true }
    });

    console.log('\n📊 Summary:');
    console.log(`👥 Total Customers: ${summary}`);
    console.log(`📋 Total Orders: ${orderSummary}`);
    console.log(`💰 Total Revenue: $${totalRevenue._sum.totalAmount?.toFixed(2) || '0.00'}`);

  } catch (error) {
    console.error('❌ Error seeding realistic data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
if (require.main === module) {
  seedRealistic()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export default seedRealistic;
