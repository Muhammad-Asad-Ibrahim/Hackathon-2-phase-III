# Deferred Authentication Todo Flow - Implementation Documentation

## Overview
This feature modifies the user flow to defer authentication until required while preserving all existing functionality. The main changes include:

1. Making the Todo Add screen the default landing page
2. Storing pending todos locally when user is not authenticated
3. Triggering authentication flow when needed
4. Submitting pending todos after successful authentication

## Key Changes

### 1. Updated Landing Page
- Modified `src/app/page.tsx` to always show the Todo Add screen
- Removed the intro/landing page for unauthenticated users
- Maintained authentication status detection using the new `useAuth` hook

### 2. Authentication Hook
- Created `src/hooks/useAuth.ts` to manage authentication state
- Provides utilities for checking authentication status and handling related operations
- Handles token storage and retrieval from localStorage

### 3. Pending Todo Storage
- Extended `src/types/task.ts` with `PendingTodo` interface
- Created `src/utils/storage.ts` with functions to save, retrieve, and clear pending todos
- Implemented logic to store todos in localStorage when user is not authenticated

### 4. Updated Task Form
- Modified `src/components/TaskForm.tsx` to check authentication status before submitting
- When unauthenticated, stores the todo as pending and redirects to login
- Preserves user input during the authentication flow

### 5. Authentication Handling
- Updated `src/components/AuthForm.tsx` to submit pending todos after successful authentication
- Created `src/services/todoService.ts` to handle submitting pending todos
- Modified `src/app/(auth)/layout.tsx` to show different UI based on authentication status

### 6. User Experience Improvements
- Updated messaging to inform users about authentication requirements
- Maintained all existing functionality while adding new flow
- Preserved user input across authentication transitions

## Files Modified/Added

- `src/app/page.tsx` - Updated to always show Todo Add screen
- `src/hooks/useAuth.ts` - New authentication hook
- `src/types/task.ts` - Added PendingTodo interface
- `src/utils/storage.ts` - New storage utilities for pending todos
- `src/components/TaskForm.tsx` - Updated to handle unauthenticated submissions
- `src/components/AuthForm.tsx` - Updated to submit pending todos after login
- `src/services/todoService.ts` - New service for handling pending todos
- `src/app/(auth)/layout.tsx` - Updated to show different UI based on auth status
- `src/components/AuthModal.tsx` - New modal component for authentication

## Testing

The implementation has been tested with both authenticated and unauthenticated users:

1. Authenticated users can immediately add todos as before
2. Unauthenticated users can enter todos, which are stored locally
3. When unauthenticated users submit, they are redirected to login
4. After successful login, pending todos are automatically submitted
5. All existing functionality remains intact

## Constraints Respected

- Authentication system preserved without modification
- Database schema unchanged
- Existing APIs unchanged
- No breaking changes to existing functionality
- Minimal and isolated changes only