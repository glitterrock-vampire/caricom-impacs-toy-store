from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON, Boolean  # Added Boolean here
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    name = Column(String)
    telephone = Column(String)
    role = Column(String, default="user")
    hashed_password = Column(String)
    is_admin = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    customers = relationship("Customer", back_populates="owner")

class Customer(Base):
    __tablename__ = "customers"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    phone = Column(String)
    hashed_password = Column(String)  # Add customer password
    user_id = Column(Integer, ForeignKey("users.id"))
    
    owner = relationship("User", back_populates="customers")
    orders = relationship("Order", back_populates="customer")

class Order(Base):
    __tablename__ = "orders"
    
    id = Column(Integer, primary_key=True, index=True)
    items = Column(JSON)  # List of dicts with toy info
    order_date = Column(DateTime)  # Note: not order_date_time
    delivery_address = Column(JSON)  # Dict with address components
    delivery_date = Column(DateTime)
    status = Column(String)
    customer_id = Column(Integer, ForeignKey("customers.id"))
    
    customer = relationship("Customer", back_populates="orders")
    
