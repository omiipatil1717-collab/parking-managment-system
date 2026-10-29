"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { storage } from "@/lib/storage";
import { RoleGuard } from "@/components/role-guard";
import { CampusSettings } from "@/lib/types";
import { 
  ArrowLeft, 
  Sliders, 
  Save, 
  CheckCircle2, 
  Building, 
  Clock, 
  ShieldCheck 
} from "lucide-react";

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<CampusSettings>(() => storage.getSettings());
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = storage.updateSettings(settings, user.id);
    setSettings(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <RoleGuard allowedRoles={["parking_manager", "super_admin"]}>
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b">
          <div className="space-y-1">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Admin Hub
            </Link>
            <h1 className="text-2xl font-bold tracking-tight">Campus Policies & Settings</h1>
            <p className="text-xs text-muted-foreground">
              Configure parking booking windows, cancellation cutoffs, and campus security parameters
            </p>
          </div>
        </div>

        {saved && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Campus policy configurations saved and broadcast to all gate terminals.</span>
          </div>
        )}

        <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            {/* Campus Identity */}
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <Building className="w-4 h-4 text-primary" />
                <span>Campus Institution Identity</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Campus Full Name</label>
                  <input
                    type="text"
                    required
                    value={settings.campusName}
                    onChange={(e) => setSettings({ ...settings, campusName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border bg-background text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Campus Code</label>
                  <input
                    type="text"
                    required
                    value={settings.campusCode}
                    onChange={(e) => setSettings({ ...settings, campusCode: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 rounded-xl border bg-background text-xs font-mono uppercase focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Operating Timezone</label>
                <input
                  type="text"
                  disabled
                  value={settings.timezone}
                  className="w-full px-3 py-2 rounded-xl border bg-muted/60 text-muted-foreground text-xs font-mono cursor-not-allowed"
                />
                <span className="text-[10px] text-muted-foreground">Standardized for India (IST).</span>
              </div>
            </div>

            {/* Reservation Rules */}
            <div className="space-y-3 pt-4 border-t">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <span>Reservation Rules & Timers</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Max Booking Duration (Hours)</label>
                  <input
                    type="number"
                    min={1}
                    max={24}
                    required
                    value={settings.maxBookingHours}
                    onChange={(e) => setSettings({ ...settings, maxBookingHours: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border bg-background text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                  <span className="text-[10px] text-muted-foreground">Max single reservation window.</span>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Advance Booking Window (Days)</label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    required
                    value={settings.advanceBookingDays}
                    onChange={(e) => setSettings({ ...settings, advanceBookingDays: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border bg-background text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                  <span className="text-[10px] text-muted-foreground">How far in advance users can book.</span>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Cancellation Cutoff (Minutes)</label>
                  <input
                    type="number"
                    min={0}
                    max={120}
                    required
                    value={settings.cancellationCutoffMinutes}
                    onChange={(e) => setSettings({ ...settings, cancellationCutoffMinutes: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border bg-background text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                  <span className="text-[10px] text-muted-foreground">Minimum minutes prior to start time for penalty-free cancellation.</span>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Arrival Grace Period (Minutes)</label>
                  <input
                    type="number"
                    min={5}
                    max={60}
                    required
                    value={settings.gracePeriodMinutes}
                    onChange={(e) => setSettings({ ...settings, gracePeriodMinutes: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border bg-background text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                  <span className="text-[10px] text-muted-foreground">Allowable late arrival before slot is flagged as no-show.</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-semibold text-xs hover:bg-primary/90 transition-colors shadow-sm"
              >
                <Save className="w-4 h-4" />
                <span>Save Campus Policies</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </RoleGuard>
  );
}
