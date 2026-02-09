# Data Model for AI-Powered Chatbot with Gemini Integration

## Entities

### ChatMessage
Represents a single message in the chat history, containing user input and system response, with timestamp and associated user context.

- **id**: UUID (Primary Key)
- **session_id**: UUID (Foreign Key to ChatSession)
- **sender_type**: Enum (USER, SYSTEM, AI)
- **content**: Text (The actual message content)
- **timestamp**: DateTime (When the message was created)
- **metadata**: JSONB (Additional data like intent, entities extracted)
- **created_at**: DateTime
- **updated_at**: DateTime

### ChatSession
Represents a conversation context that maintains the state between the user and the AI chatbot, linking related messages.

- **id**: UUID (Primary Key)
- **user_id**: UUID (Foreign Key to User - from existing auth system)
- **title**: String (Generated title for the conversation)
- **status**: Enum (ACTIVE, ARCHIVED, DELETED)
- **created_at**: DateTime
- **updated_at**: DateTime

### Intent
Represents the action the user wants to perform (create, update, delete, list), extracted from natural language input.

- **id**: UUID (Primary Key)
- **name**: String (CREATE_TASK, UPDATE_TASK, DELETE_TASK, LIST_TASKS)
- **description**: Text (Human-readable description of the intent)

### Entity
Represents specific data elements extracted from user input (such as task title, date, status) that are needed to execute the intent.

- **id**: UUID (Primary Key)
- **entity_type**: String (TITLE, DATE, STATUS, DESCRIPTION, etc.)
- **value**: String (The actual extracted value)
- **confidence_score**: Float (Confidence in the extraction, 0.0-1.0)
- **chat_message_id**: UUID (Foreign Key to ChatMessage)

### ToolDefinition
Represents the MCP-style tools (create_task, update_task, delete_task, list_tasks) that serve as intermediaries between the AI and the existing API endpoints.

- **id**: UUID (Primary Key)
- **name**: String (Unique identifier for the tool)
- **description**: Text (What the tool does)
- **input_schema**: JSON (JSON Schema defining the expected input)
- **output_schema**: JSON (JSON Schema defining the expected output)
- **endpoint_mapping**: String (Which existing API endpoint this tool maps to)
- **created_at**: DateTime
- **updated_at**: DateTime

## Relationships

- ChatSession (1) → ChatMessage (Many): A chat session contains many messages
- ChatMessage (1) → Entity (Many): A message can have multiple extracted entities
- ChatMessage (1) → Intent (1): A message corresponds to one intent
- ToolDefinition (1) → ChatMessage (Many): A tool can be invoked by many messages (indirectly through the AI's decision to use the tool)

## Validation Rules

- ChatMessage.content must not be empty
- ChatSession.user_id must reference a valid user in the existing user table
- Entity.entity_type must be one of the predefined types
- Entity.confidence_score must be between 0.0 and 1.0
- ChatMessage.sender_type must be one of USER, SYSTEM, or AI
- ChatSession.status must be one of ACTIVE, ARCHIVED, or DELETED