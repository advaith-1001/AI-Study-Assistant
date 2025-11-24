import uuid
from datetime import datetime
from typing import Optional, List

from sqlalchemy import Enum as SQLEnum

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship, Mapped, mapped_column
from models.base import Base
from models.enums import Status


class Topic(Base):
    __tablename__ = "topic"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String)
    order_number: Mapped[int] = mapped_column(Integer)
    status: Mapped[Status] = mapped_column(SQLEnum(Status), default=Status.PENDING)  # or use Enum
    completed: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)  # ✅ make nullable
    keywords: Mapped[List[str]] = mapped_column(JSON, nullable=True)
    pathway_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("pathway.id"), nullable=False)

    pathway = relationship("Pathway", back_populates="topics")
