from app.database import Base
from sqlalchemy import Column, DateTime, Integer, String, func, Numeric

class Product(Base):
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    sku = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    reorder_threshold = Column(Integer, nullable=False)
    unit_price = Column(Numeric(10, 2), nullable=False) 
    created_at = Column(DateTime, nullable=False, server_default=func.now())