/**
 * Service for handling todo operations.
 * Includes functionality for submitting pending todos after authentication.
 */
import { tasksApi } from "@/lib/api";
import { getPendingTodos, clearPendingTodos, removePendingTodo } from "@/utils/storage";
import { toast } from "sonner";

/**
 * Submit all pending todos to the server after successful authentication.
 */
export async function submitPendingTodos(): Promise<void> {
  const pendingTodos = getPendingTodos();
  
  if (pendingTodos.length === 0) {
    return;
  }

  let successCount = 0;
  const errors: string[] = [];

  // Process each pending todo
  for (const pendingTodo of pendingTodos) {
    try {
      await tasksApi.create({
        title: pendingTodo.title,
        description: pendingTodo.description,
      });
      
      // Remove the successfully submitted todo
      removePendingTodo(pendingTodo.timestamp);
      successCount++;
    } catch (error) {
      console.error("Failed to submit pending todo:", error);
      errors.push(`Failed to submit: "${pendingTodo.title}"`);
    }
  }

  // Show appropriate feedback
  if (successCount > 0) {
    toast.success(`${successCount} pending task${successCount > 1 ? 's' : ''} submitted successfully!`);
  }

  if (errors.length > 0) {
    errors.forEach(error => toast.error(error));
    toast.error(`${errors.length} task${errors.length > 1 ? 's' : ''} failed to submit.`);
  }

  // If all pending todos were processed, clear the storage
  if (successCount === pendingTodos.length) {
    clearPendingTodos();
  }
}