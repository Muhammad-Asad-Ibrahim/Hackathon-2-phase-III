
import os
import json
from typing import Dict, Any, List, Optional
import google.generativeai as genai
from google.generativeai.types import GenerationConfig
from pydantic import BaseModel
import logging

# Configure logging
logger = logging.getLogger(__name__)

# Initialize the Gemini API client
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY environment variable is not set")
genai.configure(api_key=api_key)

# Set up the model
generation_config = GenerationConfig(
    temperature=0.1,
    top_p=0.95,
    top_k=40,
    max_output_tokens=1024,
)


class IntentExtractionResult(BaseModel):
    intent: str
    entities: List[Dict[str, Any]]
    confidence: float


class GeminiService:
    """
    Service class to interact with Google's Gemini API for natural language processing
    and intent/entity extraction.
    """
    
    def __init__(self):
        self.model = genai.GenerativeModel(
            model_name="gemini-pro",
            generation_config=generation_config,
        )
        
        # Define the tools that the AI can use
        self.tools = [
            {
                "name": "create_task",
                "description": "Create a new task with the provided details",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "title": {"type": "string", "description": "Title of the task"},
                        "description": {"type": "string", "description": "Detailed description of the task"},
                        "due_date": {"type": "string", "format": "date", "description": "Due date for the task"},
                        "status": {"type": "string", "enum": ["pending", "in-progress", "completed"]}
                    },
                    "required": ["title"]
                }
            },
            {
                "name": "update_task",
                "description": "Update an existing task with new details",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "task_id": {"type": "string", "description": "ID of the task to update"},
                        "title": {"type": "string", "description": "New title of the task"},
                        "description": {"type": "string", "description": "New description of the task"},
                        "due_date": {"type": "string", "format": "date", "description": "New due date for the task"},
                        "status": {"type": "string", "enum": ["pending", "in-progress", "completed"]}
                    },
                    "required": ["task_id"]
                }
            },
            {
                "name": "delete_task",
                "description": "Delete an existing task",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "task_id": {"type": "string", "description": "ID of the task to delete"}
                    },
                    "required": ["task_id"]
                }
            },
            {
                "name": "list_tasks",
                "description": "Retrieve a list of tasks based on filters",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "status": {"type": "string", "enum": ["pending", "in-progress", "completed", "all"]},
                        "limit": {"type": "integer", "minimum": 1, "maximum": 100},
                        "offset": {"type": "integer", "minimum": 0}
                    }
                }
            }
        ]

    async def extract_intent_and_entities(self, user_message: str) -> IntentExtractionResult:
        """
        Extract intent and entities from a user message using the Gemini API.

        Args:
            user_message: The natural language message from the user

        Returns:
            IntentExtractionResult containing the intent, entities, and confidence score
        """
        try:
            # Prepare the prompt for intent and entity extraction
            prompt = f"""
            Analyze the following user message and extract the intent and relevant entities:

            User message: "{user_message}"

            Available intents: CREATE_TASK, UPDATE_TASK, DELETE_TASK, LIST_TASKS

            Please respond in JSON format with the following structure:
            {{
                "intent": "...",
                "entities": [
                    {{
                        "type": "...",
                        "value": "...",
                        "confidence": 0.0-1.0
                    }}
                ],
                "confidence": 0.0-1.0
            }}

            For entity types, use: TITLE, DATE, STATUS, DESCRIPTION, TASK_ID, etc.

            Examples:
            - For "Create a task to buy groceries tomorrow": intent should be CREATE_TASK, entities: [{{"type": "TITLE", "value": "buy groceries", "confidence": 0.9}}, {{"type": "DATE", "value": "tomorrow", "confidence": 0.9}}]
            - For "Update the meeting task to next week": intent should be UPDATE_TASK, entities: [{{"type": "TITLE", "value": "meeting", "confidence": 0.8}}, {{"type": "DATE", "value": "next week", "confidence": 0.9}}]
            - For "Delete the doctor appointment task": intent should be DELETE_TASK, entities: [{{"type": "TITLE", "value": "doctor appointment", "confidence": 0.9}}]
            - For "Show me my tasks": intent should be LIST_TASKS
            """

            response = await self.model.generate_content_async(prompt)

            # Parse the response
            response_text = response.text.strip()

            # Remove any markdown formatting if present
            if response_text.startswith("```json"):
                response_text = response_text[7:]  # Remove ```json
            if response_text.endswith("```"):
                response_text = response_text[:-3]  # Remove ```

            result_data = json.loads(response_text)

            return IntentExtractionResult(**result_data)

        except Exception as e:
            logger.error(f"Error extracting intent and entities: {str(e)}")
            # Return a default result indicating an unrecognized intent
            return IntentExtractionResult(
                intent="UNKNOWN",
                entities=[],
                confidence=0.0
            )

    async def generate_response(self, user_message: str, chat_history: List[Dict[str, str]] = None) -> str:
        """
        Generate a natural language response to the user's message.
        
        Args:
            user_message: The message from the user
            chat_history: Previous messages in the conversation (for context)
            
        Returns:
            Generated response from the AI
        """
        try:
            # Prepare the conversation context
            history_context = ""
            if chat_history:
                history_context = "Previous conversation:\n"
                for msg in chat_history[-5:]:  # Use last 5 messages for context
                    sender = msg.get("sender", "User")
                    content = msg.get("content", "")
                    history_context += f"{sender}: {content}\n"
            
            prompt = f"""
            {history_context}
            
            User: {user_message}
            
            Please provide a helpful and concise response to the user's message.
            """
            
            response = await self.model.generate_content_async(prompt)
            return response.text.strip()
            
        except Exception as e:
            logger.error(f"Error generating response: {str(e)}")
            return "I'm sorry, I encountered an error processing your request."