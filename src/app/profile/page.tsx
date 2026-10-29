"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { storage } from "@/lib/storage";
import { 
  User, 
  Mail, 
  Building, 
  Phone, 
  ShieldCheck, 
  CheckCircle2, 
  GraduationCap, 
  Award, 
  Save, 
  LogOut 
} from "lucide-react";

export default function ProfilePage() {
  const { user, role, switchUser, allUsers } = useAuth();
  const [fullName, setFullName] = useState(user.fullName);
  const [department, setDepartment] = useState(user.department);
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber || "");
  const [saved, setSaved] = useState(false);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    storage.updateUser(user.id, {
      fullName,
      department,
      phoneNumber,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="pb-3 border-b">
        <h1 className="text-2xl font-bold tracking-tight">Campus User Profile</h1>
        <p className="text-xs text-muted-foreground">
          Academic identification, department records, and vehicle authorization credentials
        </p>
      </div>

      {saved && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Profile records updated successfully.</span>
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 border-b pb-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 text-primary flex items-center justify-center font-bold text-2xl uppercase">
            {user.fullName.charAt(0)}
          </div>

          <div className="text-center sm:text-left space-y-1">
            <h2 className="text-xl font-bold text-foreground">{user.fullName}</h2>
            <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap text-xs">
              <span className="font-mono bg-muted px-2 py-0.5 rounded font-semibold text-muted-foreground">
                {user.campusId}
              </span>
              <span className="capitalize px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                {role.replace("_", " ")}
              </span>
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Active Status
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleUpdate} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border bg-background text-foreground text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Institutional Email (Read-only)</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border bg-muted/60 text-muted-foreground text-xs cursor-not-allowed"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Department / School</label>
              <div className="relative">
                <Building className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border bg-background text-foreground text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Contact Mobile Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="98XXXXXXXX"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border bg-background text-foreground text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-semibold text-xs hover:bg-primary/90 transition-colors shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>Save Profile Changes</span>
            </button>
          </div>
        </form>
      </div>

      {/* Switch Demo Persona Quick Bar */}
      <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-3">
        <h3 className="font-bold text-sm">Switch Demo Persona</h3>
        <p className="text-xs text-muted-foreground">
          Switch to any of the 6 campus personas to inspect their unique permissions and dashboard tools:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
          {allUsers.map((u) => (
            <button
              key={u.id}
              onClick={() => switchUser(u.id)}
              className={`p-3 rounded-xl border text-left text-xs transition-all ${
                u.id === user.id
                  ? "bg-primary text-white border-primary shadow-sm"
                  : "bg-muted/30 hover:bg-muted text-foreground"
              }`}
            >
              <div className="font-semibold truncate">{u.fullName}</div>
              <div className="text-[10px] opacity-80 capitalize">{u.role.replace("_", " ")}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
