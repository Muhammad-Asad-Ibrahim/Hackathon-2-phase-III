# Quickstart Guide: AI-Powered Chatbot with Gemini Integration

## Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL (Neon) database
- Google Gemini API key
- Existing Phase 2 Todo app deployed

## Setup

### 1. Environment Variables

Add these to your backend environment:

```bash
# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key_here

# Database (should already be configured from Phase 2)
DATABASE_URL=postgresql://...
```

### 2. Install Dependencies

Backend (FastAPI):

```bash
pip install google-generativeai
```

### 3. Database Migrations

Run the migrations to create the new tables for chat functionality:

```sql
-- Create chat_sessions table
CREATE TABLE chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),  -- From existing auth system
    title VARCHAR(255),
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ARCHIVED', 'DELETED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat_messages table
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES chat_sessions(id),
    sender_type VARCHAR(10) NOT NULL CHECK (sender_type IN ('USER', 'SYSTEM', 'AI')),
    content TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create entities table
CREATE TABLE entities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(50) NOT NULL,
    value TEXT NOT NULL,
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),
    chat_message_id UUID NOT NULL REFERENCES chat_messages(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tool_definitions table
CREATE TABLE tool_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    input_schema JSONB NOT NULL,
    output_schema JSONB NOT NULL,
    endpoint_mapping VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4. Initialize Tool Definitions

Insert the initial tool definitions into the `tool_definitions` table:

```sql
INSERT INTO tool_definitions (name, description, input_schema, output_schema, endpoint_mapping) VALUES
('create_task', 'Create a new task with the provided details', 
'{"type": "object", "properties": {"title": {"type": "string", "description": "Title of the task"}, "description": {"type": "string", "description": "Detailed description of the task"}, "due_date": {"type": "string", "format": "date", "description": "Due date for the task"}, "status": {"type": "string", "enum": ["pending", "in-progress", "completed"]}}, "required": ["title"]}',
'{"type": "object", "properties": {"success": {"type": "boolean"}, "task_id": {"type": "string", "description": "ID of the created task"}, "message": {"type": "string", "description": "Result message"}}}',
'/api/tasks'),

('update_task', 'Update an existing task with new details',
'{"type": "object", "properties": {"task_id": {"type": "string", "description": "ID of the task to update"}, "title": {"type": "string", "description": "New title of the task"}, "description": {"type": "string", "description": "New description of the task"}, "due_date": {"type": "string", "format": "date", "description": "New due date for the task"}, "status": {"type": "string", "enum": ["pending", "in-progress", "completed"]}}, "required": ["task_id"]}',
'{"type": "object", "properties": {"success": {"type": "boolean"}, "message": {"type": "string", "description": "Result message"}}}',
'/api/tasks/{task_id}'),

('delete_task', 'Delete an existing task',
'{"type": "object", "properties": {"task_id": {"type": "string", "description": "ID of the task to delete"}}, "required": ["task_id"]}',
'{"type": "object", "properties": {"success": {"type": "boolean"}, "message": {"type": "string", "description": "Result message"}}}',
'/api/tasks/{task_id}'),

('list_tasks', 'Retrieve a list of tasks based on filters',
'{"type": "object", "properties": {"status": {"type": "string", "enum": ["pending", "in-progress", "completed", "all"]}, "limit": {"type": "integer", "minimum": 1, "maximum": 100}, "offset": {"type": "integer", "minimum": 0}}}',
'{"type": "object", "properties": {"success": {"type": "boolean"}, "tasks": {"type": "array", "items": {"type": "object", "properties": {"id": {"type": "string"}, "title": {"type": "string"}, "description": {"type": "string"}, "due_date": {"type": "string", "format": "date"}, "status": {"type": "string"}}}}, "total_count": {"type": "integer"}}}',
'/api/tasks');
```

## Running the Application

### Backend

The new chatbot endpoints will be available alongside your existing FastAPI routes:

- `POST /api/chat` - Main chat endpoint
- `GET /api/chat/sessions` - Get user's chat sessions
- `GET /api/chat/session/{session_id}/messages` - Get messages in a session
- `GET /api/tools` - Get available tools for the AI

### Frontend

Add the chat UI component to your Next.js application:

1. Create a new page or integrate into an existing one
2. Use the chat API endpoints to communicate with the backend
3. Implement WebSocket connection for real-time chat if needed

## Testing

### Unit Tests

```python
def test_chat_endpoint():
    # Test the main chat endpoint with various inputs
    pass

def test_gemini_integration():
    # Test that Gemini properly extracts intent and entities
    pass

def test_tool_execution():
    # Test that tools are properly called and execute correctly
    pass
```

### Integration Tests

```python
def test_end_to_end_chat_flow():
    # Test a complete flow: user message -> Gemini processing -> tool execution -> response
    pass

def test_chat_history_storage():
    # Test that chat history is properly stored and retrieved
    pass
```