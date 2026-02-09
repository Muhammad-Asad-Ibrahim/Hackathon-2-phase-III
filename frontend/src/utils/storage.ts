/**
 * Utility functions for managing local storage.
 * Used for storing pending todos when user is not authenticated.
 */

import { PendingTodo } from "@/types/task";

const PENDING_TODOS_KEY = "pending_todos";

/**
 * Save a pending todo to local storage.
 */
export function savePendingTodo(todo: Omit<PendingTodo, "timestamp">): void {
  if (typeof window === "undefined") return;
  
  const todos: PendingTodo[] = getPendingTodos();
  const newTodo: PendingTodo = {
    ...todo,
    timestamp: Date.now(),
  };
  
  todos.push(newTodo);
  localStorage.setItem(PENDING_TODOS_KEY, JSON.stringify(todos));
}

/**
 * Retrieve all pending todos from local storage.
 */
export function getPendingTodos(): PendingTodo[] {
  if (typeof window === "undefined") return [];
  
  const stored = localStorage.getItem(PENDING_TODOS_KEY);
  if (!stored) return [];
  
  try {
    return JSON.parse(stored);
  } catch (error) {
    console.error("Error parsing pending todos from localStorage:", error);
    return [];
  }
}

/**
 * Clear all pending todos from local storage.
 */
export function clearPendingTodos(): void {
  if (typeof window === "undefined") return;
  
  localStorage.removeItem(PENDING_TODOS_KEY);
}

/**
 * Remove a specific pending todo by its timestamp.
 */
export function removePendingTodo(timestamp: number): void {
  if (typeof window === "undefined") return;
  
  const todos = getPendingTodos();
  const filteredTodos = todos.filter(todo => todo.timestamp !== timestamp);
  localStorage.setItem(PENDING_TODOS_KEY, JSON.stringify(filteredTodos));
}