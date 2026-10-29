"use client";

import React from "react";
import { useAuth } from "@/lib/auth-context";
import { UserRole } from "@/lib/types";
import { ShieldAlert, ArrowRight, UserCheck } from "lucide-react";
import Link from "next/link";

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { role, switchRole } = useAuth();

  if (allowedRoles.includes(role)) {
    return <>{children}</>;
  }

  // Recommended role to switch to for demo
  const recommendedRole = allowedRoles[0];

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-card border rounded-2xl p-8 text-center shadow-lg">
        <div className="w-16 h-16 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold tracking-tight mb-2">Access Restricted</h2>
        <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
          This portal requires an authorized role ({allowedRoles.map((r) => r.replace("_", " ")).join(", ")}).
          Your current session is logged in as <strong className="text-foreground capitalize">{role.replace("_", " ")}</strong>.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => switchRole(recommendedRole)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-colors shadow-sm"
          >
            <UserCheck className="w-4 h-4" />
            <span>Switch to {recommendedRole.replace("_", " ").toUpperCase()} Persona</span>
          </button>

          <Link
            href="/dashboard"
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border bg-muted/50 text-muted-foreground hover:text-foreground font-medium transition-colors"
          >
            <span>Return to User Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
