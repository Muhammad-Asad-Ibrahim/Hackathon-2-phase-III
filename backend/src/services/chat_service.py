from typing import List, Optional, Dict, Any
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import and_, desc
import uuid
from ..models.chat_session import ChatSession
from ..models.chat_message import ChatMessage
from ..models.entity import Entity
from ..models.tool_definition import ToolDefinition
from .gemini_service import GeminiService, IntentExtractionResult


class ChatService:
    """
    Service class to handle chat-related operations including session management,
    message handling, and integration with the Gemini service.
    """
    
    def __init__(self, db_session: Session, gemini_service: GeminiService):
        self.db = db_session
        self.gemini_service = gemini_service
    
    def create_or_get_session(self, user_id: str) -> ChatSession:
        """
        Create a new chat session or get an active one for the user.
        
        Args:
            user_id: The ID of the user
            
        Returns:
            The ChatSession object
        """
        # Try to find an active session for the user
        active_session = self.db.query(ChatSession).filter(
            and_(
                ChatSession.user_id == uuid.UUID(user_id),
                ChatSession.status == 'ACTIVE'
            )
        ).first()
        
        if active_session:
            return active_session
        
        # Create a new session if no active session exists
        new_session = ChatSession(
            user_id=uuid.UUID(user_id),
            title="New Chat",
            status="ACTIVE"
        )
        self.db.add(new_session)
        self.db.commit()
        self.db.refresh(new_session)
        
        return new_session
    
    def add_user_message(self, session_id: str, content: str) -> ChatMessage:
        """
        Add a user message to the chat session.
        
        Args:
            session_id: The ID of the chat session
            content: The content of the message
            
        Returns:
            The created ChatMessage object
        """
        message = ChatMessage(
            session_id=uuid.UUID(session_id),
            sender_type="USER",
            content=content
        )
        self.db.add(message)
        self.db.commit()
        self.db.refresh(message)
        
        return message
    
    def add_ai_message(self, session_id: str, content: str, tool_used: Optional[str] = None, 
                      tool_result: Optional[Dict[str, Any]] = None) -> ChatMessage:
        """
        Add an AI-generated message to the chat session.
        
        Args:
            session_id: The ID of the chat session
            content: The content of the AI's response
            tool_used: Name of the tool that was used (if any)
            tool_result: Result from the tool execution (if any)
            
        Returns:
            The created ChatMessage object
        """
        metadata = {}
        if tool_used:
            metadata["tool_used"] = tool_used
        if tool_result:
            metadata["tool_result"] = tool_result
            
        message = ChatMessage(
            session_id=uuid.UUID(session_id),
            sender_type="AI",
            content=content,
            metadata_json=metadata
        )
        self.db.add(message)
        self.db.commit()
        self.db.refresh(message)
        
        return message
    
    def get_session_messages(self, session_id: str, limit: int = 50, offset: int = 0) -> List[ChatMessage]:
        """
        Retrieve messages from a specific chat session.
        
        Args:
            session_id: The ID of the chat session
            limit: Maximum number of messages to return
            offset: Number of messages to skip
            
        Returns:
            List of ChatMessage objects
        """
        messages = self.db.query(ChatMessage).filter(
            ChatMessage.session_id == uuid.UUID(session_id)
        ).order_by(desc(ChatMessage.timestamp)).offset(offset).limit(limit).all()
        
        return messages[::-1]  # Reverse to get chronological order
    
    def get_user_sessions(self, user_id: str) -> List[ChatSession]:
        """
        Retrieve all chat sessions for a specific user.
        
        Args:
            user_id: The ID of the user
            
        Returns:
            List of ChatSession objects
        """
        sessions = self.db.query(ChatSession).filter(
            ChatSession.user_id == uuid.UUID(user_id)
        ).order_by(desc(ChatSession.updated_at)).all()
        
        return sessions
    
    async def process_user_message(self, session_id: str, user_message: str) -> str:
        """
        Process a user message through the Gemini service and return an AI response.
        
        Args:
            session_id: The ID of the chat session
            user_message: The message from the user
            
        Returns:
            The AI-generated response
        """
        # Extract intent and entities from the user message
        extraction_result = await self.gemini_service.extract_intent_and_entities(user_message)
        
        # Add the user message to the session
        self.add_user_message(session_id, user_message)
        
        # Get recent chat history for context
        recent_messages = self.get_session_messages(session_id, limit=5)
        chat_history = [
            {"sender": msg.sender_type, "content": msg.content}
            for msg in recent_messages
        ]
        
        # Generate a response using Gemini
        ai_response = await self.gemini_service.generate_response(user_message, chat_history)
        
        # Add the AI message to the session
        self.add_ai_message(session_id, ai_response)
        
        return ai_response
    
    def save_extracted_entities(self, message_id: str, entities: List[Dict[str, Any]]) -> None:
        """
        Save extracted entities to the database.
        
        Args:
            message_id: The ID of the message that contains these entities
            entities: List of entity dictionaries
        """
        for entity_data in entities:
            entity = Entity(
                entity_type=entity_data.get("type"),
                value=entity_data.get("value"),
                confidence_score=entity_data.get("confidence"),
                chat_message_id=uuid.UUID(message_id)
            )
            self.db.add(entity)
        
        self.db.commit()