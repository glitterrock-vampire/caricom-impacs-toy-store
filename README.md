# 🧸 Toy Store Management System

![System Architecture](https://img.shields.io/badge/architecture-full--stack-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Version](https://img.shields.io/badge/version-1.0.0-orange)

A comprehensive full-stack web application for managing toy store operations with international shipping capabilities.

## 🌟 Features

### 🔐 Authentication & Security
- JWT-based authentication
- Role-based access control (Admin/Staff)
- Password encryption
- Session management

### 📊 Dashboard Analytics
- Real-time order tracking
- Geographic visualization
- Revenue analytics
- Interactive charts

### 👥 Customer Management
- Complete CRUD operations
- PDF/Excel export
- Advanced search/filter
- Bulk operations

### 🧸 Product Management
- 24+ toy categories
- Inventory tracking
- Stock level alerts
- Barcode support

### 🌍 International Shipping
- 20+ countries supported
- Multi-currency
- Tax calculation
- Delivery tracking

## 🛠 Technology Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI Framework |
| Material-UI | Component Library |
| Redux Toolkit | State Management |
| Chart.js | Data Visualization |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js | Runtime |
| Express | Web Framework |
| TypeScript | Type Safety |
| Prisma | ORM |

### Database
| Technology | Purpose |
|------------|---------|
| PostgreSQL | Primary Database |
| Redis | Caching (Optional) |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 12+
- Git

### Installation
```bash
# Clone repository
git clone https://github.com/glitterrock-vampire/caricom-impacs-toy-store.git
cd toy-store-management

# Install dependencies
npm install
cd client && npm install && cd ..

# Configure environment
cp .env.example .env
# Edit .env with your credentials
Database Setup
bash
# Run migrations
npx prisma migrate dev --name init

# Seed sample data
npx prisma db seed
Running the Application
bash
# Development mode
npm run dev

# Production build
npm run build
npm start
📊 Database Access
To access Prisma Studio:

bash
cd backend
npx prisma studio
Then visit: http://localhost:5555

🌐 API Endpoints
Endpoint	Method	Description
/api/auth/login	POST	User login
/api/customers	GET	List customers
/api/orders	POST	Create order
View full API docs at: http://localhost:8000/docs

🐛 Troubleshooting
Common issues:

Database connection errors:

Verify PostgreSQL is running

Check .env configuration

CORS issues:

Ensure correct origins in CORS config

Prisma errors:

Run npx prisma generate

Reset with npx prisma migrate reset

🤝 Contributing
Fork the repository

Create your feature branch (git checkout -b feature/amazing-feature)

Commit your changes (git commit -m 'Add some feature')

Push to the branch (git push origin feature/amazing-feature)

Open a Pull Request

📜 License
MIT License © 2023 Toy Store Management System
