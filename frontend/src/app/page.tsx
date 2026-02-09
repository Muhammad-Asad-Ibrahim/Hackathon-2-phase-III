/**
 * Home page - Dynamic entry point for the Todo application.
 * Shows both traditional task list and new AI chat interface.
 */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskList } from "@/components/TaskList";
import { TaskForm } from "@/components/TaskForm";
import ChatPage from "./chat-page"; // Import the new chat page
import { authApi } from "@/lib/api";
import { Task } from "@/types/task";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, MessageCircle, ListTodo } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading, logout } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleLogout = async () => {
    try {
      await authApi.logout();
      toast.success("Logged out successfully");
      logout();
      router.refresh();
    } catch {
      authApi.logout();
      logout();
      router.refresh();
    }
  };

  const handleTaskCreated = (_task: Task) => {
    setRefreshTrigger((prev) => prev + 1);
  };

  // Loading state
  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </main>
    );
  }

  // Always show the task dashboard, but adjust behavior based on auth status
  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-50  bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Task Manager</h1>
          {isAuthenticated ? (
            <Button variant="outline" onClick={handleLogout} className="gap-2 bg-primary rounded-full">
              <LogOut className="h-4 w-4 text-white hover:text-primary" />
            </Button>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-3xl font-bold">My Tasks</h2>
            </div>
            <p className="text-muted-foreground">
              Manage your personal todo list with traditional interface or AI assistant
            </p>
          </div>

          {/* Tabbed interface for traditional and AI interfaces */}
          <Tabs defaultValue="traditional" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="traditional" className="flex items-center gap-2">
                <ListTodo className="h-4 w-4" />
                Traditional View
              </TabsTrigger>
              <TabsTrigger value="ai-assistant" className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                AI Assistant
              </TabsTrigger>
            </TabsList>

            <TabsContent value="traditional" className="space-y-6">
              <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 order-2 lg:order-1">
                  <TaskList key={refreshTrigger} />
                </div>
                <div className="lg:col-span-1 order-1 lg:order-2">
                  <TaskForm onTaskCreated={handleTaskCreated} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="ai-assistant" className="space-y-6">
              {isAuthenticated ? (
                <>
                  <div className="h-[600px]">
                    <ChatPage />
                  </div>
                  <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <h3 className="font-semibold text-blue-800 mb-2">Try these examples:</h3>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-700">
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>"Create a task to buy groceries tomorrow"</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>"Update the meeting task to next week"</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>"Delete the doctor appointment task"</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>"Show me my tasks"</span>
                      </li>
                    </ul>
                  </div>
                </>
              ) : (
                <div className="h-[600px] flex items-center justify-center">
                  <div className="text-center p-8 bg-white rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold mb-4">Sign in to use AI Assistant</h3>
                    <p className="text-gray-600 mb-6">Please sign in to access the AI-powered task assistant</p>
                    <Link href="/login">
                      <Button>Sign In</Button>
                    </Link>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
