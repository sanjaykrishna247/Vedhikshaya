"""Seed demo + admin accounts for quick testing / hackathon demos.

Usage:
    python -m app.seed
"""

from . import auth as auth_utils
from . import models
from .database import Base, SessionLocal, engine

ACCOUNTS = [
    ("Demo User", "demo@vedikshaya.com", "demo1234"),
    ("Admin", "admin@vedikshaya.com", "admin1234"),
]


def seed_accounts() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        for name, email, password in ACCOUNTS:
            if db.query(models.User).filter(models.User.email == email).first():
                print(f"Already exists: {email}")
                continue
            db.add(
                models.User(
                    name=name,
                    email=email,
                    hashed_password=auth_utils.hash_password(password),
                )
            )
            db.commit()
            print(f"Created: {email} / {password}")
    finally:
        db.close()


if __name__ == "__main__":
    seed_accounts()
