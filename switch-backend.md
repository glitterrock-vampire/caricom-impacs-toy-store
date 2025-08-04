# Backend Information

This project uses a Node.js backend as the primary backend. A legacy Python backend is archived for reference.

## Current Setup (Node.js Backend)

### Running the Application
```bash
# Terminal 1: Start Node.js Backend
cd backend
npm run dev

# Terminal 2: Start Frontend
cd frontend
npm start
```

### Access Points
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/api-docs
- Health Check: http://localhost:8000/health

## Legacy Python Backend (Archived)

The Python backend has been moved to `backend-python-archived/` for reference.

### If You Need to Use the Python Backend
```bash
# Restore the Python backend
mv backend-python-archived backend-python

# Install Python dependencies
cd backend-python
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Run the Python backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Access Points (Python Backend)
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## Key Features

### Node.js Backend (Current)
- ✅ TypeScript for type safety
- ✅ Modern Express.js framework
- ✅ Prisma ORM for database operations
- ✅ JWT authentication
- ✅ Swagger/OpenAPI documentation
- ✅ Mock data endpoints for development
- ✅ Hot reload with nodemon

### Python Backend (Archived)
- ✅ FastAPI with automatic documentation
- ✅ SQLAlchemy ORM
- ✅ Pydantic for data validation
- ✅ Full database integration
- ✅ OAuth2 authentication flow

## Notes

- Node.js backend is the primary backend
- Frontend connects to port 8000
- Python backend is archived but can be restored if needed
- Both backends can use the same PostgreSQL database
