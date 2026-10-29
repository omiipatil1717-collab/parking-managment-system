"use client";

import React from "react";
import Link from "next/link";
import { storage } from "@/lib/storage";
import { RoleGuard } from "@/components/role-guard";
import { formatISTDateTime } from "@/lib/utils";
import { 
  ArrowLeft, 
  ShieldCheck, 
  Radio, 
  Car, 
  Clock, 
  MapPin, 
  UserCheck 
} from "lucide-react";

export default function AdminGuardsPage() {
  const users = storage.getUsers();
  const guards = users.filter((u) => u.role === "security_guard");
  const gateEvents = storage.getGateEvents();

  const gates = [
    { id: "North Gate 1", name: "North Gate 1", location: "Sector 1 (Adjacent to CSE & Labs)", status: "Active (Shift A)", guard: "Havaldar Vikram Singh" },
    { id: "East Gate 2", name: "East Gate 2", location: "Sector 3 (Tech Park & Incubation Hub)", status: "Active (Shift A)", guard: "Havaldar Vikram Singh" },
    { id: "Central Gate 3", name: "Central Gate 3", location: "Sector 2 (Central Library Spine)", status: "Active (Shift A)", guard: "Automated ANPR Sensor 3" },
    { id: "South Gate 4", name: "South Gate 4", location: "Sector 5 (Sports Arena & Hostels)", status: "Active (Shift A)", guard: "Automated ANPR Sensor 4" },
  ];

  return (
    <RoleGuard allowedRoles={["parking_manager", "super_admin"]}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b">
          <div className="space-y-1">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Admin Hub
            </Link>
            <h1 className="text-2xl font-bold tracking-tight">Security Gates & Guard Roster</h1>
            <p className="text-xs text-muted-foreground">
              Monitor active barrier stations, guard shift allocations, and optical scanning compliance
            </p>
          </div>
        </div>

        {/* Gate Stations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {gates.map((g) => {
            const gateScans = gateEvents.filter((e) => e.gateIdentifier === g.id);
            return (
              <div key={g.id} className="bg-card border rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <h3 className="font-bold text-base">{g.name}</h3>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                    {g.status}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground">{g.location}</p>

                <div className="pt-2 border-t grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground text-[10px] block">Assigned Personnel</span>
                    <span className="font-semibold text-foreground">{g.guard}</span>
                  </div>

                  <div>
                    <span className="text-muted-foreground text-[10px] block">Recorded Gate Events</span>
                    <span className="font-bold font-mono text-primary">{gateScans.length} events</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Security Personnel Roster */}
        <div className="bg-card border rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-base flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span>Authorized Security Guards</span>
          </h3>

          <div className="divide-y text-xs">
            {guards.map((guard) => (
              <div key={guard.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-bold text-foreground">{guard.fullName}</div>
                  <div className="text-[10px] text-muted-foreground font-mono">
                    Badge ID: {guard.campusId} • {guard.department}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-emerald-600 font-semibold block text-[11px]">
                    Active on Duty
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    Phone: {guard.phoneNumber || "Ext 401"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
