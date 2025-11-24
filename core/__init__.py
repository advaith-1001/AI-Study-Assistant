from sqlmodel import SQLModel
from .db import engine

def init_db():
    SQLModel.metadata.create_all(bind=engine)