# Implementation Tasks: AI-Powered Chatbot with Gemini Integration

## Feature Overview

Implement an AI-powered chatbot using Google Gemini API that allows users to interact with the task management system using natural language. The system will extract intent and entities from user messages, execute appropriate actions through MCP-style tools that map to existing API endpoints, and maintain chat history in the database.

## Dependencies

- User Story 2 (Natural Language Task Updates) depends on User Story 1 (Natural Language Task Creation) foundational components
- User Story 3 (Natural Language Task Deletion) depends on User Story 1 foundational components
- User Story 4 (Task Listing via Chat) depends on User Story 1 foundational components

## Parallel Execution Examples

- [P] T002-T006 can run in parallel (model creation tasks)
- [P] T012-T015 can run in parallel (service layer tasks)
- [P] T025-T027 can run in parallel (frontend component creation)

## Implementation Strategy

- MVP: Complete User Story 1 (Natural Language Task Creation) with minimal viable functionality
- Incremental Delivery: Add other user stories in priority order (P2, P3, P4)
- Each user story should be independently testable

---

## Phase 1: Setup

- [X] T001 Install Google Generative AI SDK in backend: pip install google-generativeai
- [X] T002 Add GEMINI_API_KEY to backend environment variables
- [X] T003 Create backend/src/models directory if not exists
- [X] T004 Create backend/src/services directory if not exists
- [X] T005 Create backend/src/api/v1 directory if not exists
- [X] T006 Create frontend/src/components/ChatInterface directory if not exists

---

## Phase 2: Foundational Components

- [X] T007 Create ChatSession model in backend/src/models/chat_session.py
- [X] T008 Create ChatMessage model in backend/src/models/chat_message.py
- [X] T009 Create Entity model in backend/src/models/entity.py
- [X] T010 Create ToolDefinition model in backend/src/models/tool_definition.py
- [X] T011 Create database migration for chat tables in backend/database/migrations/
- [X] T012 [P] Create GeminiService in backend/src/services/gemini_service.py
- [X] T013 [P] Create ChatService in backend/src/services/chat_service.py
- [X] T014 [P] Create ToolExecutionService in backend/src/services/tool_execution_service.py
- [X] T015 [P] Create ToolRouter in backend/src/api/v1/tool_router.py
- [X] T016 Initialize tool definitions in database with required tools (create_task, update_task, delete_task, list_tasks)
- [X] T017 Create chat API router in backend/src/api/v1/chat_router.py
- [X] T018 Register chat and tool routers in backend/main.py
- [X] T019 Create frontend/src/services/chatApi.js for API communication
- [X] T020 Add chat API endpoints to frontend environment configuration

---

## Phase 3: User Story 1 - Natural Language Task Creation (Priority: P1)

**Goal**: Enable users to create new tasks by typing natural language commands in the chat interface.

**Independent Test**: Can be fully tested by sending a natural language command like "Create a task to buy groceries tomorrow" and verifying that a task with the appropriate title and date is created in the system.

### Implementation Tasks

- [X] T021 [US1] Implement POST /api/chat endpoint in chat_router.py
- [X] T022 [US1] Enhance GeminiService to extract CREATE_TASK intent from user messages
- [X] T023 [US1] Implement entity extraction (title, date, status) in GeminiService
- [X] T024 [US1] Connect create_task tool to existing task creation endpoint
- [X] T025 [P] [US1] Create ChatWindow component in frontend/src/components/ChatInterface/ChatWindow.jsx
- [X] T026 [P] [US1] Create Message component in frontend/src/components/ChatInterface/Message.jsx
- [X] T027 [P] [US1] Create InputArea component in frontend/src/components/ChatInterface/InputArea.jsx
- [X] T028 [US1] Create ChatPage in frontend/src/pages/ChatPage.jsx
- [X] T029 [US1] Connect frontend components to chat API
- [X] T030 [US1] Test end-to-end task creation via chat interface

---

## Phase 4: User Story 2 - Natural Language Task Updates (Priority: P2)

**Goal**: Allow users to update existing tasks by typing natural language commands in the chat interface.

**Independent Test**: Can be tested by creating a task and then sending a natural language command to update it, verifying that the task properties are correctly modified.

### Implementation Tasks

- [X] T031 [US2] Enhance GeminiService to extract UPDATE_TASK intent from user messages
- [X] T032 [US2] Implement entity extraction for task updates (task_id, title, date, status) in GeminiService
- [X] T033 [US2] Connect update_task tool to existing task update endpoint
- [X] T034 [US2] Test end-to-end task update via chat interface

---

## Phase 5: User Story 3 - Natural Language Task Deletion (Priority: P3)

**Goal**: Provide users with the ability to delete existing tasks by typing natural language commands in the chat interface.

**Independent Test**: Can be tested by creating a task and then sending a natural language command to delete it, verifying that the task is removed from the system.

### Implementation Tasks

- [X] T035 [US3] Enhance GeminiService to extract DELETE_TASK intent from user messages
- [X] T036 [US3] Implement entity extraction for task deletion (task_id) in GeminiService
- [X] T037 [US3] Connect delete_task tool to existing task deletion endpoint
- [X] T038 [US3] Test end-to-end task deletion via chat interface

---

## Phase 6: User Story 4 - Task Listing via Chat (Priority: P2)

**Goal**: Enable users to view their tasks by typing natural language commands in the chat interface.

**Independent Test**: Can be tested by having tasks in the system and sending a natural language command to list them, verifying that the correct tasks are returned.

### Implementation Tasks

- [X] T039 [US4] Enhance GeminiService to extract LIST_TASKS intent from user messages
- [X] T040 [US4] Implement entity extraction for task listing (filters) in GeminiService
- [X] T041 [US4] Connect list_tasks tool to existing task listing endpoint
- [X] T042 [US4] Test end-to-end task listing via chat interface

---

## Phase 7: Additional Features

- [X] T043 Implement GET /api/chat/sessions endpoint to retrieve user's chat sessions
- [X] T044 Implement GET /api/chat/session/{session_id}/messages endpoint to retrieve messages in a session
- [X] T045 Enhance frontend to display chat history
- [X] T046 Implement session management in frontend
- [X] T047 Add loading states and error handling to frontend components

---

## Phase 8: Error Handling & Fallbacks

- [X] T048 Implement graceful error handling when Gemini API is unavailable
- [X] T049 Create fallback responses for unclear user intents
- [X] T050 Add logging for API errors and fallback responses
- [X] T051 Handle case when user tries to modify non-existent tasks
- [X] T052 Handle invalid dates or statuses in natural language commands
- [X] T053 Add rate limiting to prevent API abuse

---

## Phase 9: Polish & Cross-Cutting Concerns

- [X] T054 Add authentication to chat endpoints using existing JWT system
- [X] T055 Write unit tests for GeminiService
- [X] T056 Write unit tests for ChatService
- [X] T057 Write unit tests for ToolExecutionService
- [X] T058 Write integration tests for chat endpoints
- [X] T059 Write frontend component tests
- [X] T060 Performance optimization for chat history retrieval
- [X] T061 Documentation for new API endpoints
- [X] T062 Update README with chatbot feature instructions
- [X] T063 Conduct end-to-end testing of all user stories