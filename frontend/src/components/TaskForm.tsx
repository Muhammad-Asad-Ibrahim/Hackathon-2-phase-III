"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { tasksApi, ApiError } from "@/lib/api";
import { Task } from "@/types/task";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";

interface TaskFormProps {
  onTaskCreated?: (task: Task) => void;
}

export function TaskForm({ onTaskCreated }: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
    general?: string;
  }>({});

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};
    if (!title.trim()) newErrors.title = "Title is required";
    else if (title.length > 200) newErrors.title = "Title must be 200 characters or less";
    if (description.length > 2000) newErrors.description = "Description must be 2000 characters or less";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const task = await tasksApi.create({
        title: title.trim(),
        description: description.trim() || undefined,
      });

      toast.success("Task created successfully!");
      setTitle("");
      setDescription("");

      if (onTaskCreated) onTaskCreated(task);
      setOpenForm(false); // close after creation
    } catch (error) {
      if (error instanceof ApiError) {
        const detail = error.data?.detail || "Failed to create task";
        setErrors({ general: detail });
        toast.error(detail);
      } else {
        setErrors({ general: "An unexpected error occurred" });
        toast.error("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Open Sidebar Button */}
      <Button
        onClick={() => setOpenForm(true)}
        className="fixed bottom-4 right-4 rounded-full flex items-center gap-2 z-50"
      >
        <Plus className="h-4 w-4" />
      </Button>

      {/* Sidebar Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity ${
          openForm ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setOpenForm(false)}
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-background shadow-xl z-50 transform transition-transform duration-300 ${
          openForm ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center p-4 border-b border-border">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" /> New Task
          </h2>
          <Button variant="ghost" onClick={() => setOpenForm(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <Card className="shadow-none border-none bg-transparent m-0 rounded-none">
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4 p-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="Enter task title"
                  style={{ borderRadius: "30px" }}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isLoading}
                  aria-invalid={!!errors.title}
                  maxLength={200}
                  value={title}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title}</p>
                )}
                <p className="text-xs text-muted-foreground">{title.length}/200 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Description
                </Label>
                <textarea
                  id="description"
                  placeholder="Enter task description (optional)"
                  style={{ borderRadius: "30px" }}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isLoading}
                  aria-invalid={!!errors.description}
                  maxLength={2000}
                  rows={4}
                  value={description}
                  className="flex w-full rounded-lg border border-input bg-background px-4 py-3 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description}</p>
                )}
                <p className="text-xs text-muted-foreground">{description.length}/2000 characters</p>
              </div>

              {errors.general && (
                <div className="p-4 text-sm text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
                  {errors.general}
                </div>
              )}

              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Task"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
