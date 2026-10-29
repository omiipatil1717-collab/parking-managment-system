"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { storage } from "@/lib/storage";
import { RoleGuard } from "@/components/role-guard";
import { ParkingSession, ZoneOccupancySummary } from "@/lib/types";
import { formatISTDateTime, formatIndianPlate } from "@/lib/utils";
import { 
  ArrowLeft, 
  Car, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle, 
  LogOut, 
  RefreshCw,
  SlidersHorizontal,
  Wrench
} from "lucide-react";

export default function AdminSessionsPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<ParkingSession[]>(() => storage.getSessions("active"));
  const [summaries, setSummaries] = useState<ZoneOccupancySummary[]>(() => storage.getOccupancySummaries());
  const [selectedZoneReconcile, setSelectedZoneReconcile] = useState<string>("zone-a");
  const [physicalCount, setPhysicalCount] = useState<number>(0);
  const [reconcileReason, setReconcileReason] = useState<string>("");
  const [actionSuccess, setActionSuccess] = useState<string>("");

  const refresh = () => {
    setSessions(storage.getSessions("active"));
    setSummaries(storage.getOccupancySummaries());
  };

  const handleForceCheckout = (session: ParkingSession) => {
    if (!window.confirm(`Force check-out vehicle ${session.vehicle?.registrationNumber}?`)) return;
    try {
      storage.processGateExit({
        sessionId: session.id,
        guardId: user.id,
        gateIdentifier: "Admin Console Override",
      });
      refresh();
      setActionSuccess(`Vehicle ${session.vehicle?.registrationNumber} checked out. Slot released.`);
      setTimeout(() => setActionSuccess(""), 4000);
    } catch (err: any) {
      alert(err?.message || "Failed to force check out");
    }
  };

  const handleReconcile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reconcileReason) {
      alert("Please provide an audit reason for reconciliation.");
      return;
    }
    try {
      storage.reconcileOccupancy(selectedZoneReconcile, Number(physicalCount), reconcileReason, user.id);
      refresh();
      setActionSuccess("Physical zone occupancy discrepancy reconciled and logged in immutable security audit.");
      setReconcileReason("");
      setTimeout(() => setActionSuccess(""), 5000);
    } catch (err: any) {
      alert(err?.message || "Reconciliation failed");
    }
  };

  return (
    <RoleGuard allowedRoles={["parking_manager", "super_admin"]}>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b">
          <div className="space-y-1">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Admin Hub
            </Link>
            <h1 className="text-2xl font-bold tracking-tight">Active Parking Sessions & Reconciliation</h1>
            <p className="text-xs text-muted-foreground">
              Monitor vehicles currently parked inside campus and reconcile physical sensor discrepancies
            </p>
          </div>

          <button
            onClick={refresh}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border bg-card hover:bg-muted text-xs font-semibold transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-muted-foreground" />
            <span>Sync Live Telemetry</span>
          </button>
        </div>

        {actionSuccess && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Occupancy Calculation Truth Matrix */}
        <div className="bg-card border rounded-2xl p-5 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-base flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-primary" />
              <span>Campus Occupancy Truth Matrix</span>
            </h3>
            <p className="text-xs text-muted-foreground">
              Distinguishing configured capacity, usable capacity, physically present vehicles, and advance reservations
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b bg-muted/40 text-muted-foreground font-semibold">
                  <th className="py-3 px-4">Zone</th>
                  <th className="py-3 px-4 text-center">Total Cap</th>
                  <th className="py-3 px-4 text-center">Usable Cap</th>
                  <th className="py-3 px-4 text-center">Physically Parked</th>
                  <th className="py-3 px-4 text-center">Active Bookings</th>
                  <th className="py-3 px-4 text-center">Available Now</th>
                  <th className="py-3 px-4 text-right">Occupancy %</th>
                </tr>
              </thead>
              <tbody className="divide-y text-foreground">
                {summaries.map((s) => (
                  <tr key={s.zoneId} className="hover:bg-muted/30">
                    <td className="py-3 px-4 font-bold">
                      <span>{s.zoneName}</span>
                      <span className="text-[10px] text-muted-foreground block font-mono font-normal">{s.zoneCode}</span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono">{s.totalCapacity}</td>
                    <td className="py-3 px-4 text-center font-mono font-semibold">{s.usableCapacity}</td>
                    <td className="py-3 px-4 text-center font-mono text-primary font-bold">{s.activeSessions}</td>
                    <td className="py-3 px-4 text-center font-mono text-amber-600">{s.activeReservations}</td>
                    <td className="py-3 px-4 text-center font-mono text-emerald-600 font-bold">{s.availableNow}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold">
                      {s.occupancyPercent}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Active Parked Vehicles List */}
        <div className="bg-card border rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base flex items-center gap-2">
                <Car className="w-4 h-4 text-emerald-600" />
                <span>Vehicles Inside Campus ({sessions.length})</span>
              </h3>
              <p className="text-xs text-muted-foreground">
                Active sessions created by verified gate entries
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b bg-muted/40 text-muted-foreground font-semibold">
                  <th className="py-3 px-4">Vehicle Plate</th>
                  <th className="py-3 px-4">Zone & Bay</th>
                  <th className="py-3 px-4">Entry Gate</th>
                  <th className="py-3 px-4">Entry Time (IST)</th>
                  <th className="py-3 px-4">Duration Inside</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y text-foreground">
                {sessions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      No vehicles currently parked inside campus.
                    </td>
                  </tr>
                ) : (
                  sessions.map((ses) => {
                    const durationMins = Math.round((Date.now() - new Date(ses.entryTime).getTime()) / 60000);
                    const hours = Math.floor(durationMins / 60);
                    const mins = durationMins % 60;

                    return (
                      <tr key={ses.id} className="hover:bg-muted/30">
                        <td className="py-3 px-4 font-mono font-bold text-foreground">
                          {formatIndianPlate(ses.vehicle?.registrationNumber || "")}
                        </td>

                        <td className="py-3 px-4 font-medium">
                          {ses.zone?.name}
                          <span className="text-[10px] text-muted-foreground block">
                            {ses.space?.spaceNumber ? `Bay ${ses.space.spaceNumber}` : "General Slot"}
                          </span>
                        </td>

                        <td className="py-3 px-4">{ses.entryGate}</td>

                        <td className="py-3 px-4 font-mono text-muted-foreground">
                          {formatISTDateTime(ses.entryTime)}
                        </td>

                        <td className="py-3 px-4 font-mono font-semibold">
                          {hours > 0 ? `${hours}h ${mins}m` : `${mins}m`}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleForceCheckout(ses)}
                            className="px-2.5 py-1 rounded-lg border border-primary/30 text-primary hover:bg-primary/10 font-semibold text-[11px]"
                          >
                            Force Checkout
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Discrepancy Reconciliation Tool */}
        <div className="bg-card border rounded-2xl p-5 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-base flex items-center gap-2">
              <Wrench className="w-4 h-4 text-primary" />
              <span>Administrative Discrepancy Reconciliation</span>
            </h3>
            <p className="text-xs text-muted-foreground">
              If an ANPR camera drops offline or a manual guard bypass occurred, audit and correct physical counts
            </p>
          </div>

          <form onSubmit={handleReconcile} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs items-end">
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Select Zone</label>
              <select
                value={selectedZoneReconcile}
                onChange={(e) => setSelectedZoneReconcile(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border bg-background text-xs focus:ring-2 focus:ring-primary focus:outline-none"
              >
                {summaries.map((s) => (
                  <option key={s.zoneId} value={s.zoneId}>
                    {s.zoneCode} — {s.zoneName}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Physical Headcount Observed</label>
              <input
                type="number"
                min={0}
                required
                value={physicalCount}
                onChange={(e) => setPhysicalCount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border bg-background text-xs focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Audit Reason</label>
              <input
                type="text"
                required
                value={reconcileReason}
                onChange={(e) => setReconcileReason(e.target.value)}
                placeholder="e.g. Physical patrol count after heavy rain"
                className="w-full px-3 py-2 rounded-xl border bg-background text-xs focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="py-2.5 px-4 rounded-xl bg-primary text-white font-semibold text-xs hover:bg-primary/90 transition-colors shadow-sm"
            >
              Reconcile Count
            </button>
          </form>
        </div>
      </div>
    </RoleGuard>
  );
}
