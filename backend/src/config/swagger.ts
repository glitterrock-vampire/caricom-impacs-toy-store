import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Toy Store Management API',
      version: '1.0.0',
      description: 'A comprehensive API for managing a toy store with customers, orders, and inventory',
      contact: {
        name: 'API Support',
        email: 'support@toystore.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:8000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
            isAdmin: { type: 'boolean' },
          },
        },
        Customer: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string' },
          },
        },
        Product: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            category: { type: 'string' },
            price: { type: 'number' },
            stock: { type: 'number' },
            description: { type: 'string' },
            sku: { type: 'string' },
            status: { type: 'string' },
          },
        },
        Order: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            items: { type: 'object' },
            orderDate: { type: 'string', format: 'date-time' },
            deliveryAddress: { type: 'object' },
            deliveryDate: { type: 'string', format: 'date-time' },
            status: { type: 'string' },
            customerId: { type: 'number' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            token: { type: 'string' },
            user: { $ref: '#/components/schemas/User' },
          },
        },
        DashboardStats: {
          type: 'object',
          properties: {
            totalCustomers: { type: 'number' },
            totalOrders: { type: 'number' },
            totalRevenue: { type: 'number' },
            avgOrderValue: { type: 'number' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/index.ts'], // paths to files containing OpenAPI definitions
};

const specs = swaggerJsdoc(options);

export { swaggerUi, specs };
