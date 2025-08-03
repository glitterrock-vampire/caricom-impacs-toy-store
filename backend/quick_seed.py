from app.database import SessionLocal
from app.models import User, Customer, Order
from app.utils.security import hash_password
from datetime import datetime
import random

def seed_database():
    db = SessionLocal()
    try:
        # Create admin user first
        admin = db.query(User).filter(User.email == "admin@toystore.com").first()
        if not admin:
            admin = User(
                email="admin@toystore.com",
                hashed_password=hash_password("admin123"),
                is_admin=True
            )
            db.add(admin)
            db.commit()
            print("✅ Created admin user")

        toy_categories = [
            "Trucks", "LEGO Sets", "Scooters", 
            "Stuffed Animals", "Dolls", "Kitchen Sets", "Jewelry Kits"
        ]

        for i in range(1, 31):
            email = f"customer{i}@example.com"
            existing_customer = db.query(Customer).filter(Customer.email == email).first()
            if existing_customer:
                continue

            customer = Customer(
                name=f"Customer {i}",
                email=email,
                phone=f"+1{random.randint(200, 999)}{random.randint(1000000, 9999999)}",
                hashed_password=hash_password("customer123"),
                user_id=admin.id  # Use admin.id instead of hardcoded 1
            )
            db.add(customer)
            db.commit()

            # Create orders
            for _ in range(random.randint(1, 3)):
                order = Order(
                    items=random.choices(toy_categories, k=random.randint(1, 3)),
                    order_date=datetime.now(),
                    delivery_address=f"{random.randint(100, 999)} Main Street, Kingston, Jamaica",
                    delivery_date=datetime.now(),
                    status="pending",
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
