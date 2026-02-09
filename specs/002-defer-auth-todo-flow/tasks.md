# Implementation Tasks: Deferred Authentication Todo Flow

**Feature**: Deferred Authentication Todo Flow
**Feature Branch**: `002-defer-auth-todo-flow`
**Created**: 2026-02-04
**Status**: Draft

## Implementation Strategy

This implementation will modify the user flow to defer authentication until required while preserving all existing functionality. The approach is to:
1. Make the Todo Add screen the default landing page
2. Store pending todos locally when user is not authenticated
3. Trigger authentication flow when needed
4. Submit pending todos after successful authentication

## Dependencies

- User Story 1 (P1) must be completed before User Story 2
- User Story 2 (P1) must be completed before User Story 3
- All foundational tasks must be completed before user story tasks

## Parallel Execution Examples

- [P] tasks can be executed in parallel as they modify different files
- Tasks within the same user story can be executed in parallel if they affect different components

## Phases

### Phase 1: Setup
- [x] T001 Create necessary directory structure if not exists
- [x] T002 Set up development environment per plan.md

### Phase 2: Foundational Tasks
- [x] T003 [P] Create/update types for pending todos in src/types/task.ts
- [x] T004 [P] Create utility functions for local storage in src/utils/storage.ts
- [x] T005 [P] Update authentication hook to detect status on load in src/hooks/useAuth.ts

### Phase 3: User Story 1 - Direct Todo Entry for Logged-in Users (Priority: P1)
- [x] T006 [US1] Modify App component to route directly to TodoPage on load in src/app/page.tsx
- [x] T007 [US1] Update TodoPage to be the default landing page in src/app/page.tsx
- [x] T008 [US1] Verify authenticated users can immediately add todos in src/components/TodoForm.tsx

### Phase 4: User Story 2 - Deferred Authentication for New Users (Priority: P1)
- [x] T009 [US2] Create AuthModal component for login in src/components/AuthModal.tsx
- [x] T010 [US2] Implement logic to store pending todo in local storage in src/utils/storage.ts
- [x] T011 [US2] Modify TodoForm to trigger AuthModal when user not authenticated in src/components/TodoForm.tsx
- [x] T012 [US2] Preserve user input when transitioning to login in src/components/TodoForm.tsx

### Phase 5: User Story 3 - Automatic Todo Submission After Login (Priority: P2)
- [x] T013 [US3] Update authentication flow to check for pending todos after login in src/components/AuthForm.tsx
- [x] T014 [US3] Implement automatic submission of pending todos after successful login in src/services/todoService.ts
- [x] T015 [US3] Clear pending todos from storage after successful submission in src/utils/storage.ts

### Phase 6: Polish & Cross-Cutting Concerns
- [x] T016 Add error handling for authentication failures
- [x] T017 Add loading states for authentication and todo submission
- [x] T018 Update UI to reflect new flow and improve UX
- [x] T019 Test the complete flow with both authenticated and unauthenticated users
- [x] T020 Document the changes for other developers