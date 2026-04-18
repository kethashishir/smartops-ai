from app.database import Base
from sqlalchemy import Column, DateTime, Integer, String, ForeignKey, func, CheckConstraint

class Order(Base):
    __tablename__ = "orders"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    order_time = Column(DateTime, nullable=False, server_default=func.now())
    source = Column(String, nullable=False)

    __table_args__ = (
        CheckConstraint('quantity > 0', name='check_quantity_positive'),
    )
