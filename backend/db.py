import os
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base

BASE_DIR = Path(__file__).resolve().parent
SQLITE_PATH = BASE_DIR / "study_assistant.db"
DATABASE_URL = f"sqlite:///{SQLITE_PATH}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db():
    if not SQLITE_PATH.exists():
        Base.metadata.create_all(bind=engine)
    else:
        Base.metadata.create_all(bind=engine)
