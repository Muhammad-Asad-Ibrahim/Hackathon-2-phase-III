# Implementation Plan: Deferred Authentication Todo Flow

**Feature**: Deferred Authentication Todo Flow
**Feature Branch**: `002-defer-auth-todo-flow`
**Created**: 2026-02-04
**Status**: Draft

## Tech Stack & Libraries

- Frontend: React.js with TypeScript
- State Management: Redux Toolkit
- Routing: React Router v6
- Styling: Tailwind CSS
- Authentication: Existing authentication system (to be preserved)
- Backend: Node.js/Express.js (existing)
- Database: Existing database (to be preserved)

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── TodoApp/
│   │   │   ├── TodoForm.tsx
│   │   │   ├── TodoList.tsx
│   │   │   └── AuthModal.tsx
│   │   ├── App.tsx
│   │   └── Layout/
│   ├── pages/
│   │   ├── TodoPage.tsx
│   │   └── LoginPage.tsx
│   ├── store/
│   │   ├── slices/
│   │   └── index.ts
│   ├── utils/
│   │   ├── auth.ts
│   │   └── storage.ts
│   ├── types/
│   │   └── index.ts
│   └── hooks/
│       └── useAuth.ts
├── public/
└── package.json
```

## Architecture Overview

The implementation will focus on modifying the user flow without changing the underlying authentication system or database schema. The key changes will be:

1. Modify the app's initial route to directly show the Todo Add screen
2. Implement a mechanism to store pending todos in local storage when user is not authenticated
3. Show the login modal when an unauthenticated user attempts to submit a todo
4. Automatically submit the pending todo after successful authentication

## Implementation Approach

### Phase 1: Authentication State Detection
- Implement a hook to detect authentication status on app load
- Modify the initial route to show TodoPage instead of intro screens

### Phase 2: Pending Todo Storage
- Create a mechanism to temporarily store todos in local storage
- Implement logic to preserve user input when authentication is required

### Phase 3: Login Flow Integration
- Integrate the login flow to appear when submitting without authentication
- Implement automatic submission of pending todos after login

### Phase 4: Testing & Validation
- Test the new flow with both authenticated and unauthenticated users
- Ensure no breaking changes to existing functionality

## File Modification Plan

- `src/components/App.tsx` - Update routing logic
- `src/pages/TodoPage.tsx` - Modify to be the initial page
- `src/hooks/useAuth.ts` - Add authentication detection
- `src/utils/storage.ts` - Add pending todo storage
- `src/components/TodoForm.tsx` - Add login trigger on submit
- `src/components/AuthModal.tsx` - Create modal for login
- `src/types/index.ts` - Add types for pending todos