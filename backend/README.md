# CARICOM IMPACS Toy Store - Node.js Backend

A modern Node.js backend API for the CARICOM IMPACS Toy Store management system, built with TypeScript, Express, and Prisma.

## 🚀 Features

- **TypeScript** - Full type safety and modern JavaScript features
- **Express.js** - Fast, unopinionated web framework
- **Prisma** - Modern database toolkit with type-safe queries
- **JWT Authentication** - Secure user authentication
- **PostgreSQL** - Robust relational database
- **Zod Validation** - Runtime type checking and validation
- **Rate Limiting** - API protection against abuse
- **CORS** - Cross-origin resource sharing support
- **Security** - Helmet.js for security headers

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL 12+
- npm or yarn

## 🛠️ Installation

1. **Clone and navigate to the backend directory:**
   ```bash
   cd backend-node
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your database credentials and other settings.

4. **Set up the database:**
   ```bash
   # Generate Prisma client
   npm run generate
   
   # Run database migrations
   npm run migrate
   
   # Seed the database with sample data
   npm run seed
   ```

## 🏃‍♂️ Running the Application

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

## 📚 API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/recent-orders` - Get recent orders
- `GET /api/dashboard/monthly-revenue` - Get monthly revenue data

### Customers
- `GET /api/customers` - List customers (Admin only)
- `GET /api/customers/:id` - Get customer details
- `POST /api/customers` - Create customer (Admin only)
- `PUT /api/customers/:id` - Update customer (Admin only)
- `DELETE /api/customers/:id` - Delete customer (Admin only)

### Orders
- `GET /api/orders` - List orders
- `GET /api/orders/:id` - Get order details
- `POST /api/orders` - Create order
- `PUT /api/orders/:id` - Update order
- `DELETE /api/orders/:id` - Delete order (Admin only)
- `GET /api/orders/customer/:customerId` - Get customer orders

### Products
- `GET /api/products` - List products
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (Admin only)
- `PUT /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)
- `GET /api/products/meta/categories` - Get product categories
- `GET /api/products/meta/stats` - Get product statistics

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Default Admin Credentials
- **Email:** admin@toystore.com
- **Password:** admin123

## 🗃️ Database Schema

The application uses PostgreSQL with the following main entities:

- **Users** - Admin users who can manage the system
- **Customers** - End customers who place orders
- **Orders** - Customer orders with items and delivery information
- **Products** - Inventory items with stock tracking

## 🛡️ Security Features

- Password hashing with bcrypt
- JWT token authentication
- Rate limiting to prevent abuse
- CORS protection
- Security headers with Helmet.js
- Input validation with Zod
- SQL injection protection with Prisma

## 📊 Monitoring

- Health check endpoint: `GET /health`
- Request logging in development mode
- Error handling with detailed error responses

## 🔧 Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run seed` - Seed database with sample data
- `npm run migrate` - Run database migrations
- `npm run generate` - Generate Prisma client
- `npm run studio` - Open Prisma Studio (database GUI)

## 🌍 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `JWT_SECRET` | Secret key for JWT tokens | Required |
| `JWT_EXPIRES_IN` | JWT token expiration time | 7d |
| `PORT` | Server port | 8000 |
| `NODE_ENV` | Environment mode | development |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:3001 |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | 900000 |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 100 |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
