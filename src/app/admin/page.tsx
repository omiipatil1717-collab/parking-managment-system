"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { storage } from "@/lib/storage";
import { RoleGuard } from "@/components/role-guard";
import { OccupancyCharts } from "@/components/analytics/occupancy-chart";
import { formatISTDateTime, formatIndianPlate } from "@/lib/utils";
import { 
  LayoutDashboard, 
  MapPin, 
  Layers, 
  CalendarCheck, 
  Users, 
  ShieldAlert, 
  BarChart3, 
  Sliders, 
  Car, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  FileText
} from "lucide-react";

export default function AdminHubPage() {
  const { user } = useAuth();
  const summaries = storage.getOccupancySummaries();
  const zones = storage.getZones();
  const sessions = storage.getSessions();
  const activeSessions = sessions.filter((s) => s.status === "active");
  const reservations = storage.getReservations();
  const auditLogs = storage.getAuditLogs(6);

  const totalUsable = summaries.reduce((acc, s) => acc + s.usableCapacity, 0);
  const totalParked = summaries.reduce((acc, s) => acc + s.activeSessions, 0);
  const totalAvailable = summaries.reduce((acc, s) => acc + s.availableNow, 0);
  const occupancyPercent = totalUsable > 0 ? Math.round((totalParked / totalUsable) * 100) : 0;

  return (
    <RoleGuard allowedRoles={["parking_manager", "super_admin"]}>
      <div className="space-y-8">
        {/* Executive Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300">
                Administration & Operations Hub
              </span>
              <span className="text-xs text-muted-foreground">• IITM Campus Mobility Division</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Executive Parking Dashboard</h1>
            <p className="text-xs text-muted-foreground">
              Overseeing campus capacity, active parking sessions, security gate telemetry, and policy enforcement
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/sessions"
              className="px-3.5 py-2 rounded-xl border bg-card hover:bg-muted text-xs font-semibold transition-colors"
            >
              Reconcile Occupancy
            </Link>
            <Link
              href="/admin/zones"
              className="px-3.5 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm"
            >
              Manage Zones
            </Link>
          </div>
        </div>

        {/* Executive KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card border rounded-2xl p-4 shadow-sm space-y-1">
            <span className="text-xs text-muted-foreground font-medium block">Campus Occupancy</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-foreground font-mono">
                {occupancyPercent}%
              </span>
              <span className="text-xs text-muted-foreground">({totalParked} / {totalUsable})</span>
            </div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium block">
              {totalAvailable} bays available right now
            </span>
          </div>

          <div className="bg-card border rounded-2xl p-4 shadow-sm space-y-1">
            <span className="text-xs text-muted-foreground font-medium block">Active Parked Sessions</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-primary font-mono">
                {activeSessions.length}
              </span>
              <span className="text-xs text-muted-foreground">vehicles</span>
            </div>
            <span className="text-[10px] text-muted-foreground block">
              Physically inside campus gates
            </span>
          </div>

          <div className="bg-card border rounded-2xl p-4 shadow-sm space-y-1">
            <span className="text-xs text-muted-foreground font-medium block">Upcoming Reservations</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 font-mono">
                {reservations.filter((r) => r.status === "confirmed").length}
              </span>
              <span className="text-xs text-muted-foreground">holding</span>
            </div>
            <span className="text-[10px] text-muted-foreground block">
              Reserved in future time windows
            </span>
          </div>

          <div className="bg-card border rounded-2xl p-4 shadow-sm space-y-1">
            <span className="text-xs text-muted-foreground font-medium block">Total Monitored Zones</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-foreground font-mono">
                {zones.length}
              </span>
              <span className="text-xs text-muted-foreground">sectors</span>
            </div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium block">
              100% active and monitored
            </span>
          </div>
        </div>

        {/* Administration Navigation Quick Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 text-xs">
          <Link
            href="/admin/zones"
            className="p-3.5 rounded-xl border bg-card hover:border-primary/50 text-center space-y-1.5 transition-colors"
          >
            <MapPin className="w-5 h-5 mx-auto text-primary" />
            <span className="font-semibold block">Zones</span>
          </Link>

          <Link
            href="/admin/spaces"
            className="p-3.5 rounded-xl border bg-card hover:border-primary/50 text-center space-y-1.5 transition-colors"
          >
            <Layers className="w-5 h-5 mx-auto text-sky-500" />
            <span className="font-semibold block">Spaces & Bays</span>
          </Link>

          <Link
            href="/admin/reservations"
            className="p-3.5 rounded-xl border bg-card hover:border-primary/50 text-center space-y-1.5 transition-colors"
          >
            <CalendarCheck className="w-5 h-5 mx-auto text-amber-500" />
            <span className="font-semibold block">Reservations</span>
          </Link>

          <Link
            href="/admin/sessions"
            className="p-3.5 rounded-xl border bg-card hover:border-primary/50 text-center space-y-1.5 transition-colors"
          >
            <Car className="w-5 h-5 mx-auto text-emerald-500" />
            <span className="font-semibold block">Live Sessions</span>
          </Link>

          <Link
            href="/admin/analytics"
            className="p-3.5 rounded-xl border bg-card hover:border-primary/50 text-center space-y-1.5 transition-colors"
          >
            <BarChart3 className="w-5 h-5 mx-auto text-purple-500" />
            <span className="font-semibold block">Analytics</span>
          </Link>

          <Link
            href="/admin/settings"
            className="p-3.5 rounded-xl border bg-card hover:border-primary/50 text-center space-y-1.5 transition-colors"
          >
            <Sliders className="w-5 h-5 mx-auto text-rose-500" />
            <span className="font-semibold block">Policies</span>
          </Link>
        </div>

        {/* Analytics Charts */}
        <OccupancyCharts summaries={summaries} />

        {/* Audit Log Stream */}
        <div className="bg-card border rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-primary" />
              <span>Security & Administrative Audit Log</span>
            </h3>
            <Link href="/admin/audit-logs" className="text-xs text-primary font-semibold hover:underline">
              View Full Audit Ledger
            </Link>
          </div>

          <div className="divide-y text-xs">
            {auditLogs.map((log) => (
              <div key={log.id} className="py-2.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground uppercase">
                    {log.action}
                  </span>
                  <div>
                    <span className="font-semibold text-foreground">{log.actorName}</span>
                    <span className="text-muted-foreground text-[11px] ml-2">
                      Target: {log.entityType} ({log.entityId})
                    </span>
                  </div>
                </div>
                <span className="text-muted-foreground font-mono text-[10px] whitespace-nowrap">
                  {formatISTDateTime(log.createdAt)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
