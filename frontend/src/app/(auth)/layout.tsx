/**
 * Authentication layout with redirect logic.
 * Shows different UI based on authentication status.
 */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is already authenticated
    const token = localStorage.getItem("auth_token");

    if (token) {
      setIsAuthenticated(true);
    }
    setIsChecking(false);
  }, []);

  // Show nothing while checking authentication status
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // If user is authenticated, show a message and option to go to main app
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full text-center">
          <h1 className="text-2xl font-bold mb-4">You're already signed in</h1>
          <p className="text-muted-foreground mb-6">
            You're already logged in to your account.
          </p>
          <div className="space-y-3">
            <Link href="/">
              <Button className="w-full">Go to My Tasks</Button>
            </Link>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                localStorage.removeItem("auth_token");
                router.refresh();
              }}
            >
              Sign out
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {children}
    </div>
  );
}
