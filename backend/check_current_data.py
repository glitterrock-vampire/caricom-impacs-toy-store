from app.database import SessionLocal
from app.models import User, Customer, Order
from sqlalchemy import text

def check_database():
    db = SessionLocal()
    try:
        # Check users
        users = db.query(User).all()
        print(f"👥 Users: {len(users)}")
        for user in users:
            print(f"  - {user.email} (Admin: {getattr(user, 'is_admin', 'N/A')}) (Name: {getattr(user, 'name', 'N/A')}) (Role: {getattr(user, 'role', 'N/A')})")
        
        # Check customers
        customers = db.query(Customer).all()
        print(f"👤 Customers: {len(customers)}")
        for customer in customers:
            print(f"  - {customer.name} ({customer.email})")
        
        # Check orders
        orders = db.query(Order).all()
        print(f"📦 Orders: {len(orders)}")
        for order in orders:
            print(f"  - Order {order.id}: {len(order.items) if order.items else 0} items, Status: {order.status}")
        
        # Check total revenue
        result = db.execute(text("SELECT SUM(CAST(array_length(items, 1) AS DECIMAL) * 50) as total FROM orders"))
        total_revenue = result.scalar() or 0
        print(f"💰 Estimated Revenue: ${total_revenue}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check_database()
