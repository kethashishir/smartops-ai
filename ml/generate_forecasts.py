import os
import sys

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker


PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
BACKEND_PATH = os.path.join(PROJECT_ROOT, "backend")

if BACKEND_PATH not in sys.path:
    sys.path.append(BACKEND_PATH)

from app.services.forecast_service import generate_baseline_forecasts


def get_database_url():
    load_dotenv(os.path.join(PROJECT_ROOT, ".env"))

    database_url = os.getenv("DATABASE_URL")

    if not database_url:
        raise ValueError("DATABASE_URL is not set")

    return database_url


def main():
    database_url = get_database_url()

    engine = create_engine(database_url, echo=False)
    Session = sessionmaker(bind=engine)

    with Session() as session:
        result = generate_baseline_forecasts(session)

    print(
        f"Forecast generation complete using {result['model_version']}. "
        f"Created: {result['created_count']}. "
        f"Updated: {result['updated_count']}."
    )


if __name__ == "__main__":
    main()