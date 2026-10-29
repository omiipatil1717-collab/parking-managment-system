"use client";

import React, { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Reservation } from "@/lib/types";
import { formatISTDateTime, formatIndianPlate } from "@/lib/utils";
import { ShieldCheck, Download, Printer, Car, Clock, MapPin, User } from "lucide-react";

interface QRCodeDisplayProps {
  reservation: Reservation;
}

export function QRCodeDisplay({ reservation }: QRCodeDisplayProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  // Safe QR payload containing token hash and code only (NO sensitive PII)
  const qrPayload = JSON.stringify({
    app: "SmartPark-Campus",
    code: reservation.reservationCode,
    hash: reservation.qrTokenHash,
    zone: reservation.zoneId,
    v: 1,
  });

  return (
    <div className="bg-card border rounded-2xl p-6 shadow-md max-w-md mx-auto space-y-6 text-foreground print:border-none print:shadow-none" ref={cardRef}>
      {/* Pass Header */}
      <div className="border-b pb-4 flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold text-primary tracking-wider uppercase block">
            IITM CAMPUS PARKING PASS
          </span>
          <span className="text-xl font-mono font-bold tracking-tight">
            {reservation.reservationCode}
          </span>
        </div>
        <div className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span className="capitalize">{reservation.status}</span>
        </div>
      </div>

      {/* High-Resolution QR Code */}
      <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border shadow-inner">
        <QRCodeSVG
          value={qrPayload}
          size={200}
          level="H"
          includeMargin={true}
          imageSettings={{
            src: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%232563eb' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><rect width='18' height='18' x='3' y='3' rx='2'/><path d='M9 17V7h4a3 3 0 0 1 0 6H9'/></svg>",
            x: undefined,
            y: undefined,
            height: 36,
            width: 36,
            excavate: true,
          }}
        />
        <span className="text-[11px] text-slate-500 font-mono mt-2">
          Present at Gate ANPR / Security Scanner
        </span>
      </div>

      {/* Pass Metadata List */}
      <div className="space-y-3 text-xs bg-muted/40 p-4 rounded-xl border">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground flex items-center gap-1.5">
            <Car className="w-4 h-4 text-primary" /> Vehicle Number
          </span>
          <span className="font-mono font-bold text-sm bg-card px-2 py-0.5 rounded border">
            {formatIndianPlate(reservation.vehicle?.registrationNumber || "")}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-muted-foreground flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-primary" /> Parking Zone & Bay
          </span>
          <span className="font-semibold text-right">
            {reservation.zone?.name || "Campus Zone"}
            {reservation.space?.spaceNumber ? ` (Bay ${reservation.space.spaceNumber})` : " (General Bay)"}
          </span>
        </div>

        <div className="flex items-start justify-between">
          <span className="text-muted-foreground flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-primary" /> Valid Window (IST)
          </span>
          <div className="text-right">
            <div className="font-medium">{formatISTDateTime(reservation.startTime)}</div>
            <div className="text-muted-foreground text-[10px]">until {formatISTDateTime(reservation.endTime)}</div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t pt-2">
          <span className="text-muted-foreground flex items-center gap-1.5">
            <User className="w-4 h-4 text-primary" /> Driver Name & ID
          </span>
          <span className="font-medium text-right">
            {reservation.user?.fullName} ({reservation.user?.campusId})
          </span>
        </div>
      </div>

      {/* Print / Download actions */}
      <div className="flex items-center gap-3 print:hidden">
        <button
          onClick={handlePrint}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border bg-card hover:bg-muted font-medium text-xs transition-colors"
        >
          <Printer className="w-4 h-4" />
          <span>Print Pass</span>
        </button>

        <button
          onClick={() => {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reservation, null, 2));
            const dlAnchor = document.createElement("a");
            dlAnchor.setAttribute("href", dataStr);
            dlAnchor.setAttribute("download", `PASS-${reservation.reservationCode}.json`);
            dlAnchor.click();
          }}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white hover:bg-primary/90 font-medium text-xs transition-colors shadow-sm"
        >
          <Download className="w-4 h-4" />
          <span>Save Digital Pass</span>
        </button>
      </div>
    </div>
  );
}
