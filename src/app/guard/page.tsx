"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { storage } from "@/lib/storage";
import { RoleGuard } from "@/components/role-guard";
import { formatISTDateTime, formatIndianPlate } from "@/lib/utils";
import { 
  ShieldCheck, 
  QrCode, 
  Car, 
  LogOut, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  Layers,
  Clock,
  Radio
} from "lucide-react";

export default function GuardDashboardPage() {
  const { user } = useAuth();
  const [selectedGate, setSelectedGate] = useState("North Gate 1");

  const gateEvents = storage.getGateEvents(20);
  const activeSessions = storage.getSessions("active");
  const todayEntries = gateEvents.filter((e) => e.eventType === "entry_scan" && e.validationResult === "success").length;
  const todayExits = gateEvents.filter((e) => e.eventType === "exit_scan" && e.validationResult === "success").length;
  const rejections = gateEvents.filter((e) => e.validationResult === "denied").length;

  return (
    <RoleGuard allowedRoles={["security_guard", "parking_manager", "super_admin"]}>
      <div className="space-y-8">
        {/* Guard Station Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                <span>Station Online</span>
              </span>
              <span className="text-xs text-muted-foreground">• Guard On Duty: {user.fullName} ({user.campusId})</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Campus Gate Control Terminal</h1>
            <p className="text-xs text-muted-foreground">
              Real-time vehicle access verification, optical pass scanning, and automated barrier operations
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase block">
                Assigned Gate
              </label>
              <select
                value={selectedGate}
                onChange={(e) => setSelectedGate(e.target.value)}
                className="px-3 py-1.5 rounded-xl border bg-background text-xs font-semibold text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
              >
                <option value="North Gate 1">North Gate 1 (Computer Science / Labs)</option>
                <option value="East Gate 2">East Gate 2 (Tech Park & Research)</option>
                <option value="Central Gate 3">Central Gate 3 (Main Library Plaza)</option>
                <option value="South Gate 4">South Gate 4 (Sports Arena)</option>
              </select>
            </div>

            <Link
              href="/guard/scan"
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary/90 transition-colors shadow-md mt-auto"
            >
              <QrCode className="w-4 h-4" />
              <span>Launch Pass Scanner</span>
            </Link>
          </div>
        </div>

        {/* Live Gate Telemetry Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card border rounded-2xl p-4 shadow-sm space-y-1">
            <span className="text-xs text-muted-foreground font-medium block">Verified Entries</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                {todayEntries}
              </span>
              <span className="text-xs text-muted-foreground">vehicles</span>
            </div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium block">
              Inbound passes authorized
            </span>
          </div>

          <div className="bg-card border rounded-2xl p-4 shadow-sm space-y-1">
            <span className="text-xs text-muted-foreground font-medium block">Verified Exits</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 font-mono">
                {todayExits}
              </span>
              <span className="text-xs text-muted-foreground">vehicles</span>
            </div>
            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium block">
              Outbound cleared
            </span>
          </div>

          <div className="bg-card border rounded-2xl p-4 shadow-sm space-y-1">
            <span className="text-xs text-muted-foreground font-medium block">Vehicles Currently Inside</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-foreground font-mono">
                {activeSessions.length}
              </span>
              <span className="text-xs text-muted-foreground">parked</span>
            </div>
            <span className="text-[10px] text-muted-foreground block">
              Active sessions across all zones
            </span>
          </div>

          <div className="bg-card border rounded-2xl p-4 shadow-sm space-y-1">
            <span className="text-xs text-muted-foreground font-medium block">Access Denied / Rejections</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-destructive font-mono">
                {rejections}
              </span>
              <span className="text-xs text-muted-foreground">flags</span>
            </div>
            <span className="text-[10px] text-destructive font-medium block">
              Invalid or unverified plates
            </span>
          </div>
        </div>

        {/* Quick Action Navigation Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/guard/scan"
            className="p-5 rounded-2xl border bg-card hover:border-primary/50 transition-all shadow-sm space-y-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
              <QrCode className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-foreground">Open ANPR & QR Scanner</h3>
            <p className="text-xs text-muted-foreground">
              Scan arriving driver passes via optical camera or manual reservation code input.
            </p>
          </Link>

          <Link
            href="/guard/entries"
            className="p-5 rounded-2xl border bg-card hover:border-primary/50 transition-all shadow-sm space-y-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Car className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-foreground">Gate Inbound Log</h3>
            <p className="text-xs text-muted-foreground">
              Audit trail of every vehicle admitted through campus gates with exact IST timestamps.
            </p>
          </Link>

          <Link
            href="/guard/exits"
            className="p-5 rounded-2xl border bg-card hover:border-primary/50 transition-all shadow-sm space-y-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <LogOut className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-foreground">Gate Outbound Log</h3>
            <p className="text-xs text-muted-foreground">
              Record checkout times, overstay warnings, and released bay availability.
            </p>
          </Link>
        </div>

        {/* Recent Live Gate Activity Feed */}
        <div className="bg-card border rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span>Live Gate Events Telemetry Feed</span>
            </h3>
            <span className="text-[11px] text-muted-foreground font-mono">
              Auto-updating via Supabase Realtime
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b bg-muted/40 text-muted-foreground font-semibold">
                  <th className="py-3 px-4">Event Type</th>
                  <th className="py-3 px-4">Gate Station</th>
                  <th className="py-3 px-4">Vehicle Plate</th>
                  <th className="py-3 px-4">Validation Outcome</th>
                  <th className="py-3 px-4">Timestamp (IST)</th>
                </tr>
              </thead>
              <tbody className="divide-y text-foreground">
                {gateEvents.map((evt) => (
                  <tr key={evt.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-semibold capitalize">
                      <span className="flex items-center gap-2">
                        {evt.eventType === "entry_scan" ? (
                          <Car className="w-3.5 h-3.5 text-emerald-600" />
                        ) : evt.eventType === "exit_scan" ? (
                          <LogOut className="w-3.5 h-3.5 text-blue-600" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
                        )}
                        <span>{evt.eventType.replace("_", " ")}</span>
                      </span>
                    </td>

                    <td className="py-3 px-4 font-medium">
                      {evt.gateIdentifier}
                    </td>

                    <td className="py-3 px-4 font-mono font-bold">
                      {formatIndianPlate(evt.vehicleRegistration)}
                    </td>

                    <td className="py-3 px-4">
                      {evt.validationResult === "success" ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                          <CheckCircle2 className="w-3 h-3" /> AUTHORIZED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300">
                          DENIED: {evt.rejectionReason}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 font-mono text-muted-foreground">
                      {formatISTDateTime(evt.eventTime)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
