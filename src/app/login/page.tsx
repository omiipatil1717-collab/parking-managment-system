"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Car, Lock, Mail, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, allUsers, switchUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    if (!email || !password) {
      setError("Please fill in both campus email and password.");
      setIsSubmitting(false);
      return;
    }

    const success = login(email);
    if (success) {
      const loggedUser = allUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (loggedUser?.role === "security_guard") {
        router.push("/guard");
      } else if (loggedUser?.role === "parking_manager" || loggedUser?.role === "super_admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } else {
      setError("No registered campus user found with this email. Please check your credentials or select quick demo sign-in below.");
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = (userId: string) => {
    switchUser(userId);
    const target = allUsers.find((u) => u.id === userId);
    if (target?.role === "security_guard") {
      router.push("/guard");
    } else if (target?.role === "parking_manager" || target?.role === "super_admin") {
      router.push("/admin");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center mx-auto shadow-md">
          <Car className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Sign in to SmartPark</h1>
        <p className="text-xs text-muted-foreground">
          Indian Institute of Technology & Management (IITM) Unified Mobility Login
        </p>
      </div>

      <div className="bg-card border rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
        {error && (
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-semibold text-foreground">Campus Academic Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@campus.edu"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border bg-background text-foreground text-xs focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-foreground">Password</label>
              <Link href="/forgot-password" className="text-primary hover:underline text-[11px]">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border bg-background text-foreground text-xs focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-white font-semibold text-xs hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
          >
            <span>Sign In</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Switcher */}
        <div className="pt-4 border-t space-y-3">
          <span className="text-[11px] font-semibold text-muted-foreground block text-center">
            Or Click a Verified Demo Account to Sign In Instantly:
          </span>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            {allUsers.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => handleQuickLogin(u.id)}
                className="p-2 rounded-xl border bg-muted/40 hover:bg-muted text-left transition-colors flex flex-col justify-between"
              >
                <div className="font-semibold text-foreground truncate">{u.fullName}</div>
                <div className="text-[10px] text-muted-foreground capitalize flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  <span>{u.role.replace("_", " ")}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="text-center pt-2 text-[11px] text-muted-foreground">
          Don&apos;t have a campus vehicle account?{" "}
          <Link href="/register" className="text-primary font-semibold hover:underline">
            Register now
          </Link>
        </div>
      </div>
    </div>
  );
}
