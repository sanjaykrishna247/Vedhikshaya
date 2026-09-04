"""Seed a demo account for quick testing / hackathon demos.

Usage:
    python -m app.seed
"""

from . import auth as auth_utils
from . import models
from .database import Base, SessionLocal, engine

DEMO_EMAIL = "demo@vedikshaya.com"
DEMO_PASSWORD = "demo1234"
DEMO_NAME = "Demo User"


def seed_demo_user() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        existing = db.query(models.User).filter(models.User.email == DEMO_EMAIL).first()
        if existing:
            print(f"Demo user already exists: {DEMO_EMAIL}")
            return

        user = models.User(
            name=DEMO_NAME,
            email=DEMO_EMAIL,
            hashed_password=auth_utils.hash_password(DEMO_PASSWORD),
        )
        db.add(user)
        db.commit()
        print(f"Created demo user: {DEMO_EMAIL} / {DEMO_PASSWORD}")
    finally:
        db.close()


if __name__ == "__main__":
    seed_demo_user()
