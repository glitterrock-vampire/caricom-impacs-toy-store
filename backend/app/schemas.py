from typing import Dict, List, Tuple, Optional
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime

# -----------------------
# Authentication schemas
# -----------------------

class Token(BaseModel):
    access_token: str
    token_type: str

class UserBase(BaseModel):
    email: EmailStr
    name: str
    telephone: str
    role: str

class UserCreate(UserBase):
    password: str                          # plain text; will be hashed before storage

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    name: str
    telephone: str
    role: str
    is_active: bool
    
    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: str
    password: str

# -----------------------
# Customer schemas
# -----------------------

class CustomerBase(BaseModel):
    name: str
    email: EmailStr
    phone: str
    user_id: int

class CustomerCreate(CustomerBase):
    pass

class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None

class CustomerResponse(CustomerBase):
    id: int

    class Config:
        from_attributes = True

# -----------------------
# Order schemas
# -----------------------

class OrderBase(BaseModel):
    items: List[str]  # Changed to List[str] to match database
    delivery_address: str
    order_date: datetime  # Changed to datetime to match database
    delivery_date: datetime  # Changed to datetime to match database
    status: str
    customer_id: int

class OrderCreate(OrderBase):
    pass

class OrderResponse(OrderBase):
    id: int

    class Config:
        from_attributes = True



# -----------------------
# Dashboard schemas
# -----------------------

class PopularToy(BaseModel):
    toy_name: str
    count: int

class ShippingCountry(BaseModel):
    country: str
    count: int

class WeeklyOrderData(BaseModel):
    day: str
    orders: int

class DashboardStatsResponse(BaseModel):
    total_customers: int
    total_orders: int
    total_revenue: float = 0.0
    orders_by_day: Dict[str, int] = Field(default_factory=dict)
    popular_toys: List[PopularToy] = Field(default_factory=list)
    top_shipping_countries: List[ShippingCountry] = Field(default_factory=list)
    avg_order_value: Optional[float] = None
    new_customers_this_week: int = 0

class SalesTrend(BaseModel):
    period: str
    sales: float

class DashboardSalesTrends(BaseModel):
    trends: List[SalesTrend]
