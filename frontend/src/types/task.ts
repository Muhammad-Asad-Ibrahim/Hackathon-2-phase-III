/**
 * Task type definitions.
 * Matches the backend API TaskRead schema.
 */

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Pending todo type for storing unsubmitted todos.
 */
export interface PendingTodo {
  title: string;
  description?: string;
  timestamp: number;
}
