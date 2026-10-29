"use client";

import React from "react";
import { useAuth } from "@/lib/auth-context";
import { UserRole } from "@/lib/types";
import { User, ShieldCheck, ShieldAlert, Award, Briefcase, GraduationCap } from "lucide-react";

export function DemoRoleBanner() {
  const { user, role, switchRole, allUsers } = useAuth();

  const roleMeta: Record<UserRole, { label: string; icon: React.ReactNode; color: string }> = {
    student: { label: "Student", icon: <GraduationCap className="w-3.5 h-3.5" />, color: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300" },
    faculty: { label: "Faculty", icon: <Award className="w-3.5 h-3.5" />, color: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300" },
    staff: { label: "Staff", icon: <Briefcase className="w-3.5 h-3.5" />, color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300" },
    security_guard: { label: "Security Guard", icon: <ShieldCheck className="w-3.5 h-3.5" />, color: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" },
    parking_manager: { label: "Parking Manager", icon: <ShieldAlert className="w-3.5 h-3.5" />, color: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300" },
    super_admin: { label: "Super Admin", icon: <User className="w-3.5 h-3.5" />, color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300" },
  };

  return (
    <div className="bg-slate-900 text-white text-xs py-1.5 px-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 z-50">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-slate-300 flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Interactive Role Preview:
        </span>
        <span className="text-slate-400 hidden sm:inline">
          Active: <strong className="text-white font-medium">{user.fullName}</strong> ({user.campusId})
        </span>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-slate-400 mr-1 hidden md:inline">Switch Role:</span>
        {(["student", "faculty", "security_guard", "parking_manager", "super_admin"] as UserRole[]).map((r) => {
          const isActive = role === r;
          const meta = roleMeta[r];
          return (
            <button
              key={r}
              onClick={() => switchRole(r)}
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full font-medium transition-all ${
                isActive
                  ? "bg-primary text-white shadow-sm ring-1 ring-white/30"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
              }`}
            >
              {meta.icon}
              <span>{meta.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
