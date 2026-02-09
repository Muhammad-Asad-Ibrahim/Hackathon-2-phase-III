// Test file to document end-to-end testing for task update via chat interface

/*
End-to-End Test Scenario: Task Update via Chat Interface

1. User opens the chat interface (ChatPage)
2. User types "Update the grocery task to next week"
3. The frontend sends this message to the backend via the POST /api/v1/chat endpoint
4. The backend processes the message using the GeminiService to extract intent and entities:
   - Intent: UPDATE_TASK
   - Entities: {type: "TITLE", value: "grocery"}, {type: "DATE", value: "next week"}
5. The ToolExecutionService executes the update_task tool with the extracted parameters
6. The update_task tool calls the existing task update endpoint
7. An existing task is updated in the database
8. The AI generates a response confirming the task update
9. The response is sent back to the frontend
10. The chat interface displays the AI's response to the user

Expected Result:
- The task titled "grocery" has its date updated to next week
- The user sees a confirmation message in the chat interface

How to Test Manually:
1. Start the backend server: `cd backend && uvicorn main:app --reload`
2. Start the frontend server: `cd frontend && npm run dev`
3. Navigate to the chat page in your browser
4. First create a task: "Create a task to buy groceries tomorrow"
5. Then update it: "Update the groceries task to next week"
6. Verify that:
   - Both messages appear in the chat window
   - The AI responds with a confirmation for the update
   - The task date has been updated in the task list
*/