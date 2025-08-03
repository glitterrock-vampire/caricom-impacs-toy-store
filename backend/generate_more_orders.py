#!/usr/bin/env python3
"""
Generate 50 additional orders for the toy store database
"""

import sys
from pathlib import Path
from datetime import datetime, timedelta
import random

# Add the app directory to the path
sys.path.append(str(Path(__file__).resolve().parent / "app"))

from app.database import SessionLocal
from app.models import Customer, Order

def generate_more_orders():
    """Generate 50 additional orders for existing customers"""
    db = SessionLocal()
    
    try:
        # Get all existing customers
        customers = db.query(Customer).all()
        if not customers:
            print("❌ No customers found! Please run the seed script first.")
            return
        
        print(f"📊 Found {len(customers)} customers")
        
        # Enhanced toy categories with more variety
        toy_categories = [
            "Remote Control Trucks", "LEGO Creator Sets", "Electric Scooters",
            "Teddy Bears", "Barbie Dolls", "Play Kitchen Sets", "Jewelry Making Kits",
            "Action Figures", "Board Games", "Puzzles", "Art Supplies", "Building Blocks",
            "Musical Instruments", "Sports Equipment", "Science Kits", "Robot Toys",
            "Dress-up Costumes", "Toy Cars", "Dollhouses", "Train Sets",
            "Educational Tablets", "Outdoor Play Sets", "Craft Kits", "Magic Sets"
        ]
        
        # Global shipping addresses for international coverage
        shipping_addresses = [
            # North America
            "123 Main Street, New York, NY, USA",
            "456 Maple Avenue, Toronto, ON, Canada",
            "789 Oak Drive, Los Angeles, CA, USA",
            "321 Pine Street, Vancouver, BC, Canada",

            # Europe
            "147 Oxford Street, London, UK",
            "258 Champs-Élysées, Paris, France",
            "369 Unter den Linden, Berlin, Germany",
            "741 Via del Corso, Rome, Italy",
            "852 Gran Vía, Madrid, Spain",
            "963 Dam Square, Amsterdam, Netherlands",

            # Asia
            "159 Shibuya, Tokyo, Japan",
            "357 Gangnam-gu, Seoul, South Korea",
            "468 Orchard Road, Singapore",
            "579 Nathan Road, Hong Kong",
            "681 Nanjing Road, Shanghai, China",
            "792 Connaught Place, New Delhi, India",

            # Caribbean (CARICOM)
            "123 Hope Road, Kingston, Jamaica",
            "456 Queen Street, Port of Spain, Trinidad & Tobago",
            "789 Bay Street, Bridgetown, Barbados",
            "321 Independence Avenue, Kingston, Jamaica",
            "654 Frederick Street, Port of Spain, Trinidad & Tobago",
            "987 Broad Street, Bridgetown, Barbados",

            # Australia & Oceania
            "147 Collins Street, Melbourne, Australia",
            "258 George Street, Sydney, Australia",
            "369 Queen Street, Auckland, New Zealand",

            # South America
            "741 Copacabana, Rio de Janeiro, Brazil",
            "852 Palermo, Buenos Aires, Argentina",
            "963 Miraflores, Lima, Peru",

            # Africa
            "159 Long Street, Cape Town, South Africa",
            "357 Victoria Island, Lagos, Nigeria",
            "468 Zamalek, Cairo, Egypt",

            # Middle East
            "579 Downtown, Dubai, UAE",
            "681 Hamra, Beirut, Lebanon",
            "792 Abdoun, Amman, Jordan"
        ]
        
        # Order statuses
        statuses = ["pending", "processing", "shipped", "delivered", "cancelled"]
        status_weights = [0.3, 0.25, 0.25, 0.15, 0.05]  # Most orders pending/processing
        
        orders_created = 0
        
        print("🚀 Generating 50 additional orders...")
        
        for i in range(50):
            # Select random customer
            customer = random.choice(customers)
            
            # Generate order details
            num_items = random.randint(1, 4)  # 1-4 items per order
            selected_toys = random.sample(toy_categories, num_items)
            
            # Random dates (some past, some future)
            days_offset = random.randint(-30, 30)  # Orders from 30 days ago to 30 days future
            order_date = datetime.now() + timedelta(days=days_offset)
            delivery_date = order_date + timedelta(days=random.randint(1, 14))
            
            # Random status based on order date
            if order_date > datetime.now():
                status = "pending"  # Future orders are pending
            else:
                status = random.choices(statuses, weights=status_weights)[0]
            
            # Create the order
            order = Order(
                items=selected_toys,
                order_date=order_date,
                delivery_address=random.choice(shipping_addresses),
                delivery_date=delivery_date,
                status=status,
                customer_id=customer.id
            )
            
            db.add(order)
            orders_created += 1
            
            # Commit every 10 orders for better performance
            if orders_created % 10 == 0:
                db.commit()
                print(f"✅ Created {orders_created}/50 orders...")
        
        # Final commit
        db.commit()
        
        print(f"🎉 Successfully generated {orders_created} additional orders!")
        
        # Show summary statistics
        total_orders = db.query(Order).count()
        print(f"📈 Total orders in database: {total_orders}")
        
        # Show order status breakdown
        print("\n📊 Order Status Breakdown:")
        for status in statuses:
            count = db.query(Order).filter(Order.status == status).count()
            print(f"   {status.capitalize()}: {count} orders")
        
        # Show recent orders
        print("\n🔍 Sample of newly created orders:")
        recent_orders = db.query(Order).order_by(Order.id.desc()).limit(5).all()
        for order in recent_orders:
            customer_name = db.query(Customer).filter(Customer.id == order.customer_id).first().name
            print(f"   Order #{order.id}: {customer_name} - {len(order.items)} items - {order.status}")
        
    except Exception as e:
        print(f"❌ Error generating orders: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    generate_more_orders()
