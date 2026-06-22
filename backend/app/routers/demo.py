from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth.security import get_current_user
from app.database import get_db
from app.models.user import User
from app.services.demo_data_service import seed_demo_data

router = APIRouter(prefix="/demo", tags=["demo"])


@router.post("/seed")
def seed_current_user_demo_data(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return seed_demo_data(db, current_user.id)