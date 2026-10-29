"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { storage } from "@/lib/storage";
import { ParkingSpace } from "@/lib/types";
import { BayGrid } from "@/components/parking/bay-grid";
import { formatIndianPlate } from "@/lib/utils";
import { 
  MapPin, 
  Car, 
  Clock, 
  Calendar, 
  ShieldCheck, 
  ArrowLeft, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2,
  Info,
  Sparkles
} from "lucide-react";

export default function ZoneDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const zoneId = (params?.zoneId as string) || "zone-a";

  const zone = storage.getZone(zoneId);
  const spaces = storage.getSpaces(zone?.id);
  const userVehicles = storage.getVehicles(user.id);
  const activeSessions = storage.getSessions("active", zone?.id);
  const confirmedReservations = storage.getReservations(undefined, "confirmed").filter((r) => r.zoneId === zone?.id);

  // Form states
  const [selectedSpace, setSelectedSpace] = useState<ParkingSpace | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(userVehicles[0]?.id || "");
  const [bookingDate, setBookingDate] = useState<string>(() => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  });
  const [startTime, setStartTime] = useState<string>("14:00");
  const [endTime, setEndTime] = useState<string>("17:00");
  const [error, setError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!zone) {
    return (
      <div className="py-12 text-center space-y-4">
        <h2 className="text-xl font-bold">Zone Not Found</h2>
        <p className="text-xs text-muted-foreground">The requested campus parking zone does not exist.</p>
        <Link href="/parking" className="inline-flex items-center gap-2 text-xs text-primary font-semibold hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Parking Areas
        </Link>
      </div>
    );
  }

  // Derive occupied and reserved space IDs
  const occupiedSpaceIds = activeSessions.map((s) => s.spaceId).filter(Boolean) as string[];
  const reservedSpaceIds = confirmedReservations.map((r) => r.spaceId).filter(Boolean) as string[];

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    if (!selectedVehicleId) {
      setError("Please select a registered vehicle or add one in My Vehicles.");
      setIsSubmitting(false);
      return;
    }

    if (endTime <= startTime) {
      setError("End time must be strictly after start time.");
      setIsSubmitting(false);
      return;
    }

    try {
      const startDateTime = new Date(`${bookingDate}T${startTime}:00+05:30`).toISOString();
      const endDateTime = new Date(`${bookingDate}T${endTime}:00+05:30`).toISOString();

      const newRes = storage.createReservation({
        userId: user.id,
        vehicleId: selectedVehicleId,
        zoneId: zone.id,
        spaceId: selectedSpace?.id,
        startTime: startDateTime,
        endTime: endDateTime,
      });

      router.push(`/reservations/${newRes.id}`);
    } catch (err: any) {
      setError(err?.message || "Booking could not be confirmed. Slot may have been taken.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Back button and title */}
      <div className="space-y-3 pb-3 border-b">
        <Link href="/parking" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Campus Zones
        </Link>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono font-bold text-xs bg-primary/10 text-primary px-2.5 py-0.5 rounded">
                {zone.code}
              </span>
              <span className="text-xs text-muted-foreground">• {zone.location}</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">{zone.name}</h1>
            <p className="text-xs text-muted-foreground max-w-2xl">{zone.description}</p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="px-3 py-1.5 rounded-xl border bg-muted/30 font-medium">
              Operating: {zone.openingTime} - {zone.closingTime} IST
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Visual Bay Grid Layout */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>Individual Bay Slot Allocation</span>
                </h3>
                <p className="text-xs text-muted-foreground">
                  Click any available green bay to reserve specifically, or book general capacity
                </p>
              </div>

              {selectedSpace && (
                <button
                  type="button"
                  onClick={() => setSelectedSpace(null)}
                  className="text-xs text-destructive hover:underline font-semibold"
                >
                  Clear Selection (Use Any Bay)
                </button>
              )}
            </div>

            {spaces.length > 0 ? (
              <BayGrid
                spaces={spaces}
                occupiedSpaceIds={occupiedSpaceIds}
                reservedSpaceIds={reservedSpaceIds}
                selectedSpaceId={selectedSpace?.id}
                onSelectSpace={(sp) => setSelectedSpace(sp)}
              />
            ) : (
              <div className="p-8 border border-dashed rounded-xl text-center text-xs text-muted-foreground">
                This zone uses open capacity allocation. Individual bay reservation is not required; capacity is validated automatically at the gate.
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Reservation Booking Engine Panel */}
        <div className="space-y-4">
          <div className="bg-card border rounded-2xl p-5 shadow-sm space-y-4 sticky top-20">
            <div>
              <span className="text-[11px] font-bold text-primary uppercase tracking-wider block">
                RESERVATION ENGINE
              </span>
              <h3 className="font-bold text-base text-foreground">Confirm Parking Pass</h3>
              <p className="text-xs text-muted-foreground">
                Atomic slot locking with concurrency protection
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleBooking} className="space-y-4 text-xs">
              {/* Selected Bay Indicator */}
              <div className="p-3 rounded-xl bg-muted/40 border space-y-1">
                <span className="text-muted-foreground block text-[10px]">Assigned Bay:</span>
                <span className="font-bold text-sm text-foreground">
                  {selectedSpace ? `Bay ${selectedSpace.spaceNumber} (${selectedSpace.spaceType.replace("_", " ")})` : "General Open Zone Allocation"}
                </span>
              </div>

              {/* Vehicle Selector */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-foreground">Select Vehicle *</label>
                  <Link href="/vehicles" className="text-primary hover:underline text-[11px]">
                    + Add New
                  </Link>
                </div>
                {userVehicles.length === 0 ? (
                  <div className="p-3 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs">
                    No vehicles registered yet. <Link href="/vehicles" className="font-bold underline">Add your vehicle plate</Link> to reserve.
                  </div>
                ) : (
                  <select
                    value={selectedVehicleId}
                    onChange={(e) => setSelectedVehicleId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border bg-background text-foreground text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    {userVehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {formatIndianPlate(v.registrationNumber)} ({v.makeModel} • {v.vehicleType})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Date */}
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Date (Indian Standard Time) *</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
                  <input
                    type="date"
                    required
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border bg-background text-foreground text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Time Window */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Start Time *</label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
                    <input
                      type="time"
                      required
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border bg-background text-foreground text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">End Time *</label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
                    <input
                      type="time"
                      required
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border bg-background text-foreground text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Campus Policy reminder */}
              <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 text-[11px] text-blue-950 dark:text-blue-200 space-y-1">
                <span className="font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary" /> Campus Rule Compliance
                </span>
                <p className="text-[10px] leading-relaxed text-muted-foreground">
                  30-min entry grace period allowed before start time. 15-min free cancellation window. Overstay penalties enforced by Security.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || userVehicles.length === 0}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-white font-semibold text-xs hover:bg-primary/90 transition-colors shadow-md disabled:opacity-50"
              >
                <span>Confirm Booking & Generate QR Pass</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
