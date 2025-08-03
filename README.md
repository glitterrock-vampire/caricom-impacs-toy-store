# 🧸 Toy Store Management System

A comprehensive full-stack web application for managing toy store operations with international shipping capabilities, built for the CARICOM IMPACS Application Developer Assessment.

## 🌟 Features

### 🔐 Authentication & Security
- Secure login system with JWT tokens
- Admin and customer role management
- Protected routes and API endpoints

### 📊 Dashboard Analytics
- Real-time business metrics and KPIs
- **176+ orders** from **30+ customers** worldwide
- **Global shipping tracking** across 8+ regions
- Revenue analytics and order trends
- Interactive charts and visualizations

### 👥 Customer Management
- Complete CRUD operations (Create, Read, Update, Delete)
- Customer profile management
- Order history tracking
- **PDF export functionality**
- Search and filter capabilities

### 🌍 International Shipping
- **Global coverage** across multiple continents:
  - 🇺🇸 North America (USA, Canada)
  - 🇪🇺 Europe (UK, France, Germany, Italy, Spain, Netherlands)
  - 🇯🇵 Asia (Japan, South Korea, Singapore, Hong Kong, China, India)
  - 🇯🇲 Caribbean/CARICOM (Jamaica, Trinidad & Tobago, Barbados)
  - 🇦🇺 Oceania (Australia, New Zealand)
  - 🇧🇷 South America (Brazil, Argentina, Peru)
  - 🇿🇦 Africa (South Africa, Nigeria, Egypt)
  - 🇦🇪 Middle East (UAE, Lebanon, Jordan)

### 🧸 Product Management
- **24+ toy categories** including:
  - Remote Control Trucks, LEGO Creator Sets
  - Educational Tablets, Science Kits
  - Action Figures, Board Games
  - Art Supplies, Musical Instruments

## 🛠️ Technology Stack

### Backend
- **FastAPI** - Modern Python web framework
- **PostgreSQL** - Robust relational database
- **SQLAlchemy** - Python SQL toolkit and ORM
- **JWT Authentication** - Secure token-based auth
- **Pydantic** - Data validation and serialization

### Frontend
- **React 18** - Modern JavaScript library
- **React Router** - Client-side routing
- **Modern CSS** - Responsive design with gradients and animations
- **Fetch API** - HTTP client for API communication

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- PostgreSQL 12+

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd toy-store-management
```

2. **Backend Setup**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. **Database Setup**
```bash
# Create PostgreSQL database
createdb toy_store_db

# Set environment variable
export DATABASE_URL="postgresql://username:password@localhost/toy_store_db"

# Run database migrations and seed data
python scripts/seed_database.py
```

4. **Frontend Setup**
```bash
cd frontend
npm install
```

### Running the Application

1. **Start Backend Server**
```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

2. **Start Frontend Development Server**
```bash
cd frontend
npm start
```

3. **Access the Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

### Default Login Credentials
- **Email**: admin@toystore.com
- **Password**: admin123

## 🎯 Assessment Requirements Completed

✅ **Login Page** - Secure authentication system
✅ **Dashboard** - Real-time analytics with international data
✅ **Customer Management** - Full CRUD with PDF export
✅ **Database** - 30+ customers, 176+ orders, PostgreSQL
✅ **International Shipping** - Global coverage demonstration
✅ **Professional UI/UX** - Modern, responsive design

## 🌍 Global Reach

The system demonstrates international e-commerce capabilities with orders from:
- **8 major regions** worldwide
- **20+ countries** with localized addresses
- **Realistic shipping logistics** with varied delivery times
- **Multi-currency support** ready for implementation

## 📈 Performance Metrics

- **176+ total orders** processed
- **30+ active customers** managed
- **$22,000+ revenue** tracked
- **8+ regions** served globally
- **Sub-second** API response times

## 📝 API Documentation

Once the backend is running, access the interactive API documentation at:
`http://localhost:8000/docs`

## 👨‍💻 Developer

Built with ❤️ for the CARICOM IMPACS assessment, demonstrating full-stack development capabilities with modern technologies and international business requirements.