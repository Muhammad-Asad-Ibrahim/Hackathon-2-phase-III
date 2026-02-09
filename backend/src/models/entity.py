from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Float
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from ..database import Base


class Entity(Base):
    __tablename__ = "entities"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    entity_type = Column(String(50), nullable=False)  # TITLE, DATE, STATUS, DESCRIPTION, etc.
    value = Column(Text, nullable=False)
    confidence_score = Column(Float)  # Confidence in the extraction, 0.0-1.0
    chat_message_id = Column(UUID(as_uuid=True), ForeignKey("chat_messages.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<Entity(id={self.id}, type={self.entity_type}, value={self.value})>"