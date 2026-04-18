from app.database import Base
from sqlalchemy import Column, DateTime, Integer, String, func

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)   
    created_at = Column(DateTime, nullable=False, server_default=func.now())



