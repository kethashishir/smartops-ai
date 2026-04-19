import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, DeclarativeBase

class Base(DeclarativeBase):
    pass

load_dotenv()
database_url = os.getenv("DATABASE_URL")

if not database_url:
    raise ValueError("DATABASE_URL is not set")

engine = create_engine(
    database_url, 
    echo=False  # Set to True if you ever need to debug the raw SQL
)

SessionFactory = sessionmaker(
    bind=engine,
    autocommit=False,       # Prevents automatic transaction starts
    autoflush=False,         # Standard for FastAPI to avoid early flushes
    expire_on_commit=False,  # Essential for keeping objects usable after commit
)

def test_connection():
    # Create the session from our factory
    with SessionFactory() as session:
        # Use scalar() to get the first result of the first row directly
        version = session.scalar(text("SELECT version();"))
        
        if not version:     
            print("Connection failed: No version returned.")
            return

        print(f"Connection successful! {version}")

def get_db():
    db = SessionFactory()
    try:
        yield db
    finally:
        db.close()

if __name__ == "__main__":
    test_connection()