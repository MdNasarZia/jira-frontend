"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [localError, setLocalError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    if (!formData.email || !formData.password) {
      setLocalError("Please fill in all fields");
      return;
    }

    try {
      await login(formData.email, formData.password);
      router.push("/dashboard");
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Login failed");
    }
  };

  const displayError = localError || error;

  return (
    <div className="from-background to-secondary flex min-h-screen items-center justify-center bg-gradient-to-br">
      <div className="w-full max-w-md space-y-8">
        {/* Logo Section */}
        <div className="space-y-2 text-center">
          <div className="flex justify-center">
            <div className="bg-primary flex h-12 w-12 items-center justify-center rounded-lg">
              <span className="text-primary-foreground text-xl font-bold">PH</span>
            </div>
          </div>
          <h1 className="text-foreground text-3xl font-bold">ProjectHub</h1>
          <p className="text-muted-foreground">Team project management made simple</p>
        </div>

        {/* Login Form */}
        <div className="bg-card border-border space-y-4 rounded-lg border p-6 shadow-sm">
          {displayError && (
            <div className="bg-destructive/10 border-destructive/20 flex gap-2 rounded-md border p-3">
              <AlertCircle className="text-destructive mt-0.5 h-5 w-5 flex-shrink-0" />
              <p className="text-destructive text-sm">{displayError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="border-border w-full border-t"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-card text-muted-foreground px-2">Don't have an account?</span>
            </div>
          </div>

          <Link href="/auth/register">
            <Button variant="outline" className="w-full">
              Create Account
            </Button>
          </Link>
        </div>

        {/* Footer */}
        <p className="text-muted-foreground text-center text-sm">Made for productive teams</p>
      </div>
    </div>
  );
}
