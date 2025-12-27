from pgvector.sqlalchemy import Vector
from sqlalchemy import Column, Integer, Text, ForeignKey, UUID

from models.base import Base


class DocumentChunk(Base):
    __tablename__ = "document_chunks"
    id = Column(Integer, primary_key=True)
    pathway_id = Column(UUID(as_uuid=True), ForeignKey("pathway.id", ondelete="CASCADE"))
    content = Column(Text)
    # 384 matches your 'all-MiniLM-L6-v2' model dimensions
    embedding = Column(Vector(384))