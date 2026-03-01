"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";

export default function SignupPage() {
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const { signupMutation }      = useAuth();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    signupMutation.mutate({ email, password, name: name || undefined });
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-black font-display bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
            FORGE
          </span>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h1 className="text-base font-bold mb-1">Create account</h1>
          <p className="text-xs text-muted-foreground mb-5">Start building with AI</p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                autoFocus
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="6+ characters"
                required
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full mt-1" disabled={signupMutation.isPending}>
              {signupMutation.isPending ? "Creating…" : "Create Account"}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground mt-4 text-center">
            Already have an account?{" "}
            <Link href="/login" className="text-violet-400 hover:text-violet-300">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}