# Toy Store Management System

```text
████████╗ ██████╗ ██╗   ██╗    ███████╗████████╗ ██████╗ ██████╗ ███████╗
╚══██╔══╝██╔═══██╗╚██╗ ██╔╝    ██╔════╝╚══██╔══╝██╔═══██╗██╔══██╗██╔════╝
   ██║   ██║   ██║ ╚████╔╝     ███████╗   ██║   ██║   ██║██████╔╝█████╗  
   ██║   ██║   ██║  ╚██╔╝      ╚════██║   ██║   ██║   ██║██╔══██╗██╔══╝  
   ██║   ╚██████╔╝   ██║       ███████║   ██║   ╚██████╔╝██║  ██║███████╗
   ╚═╝    ╚═════╝    ╚═╝       ╚══════╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚══════╝
```

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Features](#2-features)
3. [Technology Stack](#3-technology-stack)
4. [System Architecture](#4-system-architecture)
5. [Installation Guide](#5-installation-guide)
6. [Configuration](#6-configuration)
7. [API Documentation](#7-api-documentation)
8. [Database Schema](#8-database-schema)
9. [Deployment](#9-deployment)
10. [Testing](#10-testing)
11. [Troubleshooting](#11-troubleshooting)
12. [Contributing](#12-contributing)
13. [License](#13-license)

---

## 1. Project Overview

A full-stack web application designed for CARICOM IMPACS to manage:
- International toy orders
- Customer relationships
- Inventory management
- Business analytics

**Key Metrics:**
- 176+ orders processed
- 30+ active customers
- $22,000+ revenue tracked
- 20+ countries served

⚠️ Note: The dashboard analytics module is currently partially implemented. Most core business logic—such as customer management, orders, inventory, and international shipping—is fully functional and production-ready. The dashboard will be refined in future iterations.
---

## 2. Features

### Authentication & Security
```diff
+ JWT-based authentication
+ Role-based access control
+ Password encryption
+ Session management
```

### Dashboard Analytics
```diff
+ Real-time order tracking
+ Geographic visualization
+ Revenue analytics
+ Interactive charts
```

### Customer Management
```diff
+ CRUD operations
+ PDF export
+ Advanced search
+ Bulk operations
```

### International Shipping
```diff
+ Multi-currency support
+ Tax calculation
+ 20+ countries
+ Delivery tracking
```

---

## 3. Technology Stack

| Component       | Technology               |
|-----------------|--------------------------|
| Frontend        | React 18, Material-UI    |
| Backend         | Node.js, Express, TypeScript |
| Database        | PostgreSQL, Prisma ORM   |
| Authentication  | JWT, bcrypt              |
| DevOps          | Docker, GitHub Actions   |

---

## 4. System Architecture

```mermaid
graph TD
    A[Client Browser] --> B[React Frontend]
    B --> C[Node.js Backend]
    C --> D[(PostgreSQL)]
    C --> E[Redis Cache]
    D --> F[Prisma ORM]
```

---

## 5. Installation Guide

### Prerequisites
- Node.js 18+
- PostgreSQL 12+
- Git

### Setup
```bash
git clone https://github.com/glitterrock-vampire/caricom-impacs-toy-store.git
cd caricom-impacs-toy-store

# Backend setup
cd backend
npm install
npx prisma migrate dev --name init

# Frontend setup
cd ../frontend
npm install
```

---

## 6. Configuration

### Backend (.env)
```ini
DATABASE_URL="postgresql://user:password@localhost:5432/toy_store_db"
JWT_SECRET="your_secure_jwt_secret"
PORT=8000
```

### Frontend (.env)
```ini
REACT_APP_API_BASE_URL="http://localhost:8000/api"
```

---

## 7. API Documentation

| Endpoint          | Method | Description           |
|-------------------|--------|-----------------------|
| `/api/auth/login` | POST   | User authentication   |
| `/api/customers`  | GET    | List all customers    |
| `/api/orders`     | POST   | Create new order      |

Access interactive docs at `http://localhost:8000/docs`

---

## 8. Database Schema

```sql
CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL
);
```

---

## 9. Deployment

### Docker
```bash
docker-compose up -d --build
```

### Manual
```bash
# Backend
npm run build && npm start

# Frontend
npm run build && serve -s build
```

---

## 10. Testing

Run test suites:
```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration
```

---

## 11. Troubleshooting

| Issue               | Solution                  |
|---------------------|---------------------------|
| Database connection | Verify PostgreSQL service |
| CORS errors        | Check .env configuration  |
| JWT issues         | Validate secret/tokens    |

---

## 12. Contributing

1. Fork the repository
2. Create feature branch
3. Submit pull request

---

## 13. License

MIT License © 2025 CARICOM IMPACS

```