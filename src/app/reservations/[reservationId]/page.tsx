"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { storage } from "@/lib/storage";
import { QRCodeDisplay } from "@/components/qr/qr-code-display";
import { formatISTDateTime, formatIndianPlate } from "@/lib/utils";
import { 
  ArrowLeft, 
  MapPin, 
  Car, 
  Clock, 
  ShieldCheck, 
  AlertCircle, 
  Navigation,
  Share2,
  CheckCircle2
} from "lucide-react";

export default function ReservationPassPage() {
  const params = useParams();
  const router = useRouter();
  const reservationId = (params?.reservationId as string) || "";

  const reservation = storage.getReservation(reservationId);
  const [copied, setCopied] = useState(false);

  if (!reservation) {
    return (
      <div className="py-12 text-center space-y-4">
        <h2 className="text-xl font-bold">Reservation Not Found</h2>
        <p className="text-xs text-muted-foreground">The requested campus pass code could not be located.</p>
        <Link href="/reservations" className="inline-flex items-center gap-2 text-xs text-primary font-semibold hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to My Passes
        </Link>
      </div>
    );
  }

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b">
        <Link
          href="/reservations"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Reservations
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border bg-card hover:bg-muted text-xs font-medium transition-colors"
          >
            {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? "Link Copied!" : "Share Pass"}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Printable Dynamic QR Pass */}
        <div>
          <QRCodeDisplay reservation={reservation} />
        </div>

        {/* Gate Entry Protocol & Directions */}
        <div className="space-y-5">
          <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-base flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>Campus Gate Protocol</span>
            </h3>

            <div className="space-y-3 text-xs text-muted-foreground">
              <div className="p-3 rounded-xl bg-muted/40 space-y-1">
                <span className="font-semibold text-foreground block">1. Arrival at Security Gate</span>
                <p className="leading-relaxed">
                  Approach <strong>{reservation.zone?.location}</strong> (recommended North Gate 1 or East Gate 2). Keep your digital QR code open on your smartphone screen.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-muted/40 space-y-1">
                <span className="font-semibold text-foreground block">2. Optical / Guard Authentication</span>
                <p className="leading-relaxed">
                  Havaldar Vikram or the gate ANPR scanner verifies your registered plate <strong>{formatIndianPlate(reservation.vehicle?.registrationNumber || "")}</strong> and logs your entry timestamp.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-muted/40 space-y-1">
                <span className="font-semibold text-foreground block">3. Park in Assigned Bay</span>
                <p className="leading-relaxed">
                  Proceed to <strong>{reservation.zone?.name}</strong>. Park inside <strong>{reservation.space?.spaceNumber ? `Bay ${reservation.space.spaceNumber}` : "any marked available bay"}</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Location & Navigation info */}
          <div className="bg-card border rounded-2xl p-5 shadow-sm space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold flex items-center gap-1.5 text-foreground">
                <MapPin className="w-4 h-4 text-primary" /> Sector Coordinates
              </span>
              <span className="font-mono text-muted-foreground">
                {reservation.zone?.latitude}, {reservation.zone?.longitude}
              </span>
            </div>
            <p className="text-muted-foreground">
              GPS Navigation points directly to the barrier entry of {reservation.zone?.name}.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
