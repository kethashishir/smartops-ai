from app.database import Base
from sqlalchemy import Column, Date, Integer, ForeignKey, String, Numeric

class Forecast(Base):
    __tablename__ = "forecasts"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    forecast_date = Column(Date, nullable=False)
    predicted_demand = Column(Numeric(10, 2), nullable=False)
    model_version = Column(String, nullable=False)
