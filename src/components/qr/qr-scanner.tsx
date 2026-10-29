"use client";

import React, { useState, useEffect } from "react";
import { storage } from "@/lib/storage";
import { Reservation, ParkingSession } from "@/lib/types";
import { formatISTDateTime, formatIndianPlate } from "@/lib/utils";
import { 
  Camera, 
  Search, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  Car, 
  Clock, 
  MapPin, 
  User, 
  ArrowRight,
  LogOut,
  Sparkles
} from "lucide-react";

interface QRScannerProps {
  gateIdentifier: string;
  guardId: string;
  onScanComplete?: (result: { success: boolean; session?: ParkingSession; error?: string }) => void;
}

export function QRScanner({ gateIdentifier, guardId, onScanComplete }: QRScannerProps) {
  const [manualCode, setManualCode] = useState("");
  const [activeReservation, setActiveReservation] = useState<Reservation | null>(null);
  const [scanResult, setScanResult] = useState<{
    status: "idle" | "valid" | "invalid" | "checked_in" | "checked_out";
    message: string;
  }>({ status: "idle", message: "" });
  const [isProcessing, setIsProcessing] = useState(false);

  // Available sample passes to simulate real camera scans during testing
  const reservations = storage.getReservations();
  const confirmedReservations = reservations.filter((r) => r.status === "confirmed" || r.status === "checked_in");

  const handleVerifyCode = (code: string) => {
    const cleanedCode = code.trim().toUpperCase();
    const res = storage.getReservation(cleanedCode);

    if (!res) {
      setScanResult({
        status: "invalid",
        message: `Pass code "${cleanedCode}" not found in campus database.`,
      });
      setActiveReservation(null);
      return;
    }

    setActiveReservation(res);
    if (res.status === "confirmed") {
      setScanResult({
        status: "valid",
        message: "Valid Confirmed Reservation. Cleared for entry check-in.",
      });
    } else if (res.status === "checked_in") {
      setScanResult({
        status: "valid",
        message: "Vehicle currently inside. Cleared for gate exit check-out.",
      });
    } else {
      setScanResult({
        status: "invalid",
        message: `Pass cannot be processed: status is "${res.status}".`,
      });
    }
  };

  const handleExecuteEntry = () => {
    if (!activeReservation) return;
    setIsProcessing(true);

    const result = storage.processGateEntry({
      reservationCode: activeReservation.reservationCode,
      guardId,
      gateIdentifier,
      registrationNumber: activeReservation.vehicle?.registrationNumber,
    });

    if (result.success) {
      setScanResult({
        status: "checked_in",
        message: `Vehicle ${formatIndianPlate(activeReservation.vehicle?.registrationNumber || "")} successfully checked in at ${gateIdentifier}. Barrier opened.`,
      });
      if (onScanComplete) onScanComplete(result);
    } else {
      setScanResult({
        status: "invalid",
        message: result.error || "Gate entry validation failed.",
      });
    }
    setIsProcessing(false);
  };

  const handleExecuteExit = () => {
    if (!activeReservation) return;
    setIsProcessing(true);

    const result = storage.processGateExit({
      reservationCode: activeReservation.reservationCode,
      guardId,
      gateIdentifier,
      registrationNumber: activeReservation.vehicle?.registrationNumber,
    });

    if (result.success) {
      setScanResult({
        status: "checked_out",
        message: `Vehicle ${formatIndianPlate(activeReservation.vehicle?.registrationNumber || "")} successfully checked out. Duration: ${result.durationMinutes} mins. Barrier opened.`,
      });
      if (onScanComplete) onScanComplete(result);
    } else {
      setScanResult({
        status: "invalid",
        message: result.error || "Gate exit validation failed.",
      });
    }
    setIsProcessing(false);
  };

  return (
    <div className="space-y-6">
      {/* Scanner Viewfinder Simulation Box */}
      <div className="relative bg-slate-950 rounded-2xl p-6 text-white overflow-hidden shadow-xl border border-slate-800">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-mono text-xs font-semibold text-slate-300">
              GATE ANPR / OPTICAL SCANNER ACTIVE
            </span>
          </div>
          <span className="text-xs font-semibold bg-primary/20 text-primary-foreground px-2.5 py-0.5 rounded-full border border-primary/30">
            {gateIdentifier}
          </span>
        </div>

        {/* Viewfinder Frame */}
        <div className="relative aspect-video max-h-56 mx-auto rounded-xl border-2 border-dashed border-primary/40 bg-slate-900/60 flex flex-col items-center justify-center p-4">
          <Camera className="w-12 h-12 text-primary/60 mb-2 animate-bounce" />
          <p className="text-xs text-slate-400 text-center max-w-xs">
            Align digital campus pass QR code within the frame or select quick pass below
          </p>
          <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-primary"></div>
          <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-primary"></div>
          <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-primary"></div>
          <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-primary"></div>
        </div>

        {/* Quick Demo Simulator Passes */}
        <div className="mt-4 pt-4 border-t border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 block mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Quick Simulate Camera Scan (Test Passes):
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            {confirmedReservations.slice(0, 4).map((r) => (
              <button
                key={r.id}
                onClick={() => {
                  setManualCode(r.reservationCode);
                  handleVerifyCode(r.reservationCode);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono border border-slate-700 transition-colors flex items-center gap-1.5"
              >
                <span>{r.reservationCode}</span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-sans uppercase font-bold ${
                  r.status === "confirmed" ? "bg-emerald-950 text-emerald-300" : "bg-sky-950 text-sky-300"
                }`}>
                  {r.status === "confirmed" ? "Entry" : "Exit"}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Manual Code Input Form */}
      <div className="bg-card border rounded-2xl p-5 shadow-sm space-y-4">
        <h4 className="text-sm font-bold flex items-center gap-2">
          <Search className="w-4 h-4 text-primary" />
          <span>Manual Reservation Pass Lookup</span>
        </h4>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleVerifyCode(manualCode);
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            placeholder="Enter pass code (e.g. SPK-20261029-7Q2P)"
            className="flex-1 px-3.5 py-2.5 rounded-xl border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary uppercase"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-primary text-white font-medium text-sm hover:bg-primary/90 transition-colors shadow-sm"
          >
            Verify Pass
          </button>
        </form>
      </div>

      {/* Verification Result Card */}
      {scanResult.status !== "idle" && (
        <div
          className={`border rounded-2xl p-5 shadow-md space-y-4 animate-in fade-in slide-in-from-bottom-2 ${
            scanResult.status === "invalid"
              ? "bg-red-50/70 border-red-200 dark:bg-red-950/20 dark:border-red-900"
              : scanResult.status === "checked_in" || scanResult.status === "checked_out"
              ? "bg-emerald-50/80 border-emerald-300 dark:bg-emerald-950/30 dark:border-emerald-800"
              : "bg-blue-50/70 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900"
          }`}
        >
          <div className="flex items-start gap-3">
            {scanResult.status === "invalid" ? (
              <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <h4 className="font-bold text-base">
                {scanResult.status === "invalid"
                  ? "Access Denied"
                  : scanResult.status === "checked_in"
                  ? "Check-In Approved & Barrier Raised"
                  : scanResult.status === "checked_out"
                  ? "Check-Out Approved & Barrier Raised"
                  : "Pass Verified & Authorized"}
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                {scanResult.message}
              </p>
            </div>
          </div>

          {/* Booking Summary details for Guard */}
          {activeReservation && (
            <div className="bg-card/90 border rounded-xl p-4 text-xs space-y-2.5 mt-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-muted-foreground block text-[10px]">Vehicle Registration</span>
                  <span className="font-mono font-bold text-sm text-foreground">
                    {formatIndianPlate(activeReservation.vehicle?.registrationNumber || "")}
                  </span>
                  <span className="text-[10px] text-muted-foreground block">
                    {activeReservation.vehicle?.makeModel} ({activeReservation.vehicle?.color})
                  </span>
                </div>

                <div>
                  <span className="text-muted-foreground block text-[10px]">Permitted Zone & Bay</span>
                  <span className="font-bold text-foreground">
                    {activeReservation.zone?.name}
                  </span>
                  <span className="text-[10px] text-primary block font-medium">
                    Bay: {activeReservation.space?.spaceNumber || "General Campus Slot"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                <div>
                  <span className="text-muted-foreground block text-[10px]">Driver Name</span>
                  <span className="font-medium text-foreground">
                    {activeReservation.user?.fullName} ({activeReservation.user?.campusId})
                  </span>
                </div>

                <div>
                  <span className="text-muted-foreground block text-[10px]">Valid Time Window</span>
                  <span className="font-medium text-foreground">
                    {formatISTDateTime(activeReservation.startTime)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Action Trigger Buttons for Guard */}
          {activeReservation && scanResult.status === "valid" && (
            <div className="pt-2 flex items-center gap-3">
              {activeReservation.status === "confirmed" ? (
                <button
                  disabled={isProcessing}
                  onClick={handleExecuteEntry}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors shadow-md text-sm"
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span>CONFIRM GATE ENTRY (OPEN BARRIER)</span>
                </button>
              ) : activeReservation.status === "checked_in" ? (
                <button
                  disabled={isProcessing}
                  onClick={handleExecuteExit}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-colors shadow-md text-sm"
                >
                  <LogOut className="w-5 h-5" />
                  <span>CONFIRM GATE EXIT (OPEN BARRIER)</span>
                </button>
              ) : null}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
