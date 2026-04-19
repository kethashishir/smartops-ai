from app.database import Base
from sqlalchemy import Column, DateTime, Integer, ForeignKey, String, Numeric, func

class Recommendation(Base):
    __tablename__ = "recommendations"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    recommended_quantity = Column(Numeric(10,2), nullable=False)
    reason = Column(String, nullable=False)
    created_at = Column(DateTime, nullable=False, server_default=func.now())