# test_db.py
from sqlalchemy import inspect
from app.database import SessionLocal, engine, Base
from app.models import User
from app.utils.security import hash_password

def test_connection():
    try:
        # Test database connection
        with engine.connect() as connection:
            print("✅ PostgreSQL connection successful!")
        
        # Drop all tables and recreate them
        print("ℹ️ Dropping and recreating tables...")
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables recreated")
        
        # Test models
        db = SessionLocal()
        try:
            # Create admin user with new fields
            print("ℹ️ Creating admin user...")
            admin = User(
                email="admin@toystore.com",
                name="Admin User",
                telephone="+1234567890",
                role="admin",
                hashed_password=hash_password("admin123"),
                is_admin=True,
                is_active=True
            )
            db.add(admin)
            db.commit()
            print("✅ Created admin user")
            print("   Email: admin@toystore.com")
            print("   Password: admin123")
            
        except Exception as e:
            print("❌ Error creating admin user:", str(e))
            db.rollback()
        finally:
            db.close()

if __name__ == "__main__":
    test_connection()
