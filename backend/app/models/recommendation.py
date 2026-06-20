from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    UniqueConstraint,
    func,
)

from app.database import Base


class Recommendation(Base):
    __tablename__ = "recommendations"

    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "product_id",
            name="uq_recommendations_user_product",
        ),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    recommended_quantity = Column(Numeric(10, 2), nullable=False)
    reason = Column(String, nullable=False)
    created_at = Column(DateTime, nullable=False, server_default=func.now())