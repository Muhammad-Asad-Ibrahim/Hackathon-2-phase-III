/**
 * AuthModal component.
 * Displays a modal for authentication when user is not logged in
 * but attempts to submit a todo.
 */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { authApi, ApiError } from "@/lib/api";
import { toast } from "sonner";
import { X } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [mode, setMode] = useState<"login" | "register">("login");

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid email format";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (mode === "register" && password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      if (mode === "login") {
        await authApi.login({ email, password });
        toast.success("Logged in successfully!");
      } else {
        await authApi.register({ email, password });
        toast.success("Account created successfully!");
      }

      // Close modal and notify parent
      onSuccess();
      onClose();
    } catch (error) {
      if (error instanceof ApiError) {
        const detail = error.data?.detail || error.statusText;
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

  const toggleMode = () => {
    setMode(mode === "login" ? "register" : "login");
    setErrors({});
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4">
        <Card className="w-full border-none shadow-xl">
          <CardHeader className="space-y-2 text-center">
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-bold">
                {mode === "login" ? "Sign In" : "Create Account"}
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="absolute top-4 right-4"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <CardDescription>
              {mode === "login"
                ? "Enter your credentials to access your tasks"
                : "Enter your details to create a new account"}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  style={{ borderRadius: "30px" }}
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  aria-invalid={!!errors.email}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <Input
                  id="password"
                  type="password"
                  style={{ borderRadius: "30px" }}
                  placeholder={mode === "login" ? "Enter password" : "Min 8 characters"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  aria-invalid={!!errors.password}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>

              {errors.general && (
                <div className="p-4 text-sm text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
                  {errors.general}
                </div>
              )}
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full rounded-[30px]" size="lg" disabled={isLoading}>
                {isLoading ? "Loading..." : mode === "login" ? "Sign In" : "Sign Up"}
              </Button>

              <p className="text-sm text-center text-muted-foreground">
                {mode === "login" 
                  ? "Don't have an account?" 
                  : "Already have an account?"}{" "}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="font-medium text-primary hover:underline"
                >
                  {mode === "login" ? "Sign up" : "Sign in"}
                </button>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}