"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || isAuthenticated) return null;

  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center gap-8 px-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="bg-primary flex h-14 w-14 items-center justify-center rounded-xl">
          <span className="text-primary-foreground text-xl font-bold">PH</span>
        </div>
        <h1 className="text-foreground text-4xl font-bold">ProjectHub</h1>
        <p className="text-muted-foreground max-w-sm">Project management for productive teams.</p>
      </div>

      <div className="flex gap-3">
        <Link href="/auth/login">
          <Button variant="outline">Sign In</Button>
        </Link>
        <Link href="/auth/register">
          <Button>Get Started</Button>
        </Link>
      </div>
    </div>
  );
}
