from datetime import datetime, timedelta, timezone
import os

from jose import jwt
from pwdlib import PasswordHash


SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-this")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

password_hash = PasswordHash.recommended()


def hash_password(password: str) -> str:
    return password_hash.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return password_hash.verify(plain_password, hashed_password)


def create_access_token(data: dict) -> str:
    to_encode = data.copy()

    expires_at = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    to_encode.update({"exp": expires_at})

    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)