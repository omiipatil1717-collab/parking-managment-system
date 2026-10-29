"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { storage } from "@/lib/storage";
import { formatISTDateTime, formatIndianPlate } from "@/lib/utils";
import { ParkingSession } from "@/lib/types";
import { 
  History, 
  Car, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight,
  Calendar,
  Filter
} from "lucide-react";

export default function HistoryPage() {
  const { user, role } = useAuth();
  const isAdminOrGuard = role === "security_guard" || role === "parking_manager" || role === "super_admin";
  const [filterMode, setFilterMode] = useState<"all" | "my">(isAdminOrGuard ? "all" : "my");
  const [sessions, setSessions] = useState<ParkingSession[]>([]);

  useEffect(() => {
    if (isAdminOrGuard) {
      setFilterMode("all");
    } else {
      setFilterMode("my");
    }
  }, [isAdminOrGuard, role]);

  useEffect(() => {
    const loadSessions = () => {
      if (!user) return;
      const allSessions = storage.getSessions();
      if (filterMode === "all" && isAdminOrGuard) {
        setSessions(allSessions);
      } else {
        const userVehicles = storage.getVehicles(user.id);
        const userVehicleIds = userVehicles.map((v) => v.id);
        setSessions(allSessions.filter((s) => userVehicleIds.includes(s.vehicleId)));
      }
    };

    loadSessions();

    const handleDataChanged = () => loadSessions();
    window.addEventListener("smartpark-data-changed", handleDataChanged);
    return () => window.removeEventListener("smartpark-data-changed", handleDataChanged);
  }, [user, filterMode, isAdminOrGuard]);

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Campus Parking History</h1>
          <p className="text-xs text-muted-foreground">
            Complete record of all verified gate entry and exit sessions at IITM Campus
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isAdminOrGuard && (
            <div className="flex items-center bg-muted rounded-lg p-0.5 text-xs">
              <button
                onClick={() => setFilterMode("all")}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  filterMode === "all" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All Campus
              </button>
              <button
                onClick={() => setFilterMode("my")}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  filterMode === "my" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                My Vehicles
              </button>
            </div>
          )}
          <span className="text-xs font-mono bg-muted px-2.5 py-1 rounded-md text-muted-foreground">
            {sessions.length} Recorded Sessions
          </span>
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-16 border border-dashed rounded-2xl bg-muted/20 space-y-3">
          <History className="w-12 h-12 text-muted-foreground/40 mx-auto" />
          <h3 className="font-bold text-sm">No parking sessions recorded</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {filterMode === "all"
              ? "There are currently no gate sessions in campus database."
              : "You have not parked a vehicle on campus yet. When you enter campus gates with a pass, your gate check-in will appear here."}
          </p>
          <Link
            href="/parking"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold shadow-sm"
          >
            <span>Book a slot</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b bg-muted/40 text-muted-foreground font-semibold">
                  <th className="py-3.5 px-4">Vehicle Plate</th>
                  <th className="py-3.5 px-4">Parking Zone & Bay</th>
                  <th className="py-3.5 px-4">Inbound Entry (IST)</th>
                  <th className="py-3.5 px-4">Outbound Exit (IST)</th>
                  <th className="py-3.5 px-4">Duration</th>
                  <th className="py-3.5 px-4">Session Status</th>
                </tr>
              </thead>
              <tbody className="divide-y text-foreground">
                {sessions.map((session) => {
                  const entry = new Date(session.entryTime);
                  const exit = session.exitTime ? new Date(session.exitTime) : null;
                  const durationMins = exit
                    ? Math.round((exit.getTime() - entry.getTime()) / 60000)
                    : Math.round((Date.now() - entry.getTime()) / 60000);

                  const hours = Math.floor(durationMins / 60);
                  const mins = Math.max(0, durationMins % 60);
                  const durationStr = hours > 0 ? `${hours}h ${mins}m` : `${mins} mins`;

                  return (
                    <tr key={session.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-foreground">
                          {formatIndianPlate(session.vehicle?.registrationNumber || "")}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {session.vehicle?.makeModel || "Campus Registered"}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-foreground">
                          {session.zone?.name || "Campus Zone"}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {session.space?.spaceNumber ? `Bay ${session.space.spaceNumber}` : "General Bay"}
                        </div>
                      </td>

                      <td className="py-3 px-4" suppressHydrationWarning>
                        <div className="font-medium">
                          {formatISTDateTime(session.entryTime)}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          Via {session.entryGate}
                        </div>
                      </td>

                      <td className="py-3 px-4" suppressHydrationWarning>
                        {session.exitTime ? (
                          <>
                            <div className="font-medium">
                              {formatISTDateTime(session.exitTime)}
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                              Via {session.exitGate || session.entryGate}
                            </div>
                          </>
                        ) : (
                          <span className="text-emerald-600 font-semibold flex items-center gap-1 text-[11px]">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                            Currently Parked
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 font-mono font-medium" suppressHydrationWarning>
                        {durationStr}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            session.status === "active"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                              : session.status === "overstayed"
                              ? "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300"
                          }`}
                        >
                          {session.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
