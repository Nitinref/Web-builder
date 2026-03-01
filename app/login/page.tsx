"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const { loginMutation }     = useAuth();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-black font-display bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
            FORGE
          </span>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h1 className="text-base font-bold mb-1">Sign in</h1>
          <p className="text-xs text-muted-foreground mb-5">Welcome back to FORGE</p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoFocus
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full mt-1"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Signing in…" : "Sign In"}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground mt-4 text-center">
            No account?{" "}
            <Link href="/signup" className="text-violet-400 hover:text-violet-300">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}