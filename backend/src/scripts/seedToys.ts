import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../lib/auth';

const prisma = new PrismaClient();

const toyProducts = [
  {
    name: "LEGO Classic Creative Bricks",
    description: "Build anything you can imagine with this classic LEGO set",
    category: "Building Blocks",
    gender: "Unisex",
    ageRange: "4-99",
    price: 29.99,
    stock: 50,
    sku: "LEGO-001",
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
    status: "in_stock"
  },
  {
    name: "Barbie Dreamhouse",
    description: "Three-story dollhouse with elevator and pool",
    category: "Dolls",
    gender: "Girls",
    ageRange: "3-10",
    price: 199.99,
    stock: 25,
    sku: "BARBIE-001",
    imageUrl: "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=400",
    status: "in_stock"
  },
  {
    name: "Hot Wheels Track Set",
    description: "Ultimate racing track with loops and jumps",
    category: "Vehicles",
    gender: "Boys",
    ageRange: "5-12",
    price: 49.99,
    stock: 35,
    sku: "HW-001",
    imageUrl: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400",
    status: "in_stock"
  },
  {
    name: "Teddy Bear Plush",
    description: "Soft and cuddly teddy bear, perfect for bedtime",
    category: "Plush Toys",
    gender: "Unisex",
    ageRange: "0-5",
    price: 24.99,
    stock: 60,
    sku: "TEDDY-001",
    imageUrl: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400",
    status: "in_stock"
  },
  {
    name: "Puzzle 1000 Pieces",
    description: "Beautiful landscape puzzle for family fun",
    category: "Puzzles",
    gender: "Unisex",
    ageRange: "8+",
    price: 19.99,
    stock: 40,
    sku: "PUZZLE-001",
    imageUrl: "https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=400",
    status: "in_stock"
  },
  {
    name: "Remote Control Drone",
    description: "Easy-to-fly drone with camera",
    category: "Electronics",
    gender: "Unisex",
    ageRange: "10+",
    price: 89.99,
    stock: 20,
    sku: "DRONE-001",
    imageUrl: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=400",
    status: "in_stock"
  }
];

const sampleOrders = [
  {
    customerId: 1,
    items: [
      { name: "LEGO Classic Creative Bricks", price: 29.99, quantity: 2, sku: "LEGO-001" },
      { name: "Teddy Bear Plush", price: 24.99, quantity: 1, sku: "TEDDY-001" }
    ],
    status: "delivered",
    deliveryAddress: {
      street: "123 Main St",
      city: "New York",
      state: "NY",
      country: "United States",
      zipCode: "10001"
    }
  },
  {
    customerId: 2,
    items: [
      { name: "Barbie Dreamhouse", price: 199.99, quantity: 1, sku: "BARBIE-001" }
    ],
    status: "shipped",
    deliveryAddress: {
      street: "456 Oak Ave",
      city: "Toronto",
      state: "ON",
      country: "Canada",
      zipCode: "M5V 3A8"
    }
  },
  {
    customerId: 3,
    items: [
      { name: "Hot Wheels Track Set", price: 49.99, quantity: 1, sku: "HW-001" },
      { name: "Remote Control Drone", price: 89.99, quantity: 1, sku: "DRONE-001" }
    ],
    status: "pending",
    deliveryAddress: {
      street: "789 Pine Rd",
      city: "London",
      state: "England",
      country: "United Kingdom",
      zipCode: "SW1A 1AA"
    }
  }
];

async function seedToys() {
  try {
    console.log('🧸 Starting toys and orders seed...');

    // Get admin user
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@toystore.com' }
    });

    if (!adminUser) {
      throw new Error('Admin user not found. Run main seed first.');
    }

    // Create toy products
    console.log('📦 Creating toy products...');
    const createdProducts = [];
    for (const toy of toyProducts) {
      const product = await prisma.product.create({
        data: {
          ...toy,
          userId: adminUser.id,
        }
      });
      createdProducts.push(product);
    }

    // Get existing customers
    const customers = await prisma.customer.findMany({
      take: 10
    });

    if (customers.length === 0) {
      console.log('⚠️ No customers found. Creating sample customers...');
      // Create a few sample customers
      for (let i = 1; i <= 5; i++) {
        await prisma.customer.create({
          data: {
            name: `Customer ${i}`,
            email: `customer${i}@example.com`,
            phone: `+1-555-000${i}`,
            hashedPassword: await hashPassword('password123'),
            userId: adminUser.id,
          }
        });
      }
    }

    // Create orders with real products
    console.log('📋 Creating sample orders...');
    const updatedCustomers = await prisma.customer.findMany({ take: 10 });
    
    for (let i = 0; i < Math.min(sampleOrders.length, updatedCustomers.length); i++) {
      const orderData = sampleOrders[i];
      const customer = updatedCustomers[i];
      
      await prisma.order.create({
        data: {
          customerId: customer.id,
          userId: adminUser.id,
          items: orderData.items,
          status: orderData.status,
          deliveryAddress: orderData.deliveryAddress,
          orderDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
        }
      });
    }

    // Create additional random orders
    for (let i = 0; i < 20; i++) {
      const randomCustomer = updatedCustomers[Math.floor(Math.random() * updatedCustomers.length)];
      const randomProducts = createdProducts.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3) + 1);
      
      const items = randomProducts.map(product => ({
        name: product.name,
        price: product.price,
        quantity: Math.floor(Math.random() * 3) + 1,
        sku: product.sku
      }));

      const statuses = ['pending', 'shipped', 'delivered', 'cancelled'];
      const countries = ['United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 'France', 'Japan', 'Brazil'];
      
      await prisma.order.create({
        data: {
          customerId: randomCustomer.id,
          userId: adminUser.id,
          items: items,
          status: statuses[Math.floor(Math.random() * statuses.length)],
          deliveryAddress: {
            street: `${Math.floor(Math.random() * 999) + 1} Random St`,
            city: "Sample City",
            state: "Sample State",
            country: countries[Math.floor(Math.random() * countries.length)],
            zipCode: `${Math.floor(Math.random() * 90000) + 10000}`
          },
          orderDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000), // Random date within last 90 days
        }
      });
    }

    console.log('✅ Toys and orders seeded successfully!');
    console.log(`📦 Created ${toyProducts.length} toy products`);
    console.log(`📋 Created ${sampleOrders.length + 20} orders`);

  } catch (error) {
    console.error('❌ Error seeding toys and orders:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
if (require.main === module) {
  seedToys()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export default seedToys;
