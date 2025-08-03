#!/usr/bin/env python3
"""
Generate orders from customers worldwide for international shipping demonstration
"""

import sys
from pathlib import Path
from datetime import datetime, timedelta
import random

# Add the app directory to the path
sys.path.append(str(Path(__file__).resolve().parent / "app"))

from app.database import SessionLocal
from app.models import Customer, Order

def generate_global_orders():
    """Generate orders with global shipping addresses"""
    db = SessionLocal()
    
    try:
        # Get all existing customers
        customers = db.query(Customer).all()
        if not customers:
            print("❌ No customers found! Please run the seed script first.")
            return
        
        print(f"📊 Found {len(customers)} customers")
        
        # Enhanced toy categories
        toy_categories = [
            "Remote Control Trucks", "LEGO Creator Sets", "Electric Scooters",
            "Teddy Bears", "Barbie Dolls", "Play Kitchen Sets", "Jewelry Making Kits",
            "Action Figures", "Board Games", "Puzzles", "Art Supplies", "Building Blocks",
            "Musical Instruments", "Sports Equipment", "Science Kits", "Robot Toys",
            "Dress-up Costumes", "Toy Cars", "Dollhouses", "Train Sets",
            "Educational Tablets", "Outdoor Play Sets", "Craft Kits", "Magic Sets"
        ]
        
        # Global shipping addresses by region
        global_addresses = {
            "North America": [
                "123 Main Street, New York, NY, USA",
                "456 Maple Avenue, Toronto, ON, Canada",
                "789 Oak Drive, Los Angeles, CA, USA",
                "321 Pine Street, Vancouver, BC, Canada",
                "654 Broadway, Chicago, IL, USA",
                "987 5th Avenue, Miami, FL, USA"
            ],
            "Europe": [
                "147 Oxford Street, London, UK",
                "258 Champs-Élysées, Paris, France", 
                "369 Unter den Linden, Berlin, Germany",
                "741 Via del Corso, Rome, Italy",
                "852 Gran Vía, Madrid, Spain",
                "963 Dam Square, Amsterdam, Netherlands",
                "159 Piccadilly, Manchester, UK",
                "357 Rue de Rivoli, Lyon, France"
            ],
            "Asia": [
                "159 Shibuya, Tokyo, Japan",
                "357 Gangnam-gu, Seoul, South Korea", 
                "468 Orchard Road, Singapore",
                "579 Nathan Road, Hong Kong",
                "681 Nanjing Road, Shanghai, China",
                "792 Connaught Place, New Delhi, India",
                "147 Sukhumvit Road, Bangkok, Thailand",
                "258 Makati Avenue, Manila, Philippines"
            ],
            "Caribbean (CARICOM)": [
                "123 Hope Road, Kingston, Jamaica",
                "456 Queen Street, Port of Spain, Trinidad & Tobago",
                "789 Bay Street, Bridgetown, Barbados",
                "321 Independence Avenue, Kingston, Jamaica",
                "654 Frederick Street, Port of Spain, Trinidad & Tobago",
                "987 Broad Street, Bridgetown, Barbados",
                "147 Bay Street, Nassau, Bahamas",
                "258 Church Street, St. George's, Grenada"
            ],
            "Australia & Oceania": [
                "147 Collins Street, Melbourne, Australia",
                "258 George Street, Sydney, Australia", 
                "369 Queen Street, Auckland, New Zealand",
                "741 Flinders Street, Adelaide, Australia"
            ],
            "South America": [
                "741 Copacabana, Rio de Janeiro, Brazil",
                "852 Palermo, Buenos Aires, Argentina",
                "963 Miraflores, Lima, Peru",
                "159 Zona Rosa, Bogotá, Colombia"
            ],
            "Africa": [
                "159 Long Street, Cape Town, South Africa",
                "357 Victoria Island, Lagos, Nigeria",
                "468 Zamalek, Cairo, Egypt",
                "579 Sandton, Johannesburg, South Africa"
            ],
            "Middle East": [
                "579 Downtown, Dubai, UAE",
                "681 Hamra, Beirut, Lebanon", 
                "792 Abdoun, Amman, Jordan",
                "147 Doha City, Doha, Qatar"
            ]
        }
        
        # Flatten all addresses
        all_addresses = []
        for region, addresses in global_addresses.items():
            all_addresses.extend(addresses)
        
        # Order statuses
        statuses = ["pending", "processing", "shipped", "delivered", "cancelled"]
        status_weights = [0.3, 0.25, 0.25, 0.15, 0.05]
        
        orders_created = 0
        
        print("🌍 Generating 75 orders from customers worldwide...")
        
        for i in range(75):
            # Select random customer
            customer = random.choice(customers)
            
            # Generate order details
            num_items = random.randint(1, 4)
            selected_toys = random.sample(toy_categories, num_items)
            
            # Random dates
            days_offset = random.randint(-45, 15)
            order_date = datetime.now() + timedelta(days=days_offset)
            delivery_date = order_date + timedelta(days=random.randint(3, 21))  # International shipping takes longer
            
            # Random status based on order date
            if order_date > datetime.now():
                status = "pending"
            else:
                status = random.choices(statuses, weights=status_weights)[0]
            
            # Select random global address
            shipping_address = random.choice(all_addresses)
            
            # Create the order
            order = Order(
                items=selected_toys,
                order_date=order_date,
                delivery_address=shipping_address,
                delivery_date=delivery_date,
                status=status,
                customer_id=customer.id
            )
            
            db.add(order)
            orders_created += 1
            
            # Commit every 15 orders
            if orders_created % 15 == 0:
                db.commit()
                print(f"✅ Created {orders_created}/75 orders...")
        
        # Final commit
        db.commit()
        
        print(f"🎉 Successfully generated {orders_created} global orders!")
        
        # Show summary statistics
        total_orders = db.query(Order).count()
        print(f"📈 Total orders in database: {total_orders}")
        
        # Show regional distribution
        print("\n🌍 Regional Distribution of Recent Orders:")
        recent_orders = db.query(Order).order_by(Order.id.desc()).limit(50).all()
        
        region_counts = {}
        for order in recent_orders:
            address = order.delivery_address
            # Simple region detection based on country/city
            if any(country in address for country in ["USA", "Canada"]):
                region = "North America"
            elif any(country in address for country in ["UK", "France", "Germany", "Italy", "Spain", "Netherlands"]):
                region = "Europe"
            elif any(country in address for country in ["Japan", "Korea", "Singapore", "Hong Kong", "China", "India", "Thailand", "Philippines"]):
                region = "Asia"
            elif any(country in address for country in ["Jamaica", "Trinidad", "Barbados", "Bahamas", "Grenada"]):
                region = "Caribbean"
            elif any(country in address for country in ["Australia", "New Zealand"]):
                region = "Australia & Oceania"
            elif any(country in address for country in ["Brazil", "Argentina", "Peru", "Colombia"]):
                region = "South America"
            elif any(country in address for country in ["South Africa", "Nigeria", "Egypt"]):
                region = "Africa"
            elif any(country in address for country in ["UAE", "Lebanon", "Jordan", "Qatar"]):
                region = "Middle East"
            else:
                region = "Other"
            
            region_counts[region] = region_counts.get(region, 0) + 1
        
        for region, count in sorted(region_counts.items(), key=lambda x: x[1], reverse=True):
            print(f"   {region}: {count} orders")
        
    except Exception as e:
        print(f"❌ Error generating global orders: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    generate_global_orders()
