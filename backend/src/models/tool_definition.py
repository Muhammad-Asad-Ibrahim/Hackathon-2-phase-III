from sqlalchemy import Column, String, DateTime, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from ..database import Base


class ToolDefinition(Base):
    __tablename__ = "tool_definitions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), unique=True, nullable=False)  # Unique identifier for the tool
    description = Column(Text, nullable=True)  # What the tool does
    input_schema = Column(JSON, nullable=False)  # JSON Schema defining the expected input
    output_schema = Column(JSON, nullable=False)  # JSON Schema defining the expected output
    endpoint_mapping = Column(String(255), nullable=False)  # Which existing API endpoint this tool maps to
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    def __repr__(self):
        return f"<ToolDefinition(id={self.id}, name={self.name})>"