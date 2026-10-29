"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { storage } from "@/lib/storage";
import { Reservation, ReservationStatus } from "@/lib/types";
import { formatISTDateTime, formatIndianPlate } from "@/lib/utils";
import { 
  CalendarCheck, 
  Car, 
  MapPin, 
  Clock, 
  QrCode, 
  XCircle, 
  Plus, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";

export default function ReservationsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("all");
  const [reservations, setReservations] = useState<Reservation[]>(() => storage.getReservations(user?.id));
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  const refresh = React.useCallback(() => {
    if (user?.id) {
      setReservations(storage.getReservations(user.id));
    }
  }, [user?.id]);

  useEffect(() => {
    refresh();
    const handleDataChanged = () => refresh();
    window.addEventListener("smartpark-data-changed", handleDataChanged);
    return () => window.removeEventListener("smartpark-data-changed", handleDataChanged);
  }, [refresh]);

  const filteredReservations = reservations.filter((r) => {
    if (activeTab === "all") return true;
    if (activeTab === "upcoming") return r.status === "confirmed";
    if (activeTab === "checked_in") return r.status === "checked_in";
    if (activeTab === "completed") return r.status === "completed";
    if (activeTab === "cancelled") return r.status === "cancelled";
    return true;
  });

  const handleCancelBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancellingId) return;

    try {
      storage.cancelReservation(cancellingId, cancelReason || "Cancelled by user");
      setCancellingId(null);
      setCancelReason("");
      setActionMessage("Reservation successfully cancelled. Capacity has been released back to campus.");
      refresh();
      setTimeout(() => setActionMessage(""), 4000);
    } catch (err: any) {
      alert(err?.message || "Failed to cancel reservation.");
    }
  };

  const getStatusBadge = (status: ReservationStatus) => {
    switch (status) {
      case "confirmed":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 uppercase">Confirmed</span>;
      case "checked_in":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 uppercase">Checked In</span>;
      case "completed":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 uppercase">Completed</span>;
      case "cancelled":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 uppercase">Cancelled</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-muted text-muted-foreground uppercase">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Parking Passes & Reservations</h1>
          <p className="text-xs text-muted-foreground">
            Track confirmed bookings, display gate QR passes, and view check-in records
          </p>
        </div>

        <Link
          href="/parking"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white font-medium text-xs hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Reservation</span>
        </Link>
      </div>

      {actionMessage && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b pb-2 text-xs overflow-x-auto">
        {[
          { id: "all", label: "All Passes", count: reservations.length },
          { id: "upcoming", label: "Upcoming (Confirmed)", count: reservations.filter((r) => r.status === "confirmed").length },
          { id: "checked_in", label: "Parked (Checked In)", count: reservations.filter((r) => r.status === "checked_in").length },
          { id: "completed", label: "Completed", count: reservations.filter((r) => r.status === "completed").length },
          { id: "cancelled", label: "Cancelled", count: reservations.filter((r) => r.status === "cancelled").length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-primary text-white shadow-sm"
                : "bg-muted/50 text-muted-foreground hover:bg-muted"
            }`}
          >
            <span>{tab.label}</span>
            <span className="text-[10px] opacity-80 px-1.5 py-0.2 rounded-full bg-black/20">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-4">
        {filteredReservations.length === 0 ? (
          <div className="text-center py-12 border border-dashed rounded-2xl bg-muted/20 space-y-3">
            <CalendarCheck className="w-10 h-10 text-muted-foreground/40 mx-auto" />
            <h3 className="font-bold text-sm">No reservations found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              There are no parking passes matching the selected filter.
            </p>
            <Link
              href="/parking"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold shadow-sm"
            >
              <Plus className="w-4 h-4" /> Book a slot now
            </Link>
          </div>
        ) : (
          filteredReservations.map((res) => (
            <div
              key={res.id}
              className="bg-card border rounded-2xl p-5 shadow-sm space-y-4 hover:border-primary/40 transition-colors"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-foreground">
                        {res.reservationCode}
                      </span>
                      {getStatusBadge(res.status)}
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      Booked on {formatISTDateTime(res.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Link
                    href={`/reservations/${res.id}`}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>View Digital Pass</span>
                  </Link>

                  {res.status === "confirmed" && (
                    <button
                      onClick={() => setCancellingId(res.id)}
                      className="px-3.5 py-2 rounded-xl border border-destructive/30 text-destructive hover:bg-destructive/10 text-xs font-semibold transition-colors"
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="space-y-1">
                  <span className="text-muted-foreground text-[10px] block">Parking Sector & Space</span>
                  <div className="font-bold flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    <span>{res.zone?.name || "Campus Zone"}</span>
                  </div>
                  <span className="text-muted-foreground text-[11px] block">
                    {res.space?.spaceNumber ? `Assigned Bay: ${res.space.spaceNumber}` : "General Zone Allocation"}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-muted-foreground text-[10px] block">Vehicle Plate</span>
                  <div className="font-mono font-bold text-sm flex items-center gap-1.5">
                    <Car className="w-3.5 h-3.5 text-primary" />
                    <span>{formatIndianPlate(res.vehicle?.registrationNumber || "")}</span>
                  </div>
                  <span className="text-muted-foreground text-[11px] block">
                    {res.vehicle?.makeModel}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-muted-foreground text-[10px] block">Booking Window (IST)</span>
                  <div className="font-medium flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    <span>{formatISTDateTime(res.startTime)}</span>
                  </div>
                  <span className="text-muted-foreground text-[11px] block">
                    until {formatISTDateTime(res.endTime)}
                  </span>
                </div>
              </div>

              {res.cancellationReason && (
                <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/20 text-red-900 dark:text-red-300 text-[11px] border border-red-200 dark:border-red-900 flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Cancellation Note: {res.cancellationReason}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Cancellation Modal */}
      {cancellingId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95">
            <h3 className="font-bold text-base">Cancel Reservation</h3>
            <p className="text-xs text-muted-foreground">
              Are you sure you want to cancel this booking? The slot will be immediately released for other campus members.
            </p>

            <form onSubmit={handleCancelBooking} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Reason for Cancellation</label>
                <textarea
                  rows={3}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g. Class lecture rescheduled or using campus shuttle..."
                  className="w-full px-3 py-2 rounded-xl border bg-background text-foreground text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setCancellingId(null)}
                  className="px-4 py-2 rounded-xl border bg-muted/40 hover:bg-muted font-medium text-xs"
                >
                  Keep Booking
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-destructive text-white font-semibold text-xs hover:bg-destructive/90 transition-colors shadow-sm"
                >
                  Confirm Cancellation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
