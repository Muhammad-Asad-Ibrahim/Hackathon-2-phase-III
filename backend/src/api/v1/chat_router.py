from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from typing import Optional
from sqlalchemy.orm import Session
import uuid
from src.database import get_db
from src.models.user import User
from src.services.auth import get_current_user
from src.services.gemini_service import GeminiService
from src.services.chat_service import ChatService
from src.services.tool_execution_service import ToolExecutionService


router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/")
async def process_chat_message(
    message: str,
    session_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Process a user's natural language message and return an AI-generated response.

    Request:
    {
      "message": "Create a task to buy groceries tomorrow",
      "session_id": "uuid-string" (optional, creates new session if not provided)
    }

    Response:
    {
      "response": "I've created a task 'buy groceries' for tomorrow.",
      "session_id": "uuid-string",
      "intent": "CREATE_TASK",
      "entities": [
        {
          "type": "TITLE",
          "value": "buy groceries",
          "confidence": 0.95
        },
        {
          "type": "DATE",
          "value": "2026-02-09",
          "confidence": 0.87
        }
      ],
      "tool_used": "create_task",
      "tool_result": {
        "success": true,
        "task_id": "uuid-string"
      }
    }
    """
    try:
        # Initialize services
        gemini_service = GeminiService()
        tool_service = ToolExecutionService(db)
        chat_service = ChatService(db, gemini_service)

        # Create or get session
        if session_id:
            chat_session = db.query(chat_service.ChatSession).filter(
                chat_service.ChatSession.id == uuid.UUID(session_id)
            ).first()
            if not chat_session:
                raise HTTPException(status_code=404, detail="Chat session not found")
        else:
            chat_session = chat_service.create_or_get_session(str(current_user.id))

        # Extract intent and entities from the user message
        extraction_result = await gemini_service.extract_intent_and_entities(message)

        # Add the user message to the session
        user_message_obj = chat_service.add_user_message(str(chat_session.id), message)

        # Initialize response variables
        tool_used = None
        tool_result = None

        # If the intent corresponds to a tool, execute it
        if extraction_result.intent in ["CREATE_TASK", "UPDATE_TASK", "DELETE_TASK", "LIST_TASKS"]:
            # Map intent to tool name
            intent_to_tool = {
                "CREATE_TASK": "create_task",
                "UPDATE_TASK": "update_task",
                "DELETE_TASK": "delete_task",
                "LIST_TASKS": "list_tasks"
            }

            tool_name = intent_to_tool.get(extraction_result.intent)
            if tool_name:
                # Prepare arguments for the tool based on extracted entities
                tool_args = {}
                for entity in extraction_result.entities:
                    entity_type_lower = entity["type"].lower()
                    if entity_type_lower == "task_id":
                        tool_args["task_id"] = entity["value"]
                    elif entity_type_lower == "title":
                        tool_args["title"] = entity["value"]
                    elif entity_type_lower == "description":
                        tool_args["description"] = entity["value"]
                    elif entity_type_lower == "date":
                        tool_args["due_date"] = entity["value"]
                    elif entity_type_lower == "status":
                        tool_args["status"] = entity["value"]

                # Execute the tool
                tool_result = tool_service.execute_tool(
                    tool_name,
                    tool_args,
                    auth_token=getattr(current_user, 'token', None)  # Use the current user's token if available
                )
                tool_used = tool_name

                # Save the extracted entities to the database
                chat_service.save_extracted_entities(str(user_message_obj.id), extraction_result.entities)

        # Generate a response using Gemini based on the tool result
        if tool_result and tool_result.get("success"):
            # Generate a response based on the successful tool execution
            response_msg = f"The {extraction_result.intent.lower().replace('_', ' ')} operation was successful. Result: {tool_result.get('message', 'Operation completed')}"
            ai_response = await gemini_service.generate_response(response_msg)
        else:
            # Generate a response based on the original message
            recent_messages = chat_service.get_session_messages(str(chat_session.id), limit=5)
            chat_history = [
                {"sender": msg.sender_type, "content": msg.content}
                for msg in recent_messages
            ]
            ai_response = await gemini_service.generate_response(message, chat_history)

        # Add the AI message to the session
        ai_message_obj = chat_service.add_ai_message(
            str(chat_session.id),
            ai_response,
            tool_used=tool_used,
            tool_result=tool_result
        )

        # Prepare the response
        response_data = {
            "response": ai_response,
            "session_id": str(chat_session.id),
            "intent": extraction_result.intent,
            "entities": extraction_result.entities,
            "tool_used": tool_used,
            "tool_result": tool_result
        }

        return response_data

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing chat message: {str(e)}")


@router.get("/sessions")
async def get_user_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieves a list of chat sessions for the authenticated user.
    
    Response:
    {
      "sessions": [
        {
          "id": "uuid-string",
          "title": "Grocery tasks",
          "created_at": "2026-02-08T10:30:00Z",
          "updated_at": "2026-02-08T11:45:00Z",
          "status": "ACTIVE"
        }
      ]
    }
    """
    try:
        # Initialize services
        gemini_service = GeminiService()
        tool_service = ToolExecutionService(db)
        chat_service = ChatService(db, gemini_service)
        
        # Get user sessions
        sessions = chat_service.get_user_sessions(str(current_user.id))
        
        # Format the response
        sessions_data = []
        for session in sessions:
            sessions_data.append({
                "id": str(session.id),
                "title": session.title,
                "created_at": session.created_at.isoformat() if session.created_at else None,
                "updated_at": session.updated_at.isoformat() if session.updated_at else None,
                "status": session.status
            })
        
        return {"sessions": sessions_data}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving chat sessions: {str(e)}")


@router.get("/session/{session_id}/messages")
async def get_session_messages(
    session_id: str,
    limit: int = 50,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieves messages for a specific chat session.
    
    Response:
    {
      "messages": [
        {
          "id": "uuid-string",
          "sender_type": "USER",
          "content": "Create a task to buy groceries tomorrow",
          "timestamp": "2026-02-08T10:30:00Z",
          "metadata": {
            "intent": "CREATE_TASK",
            "entities": [
              {"type": "TITLE", "value": "buy groceries", "confidence": 0.95},
              {"type": "DATE", "value": "2026-02-09", "confidence": 0.87}
            ]
          }
        }
      ]
    }
    """
    try:
        # Initialize services
        gemini_service = GeminiService()
        tool_service = ToolExecutionService(db)
        chat_service = ChatService(db, gemini_service)
        
        # Get session messages
        messages = chat_service.get_session_messages(session_id, limit, offset)
        
        # Format the response
        messages_data = []
        for message in messages:
            messages_data.append({
                "id": str(message.id),
                "sender_type": message.sender_type,
                "content": message.content,
                "timestamp": message.timestamp.isoformat() if message.timestamp else None,
                "metadata": message.metadata_json
            })
        
        return {"messages": messages_data}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving session messages: {str(e)}")