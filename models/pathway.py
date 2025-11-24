import enum
import uuid
from datetime import datetime
from uuid import UUID

from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Integer, DateTime, ForeignKey, Enum as SQLEnum
from models.base import Base

class EmbeddingStatus(enum.Enum):
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

class Pathway(Base):
    __tablename__ = "pathway"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, index=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String, nullable=False)
    created: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    updated: Mapped[datetime] = mapped_column(DateTime, default=datetime.now, onupdate=datetime.now)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("user.id"), nullable=False)

    embedding_status: Mapped[EmbeddingStatus] = mapped_column(SQLEnum(EmbeddingStatus), default=EmbeddingStatus.PENDING)

    user = relationship("User", back_populates="pathways")
    topics = relationship("Topic", back_populates="pathway", cascade="all, delete-orphan")
