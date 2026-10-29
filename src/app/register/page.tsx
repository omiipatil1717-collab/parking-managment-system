"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { storage } from "@/lib/storage";
import { Car, Lock, Mail, User, Building, Phone, ArrowRight, Shield } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { switchUser } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [campusId, setCampusId] = useState("");
  const [department, setDepartment] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [role, setRole] = useState<"student" | "faculty" | "staff">("student");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!fullName || !email || !campusId || !department || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (!email.includes("@")) {
      setError("Please provide a valid institutional email.");
      return;
    }

    try {
      const newUser = storage.createUser({
        fullName,
        email,
        campusId: campusId.toUpperCase(),
        department,
        phoneNumber,
        role, // Safe non-privileged role
        accountStatus: "active",
      });

      setSuccess(true);
      setTimeout(() => {
        switchUser(newUser.id);
        router.push("/dashboard");
      }, 1000);
    } catch (err: any) {
      setError(err?.message || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center mx-auto shadow-md">
          <Car className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Register Campus Vehicle Profile</h1>
        <p className="text-xs text-muted-foreground">
          Create your verified parking account for IITM Campus
        </p>
      </div>

      <div className="bg-card border rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
        {error && (
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300 text-xs font-medium">
            Registration successful! Redirecting to campus dashboard...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-semibold text-foreground">Full Name *</label>
            <div className="relative">
              <User className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Rohan Patel"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border bg-background text-foreground text-xs focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-foreground">Campus Institutional Email *</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rohan.p@campus.edu"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border bg-background text-foreground text-xs focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Campus / Roll ID *</label>
              <input
                type="text"
                value={campusId}
                onChange={(e) => setCampusId(e.target.value)}
                placeholder="IITM/2026/CS/089"
                className="w-full px-3 py-2.5 rounded-xl border bg-background text-foreground text-xs uppercase focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Department *</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="CSE / Mechanical"
                className="w-full px-3 py-2.5 rounded-xl border bg-background text-foreground text-xs focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-foreground">Campus Role * (Safe Default Role)</label>
            <div className="grid grid-cols-3 gap-2">
              {(["student", "faculty", "staff"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`py-2 rounded-xl border text-xs capitalize font-medium transition-colors ${
                    role === r
                      ? "bg-primary text-white border-primary shadow-sm"
                      : "bg-muted/40 hover:bg-muted text-muted-foreground"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground">
              Security Guard & Administrator accounts are provisioned exclusively through Estate Administration.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-foreground">Mobile Phone Number (India +91)</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="98XXXXXXXX"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border bg-background text-foreground text-xs focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-foreground">Password *</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border bg-background text-foreground text-xs focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-white font-semibold text-xs hover:bg-primary/90 transition-colors shadow-sm"
          >
            <span>Complete Registration</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 text-[11px] text-muted-foreground">
          Already have a campus account?{" "}
          <Link href="/login" className="text-primary font-semibold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
