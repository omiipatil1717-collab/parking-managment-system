"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { storage } from "@/lib/storage";
import { RoleGuard } from "@/components/role-guard";
import { Reservation, ReservationStatus } from "@/lib/types";
import { formatISTDateTime, formatIndianPlate } from "@/lib/utils";
import { 
  ArrowLeft, 
  CalendarCheck, 
  Search, 
  Filter, 
  QrCode, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  Car
} from "lucide-react";

export default function AdminReservationsPage() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>(() => storage.getReservations());
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [actionNotice, setActionNotice] = useState("");

  const refresh = () => setReservations(storage.getReservations());

  const handleForceCancel = (id: string, code: string) => {
    const reason = window.prompt(`Enter administrative reason for cancelling pass ${code}:`, "Administrative capacity reallocation / event security");
    if (!reason) return;

    try {
      storage.cancelReservation(id, reason, user.id);
      refresh();
      setActionNotice(`Reservation ${code} has been cancelled by Administrator. Bay released.`);
      setTimeout(() => setActionNotice(""), 4000);
    } catch (err: any) {
      alert(err?.message || "Failed to cancel reservation");
    }
  };

  const filtered = reservations.filter((r) => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchCode = r.reservationCode.toLowerCase().includes(q);
      const matchPlate = r.vehicle?.registrationNumber.toLowerCase().includes(q);
      const matchUser = r.user?.fullName.toLowerCase().includes(q);
      if (!matchCode && !matchPlate && !matchUser) return false;
    }
    return true;
  });

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
            <h1 className="text-2xl font-bold tracking-tight">Master Reservation Ledger</h1>
            <p className="text-xs text-muted-foreground">
              Campus-wide repository of all issued digital parking passes, active bookings, and security passes
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search code, plate, or driver..."
                className="pl-9 pr-3 py-1.5 rounded-xl border bg-background text-xs focus:ring-2 focus:ring-primary focus:outline-none w-56"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border bg-background text-xs font-semibold focus:ring-2 focus:ring-primary focus:outline-none"
            >
              <option value="all">All Statuses ({reservations.length})</option>
              <option value="confirmed">Confirmed</option>
              <option value="checked_in">Checked In</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {actionNotice && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{actionNotice}</span>
          </div>
        )}

        <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b bg-muted/40 text-muted-foreground font-semibold">
                  <th className="py-3 px-4">Pass Code</th>
                  <th className="py-3 px-4">Driver & ID</th>
                  <th className="py-3 px-4">Vehicle Plate</th>
                  <th className="py-3 px-4">Zone & Bay</th>
                  <th className="py-3 px-4">Window (IST)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y text-foreground">
                {filtered.map((res) => (
                  <tr key={res.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-primary">
                      {res.reservationCode}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold">{res.user?.fullName}</div>
                      <div className="text-[10px] text-muted-foreground">{res.user?.campusId}</div>
                    </td>

                    <td className="py-3 px-4 font-mono font-bold">
                      {formatIndianPlate(res.vehicle?.registrationNumber || "")}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold">{res.zone?.code}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {res.space?.spaceNumber ? `Bay ${res.space.spaceNumber}` : "General"}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div>{formatISTDateTime(res.startTime)}</div>
                      <div className="text-[10px] text-muted-foreground">to {formatISTDateTime(res.endTime)}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          res.status === "confirmed"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                            : res.status === "checked_in"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                            : res.status === "completed"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300"
                            : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                      >
                        {res.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/reservations/${res.id}`}
                          className="px-2.5 py-1 rounded-lg border bg-muted/40 hover:bg-muted font-medium text-[11px]"
                        >
                          Pass
                        </Link>

                        {res.status === "confirmed" && (
                          <button
                            onClick={() => handleForceCancel(res.id, res.reservationCode)}
                            className="px-2.5 py-1 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 font-semibold text-[11px]"
                          >
                            Revoke
                          </button>
                        )}
                      </div>
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
