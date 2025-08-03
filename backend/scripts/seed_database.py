# backend/scripts/seed_database.py
import sys
from pathlib import Path
from datetime import datetime, timedelta
import random

sys.path.append(str(Path(__file__).resolve().parents[1] / "app"))

from app.models import Base, User, Customer, Order
from app.database import SessionLocal, engine
from app.utils.security import hash_password

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Create admin user (using correct User model fields)
        if not db.query(User).filter(User.email == "admin@toystore.com").first():
            admin = User(
                email="admin@toystore.com",
                hashed_password=hash_password("admin123"),
                is_admin=True
            )
            db.add(admin)
            db.commit()

        toy_categories = [
            "Trucks", "LEGO Sets", "Scooters",
            "Stuffed Animals", "Dolls", "Kitchen Sets", "Jewelry Kits"
        ]

        for i in range(1, 31):
            email = f"customer{i}@example.com"
            existing_customer = db.query(Customer).filter(Customer.email == email).first()
            if existing_customer:
                print(f"⚠️ Skipping {email}, already exists.")
                continue

            customer = Customer(
                name=f"Customer {i}",
                email=email,
                phone=f"+1{random.randint(200, 999)}{random.randint(1000000, 9999999)}",
                user_id=1
            )
            db.add(customer)
            db.commit()

            for _ in range(random.randint(1, 3)):
                order = Order(
                    items=random.choices(toy_categories, k=random.randint(1, 3)),
                    delivery_address=f"{random.randint(100, 999)} Main Street, Kingston, Jamaica",
                    delivery_date_time=datetime.now() + timedelta(days=random.randint(1, 7)),
                    order_date_time=datetime.now(),
                    customer_id=customer.id
                )
                db.add(order)

            db.commit()

        print("✅ Database seeded successfully!")

    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
