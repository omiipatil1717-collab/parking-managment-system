"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { storage } from "@/lib/storage";
import { formatISTDateTime, formatISTTime, formatIndianPlate } from "@/lib/utils";
import { 
  Car, 
  MapPin, 
  CalendarCheck, 
  Clock, 
  QrCode, 
  Plus, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  Zap,
  Accessibility,
  Bike,
  ShieldCheck
} from "lucide-react";

export default function StudentFacultyDashboard() {
  const { user } = useAuth();
  const [vehicleFilter, setVehicleFilter] = useState<string>("all");

  const vehicles = storage.getVehicles(user.id);
  const reservations = storage.getReservations(user.id);
  const userVehicleIds = vehicles.map((v) => v.id);
  
  // Find current active session for this user's vehicles
  const allActiveSessions = storage.getSessions("active");
  const currentSession = allActiveSessions.find((s) => userVehicleIds.includes(s.vehicleId));

  // Find upcoming confirmed reservation
  const upcomingReservation = reservations.find((r) => r.status === "confirmed");

  // Zone summaries
  const summaries = storage.getOccupancySummaries();
  const totalUsable = summaries.reduce((acc, s) => acc + s.usableCapacity, 0);
  const totalParked = summaries.reduce((acc, s) => acc + s.activeSessions, 0);
  const totalAvailable = summaries.reduce((acc, s) => acc + s.availableNow, 0);

  // Filtered zones
  const filteredSummaries = summaries.filter((s) => {
    if (vehicleFilter === "two_wheeler") return s.zoneId === "zone-c" || s.zoneId === "zone-e";
    if (vehicleFilter === "electric_vehicle") return s.zoneId === "zone-a" || s.zoneId === "zone-b";
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary capitalize">
              {user.role.replace("_", " ")} Portal
            </span>
            <span className="text-xs text-muted-foreground">• {user.campusId}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome back, {user.fullName}</h1>
          <p className="text-xs text-muted-foreground">
            {user.department} • IITM Smart Campus Parking
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/parking"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white font-medium text-xs hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Book Parking Slot</span>
          </Link>

          <Link
            href="/vehicles"
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border bg-card hover:bg-muted font-medium text-xs transition-colors"
          >
            <Car className="w-4 h-4 text-muted-foreground" />
            <span>My Vehicles ({vehicles.length})</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border rounded-2xl p-4 shadow-sm space-y-1">
          <span className="text-xs text-muted-foreground font-medium block">Available Slots Now</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
              {totalAvailable}
            </span>
            <span className="text-xs text-muted-foreground">/ {totalUsable}</span>
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium block">
            Across 5 campus sectors
          </span>
        </div>

        <div className="bg-card border rounded-2xl p-4 shadow-sm space-y-1">
          <span className="text-xs text-muted-foreground font-medium block">Campus Occupancy</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-foreground font-mono">
              {totalUsable > 0 ? Math.round((totalParked / totalUsable) * 100) : 0}%
            </span>
            <span className="text-xs text-muted-foreground">({totalParked} parked)</span>
          </div>
          <span className="text-[10px] text-muted-foreground block">
            Verified gate counts
          </span>
        </div>

        <div className="bg-card border rounded-2xl p-4 shadow-sm space-y-1">
          <span className="text-xs text-muted-foreground font-medium block">Active Bookings</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 font-mono">
              {reservations.filter((r) => r.status === "confirmed" || r.status === "checked_in").length}
            </span>
            <span className="text-xs text-muted-foreground">passes</span>
          </div>
          <span className="text-[10px] text-muted-foreground block">
            Valid digital passes
          </span>
        </div>

        <div className="bg-card border rounded-2xl p-4 shadow-sm space-y-1">
          <span className="text-xs text-muted-foreground font-medium block">Current Status</span>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-foreground">
              {currentSession ? "Parked Inside" : "Not on Campus"}
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground block">
            {currentSession ? `At ${currentSession.zone?.name || "Campus Bay"}` : "No active session"}
          </span>
        </div>
      </div>

      {/* Real-time Parking Session Alert Banner (if user is currently parked on campus) */}
      {currentSession && (
        <div className="border border-emerald-300 dark:border-emerald-800 bg-emerald-50/80 dark:bg-emerald-950/30 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide">
                    ACTIVE PARKING SESSION DETECTED
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                </div>
                <h3 className="font-bold text-base text-foreground">
                  Vehicle {formatIndianPlate(currentSession.vehicle?.registrationNumber || "")} is Parked in {currentSession.zone?.name}
                </h3>
              </div>
            </div>

            <div className="text-right text-xs">
              <span className="text-muted-foreground block">Entry Gate & Time</span>
              <span className="font-semibold">{currentSession.entryGate} • {formatISTTime(currentSession.entryTime)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-emerald-200 dark:border-emerald-900 text-xs text-emerald-900 dark:text-emerald-300">
            <span>Slot Bay: <strong>{currentSession.space?.spaceNumber || "General Quad Bay"}</strong></span>
            <Link
              href={currentSession.reservationId ? `/reservations/${currentSession.reservationId}` : "/history"}
              className="font-semibold text-primary hover:underline flex items-center gap-1"
            >
              <span>View Pass & Exit Instructions</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Grid: Upcoming Pass & Fast Zone Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next Upcoming Reservation Card */}
        <div className="bg-card border rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-primary" />
              <span>Upcoming Reservation</span>
            </h3>
            <Link href="/reservations" className="text-xs text-primary font-medium hover:underline">
              All Passes
            </Link>
          </div>

          {upcomingReservation ? (
            <div className="bg-muted/40 border rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-xs bg-card px-2 py-0.5 rounded border">
                  {upcomingReservation.reservationCode}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 uppercase">
                  Confirmed
                </span>
              </div>

              <div className="space-y-1 text-xs">
                <div className="font-bold text-sm text-foreground">{upcomingReservation.zone?.name}</div>
                <div className="text-muted-foreground flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5 text-primary" />
                  <span>{formatIndianPlate(upcomingReservation.vehicle?.registrationNumber || "")}</span>
                </div>
                <div className="text-muted-foreground flex items-center gap-1.5 pt-1">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  <span>{formatISTDateTime(upcomingReservation.startTime)}</span>
                </div>
              </div>

              <div className="pt-2 border-t">
                <Link
                  href={`/reservations/${upcomingReservation.id}`}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-primary text-white font-medium text-xs hover:bg-primary/90 transition-colors shadow-sm"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Show Digital QR Pass</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 px-4 border border-dashed rounded-xl bg-muted/20 space-y-2">
              <CalendarCheck className="w-8 h-8 text-muted-foreground/60 mx-auto" />
              <p className="text-xs text-muted-foreground font-medium">No upcoming reservations</p>
              <Link
                href="/parking"
                className="inline-flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline"
              >
                <span>Book a bay now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {/* Registered Vehicle Quick List */}
          <div className="pt-2 border-t space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold">My Registered Vehicles</span>
              <Link href="/vehicles" className="text-xs text-primary font-medium hover:underline">
                Manage
              </Link>
            </div>

            {vehicles.length === 0 ? (
              <p className="text-xs text-muted-foreground py-2">No vehicles registered yet.</p>
            ) : (
              vehicles.map((v) => (
                <div key={v.id} className="p-2.5 rounded-xl border bg-muted/30 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      {v.vehicleType === "two_wheeler" ? <Bike className="w-4 h-4" /> : <Car className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="font-mono font-bold">{formatIndianPlate(v.registrationNumber)}</div>
                      <div className="text-[10px] text-muted-foreground">{v.makeModel}</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-100 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                    Verified
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Live Zone Telemetry Cards */}
        <div className="lg:col-span-2 bg-card border rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <span>Campus Parking Zones Live Status</span>
              </h3>
              <p className="text-xs text-muted-foreground">
                Verified slot availability across all campus sectors
              </p>
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-1.5 text-xs">
              <button
                onClick={() => setVehicleFilter("all")}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  vehicleFilter === "all" ? "bg-primary text-white" : "bg-muted hover:bg-muted/80 text-muted-foreground"
                }`}
              >
                All Zones
              </button>
              <button
                onClick={() => setVehicleFilter("two_wheeler")}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  vehicleFilter === "two_wheeler" ? "bg-primary text-white" : "bg-muted hover:bg-muted/80 text-muted-foreground"
                }`}
              >
                2-Wheeler
              </button>
              <button
                onClick={() => setVehicleFilter("electric_vehicle")}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  vehicleFilter === "electric_vehicle" ? "bg-primary text-white" : "bg-muted hover:bg-muted/80 text-muted-foreground"
                }`}
              >
                EV Fast Charging
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {filteredSummaries.map((zone) => {
              const isNearingFull = zone.occupancyPercent >= 85;
              const isFull = zone.availableNow <= 0;

              return (
                <div
                  key={zone.zoneId}
                  className="p-4 rounded-xl border bg-muted/20 hover:border-primary/40 transition-colors flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold text-primary block">
                        {zone.zoneCode}
                      </span>
                      <h4 className="font-bold text-sm text-foreground">{zone.zoneName}</h4>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        isFull
                          ? "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300"
                          : isNearingFull
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                          : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                      }`}
                    >
                      {isFull ? "Full" : isNearingFull ? "Busy" : "Available"}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>Available Now: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{zone.availableNow}</strong></span>
                      <span>{zone.occupancyPercent}% Occupied</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isFull ? "bg-red-500" : isNearingFull ? "bg-amber-500" : "bg-emerald-500"
                        }`}
                        style={{ width: `${zone.occupancyPercent}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="pt-2 border-t flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground">
                      Usable: {zone.usableCapacity} bays
                    </span>
                    <Link
                      href={`/parking/${zone.zoneId}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                    >
                      <span>Inspect Bay Grid</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 text-center">
            <Link
              href="/parking"
              className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline"
            >
              <span>Open Campus Interactive SVG Map</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
