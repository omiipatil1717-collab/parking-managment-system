"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { storage } from "@/lib/storage";
import { RoleGuard } from "@/components/role-guard";
import { QRScanner } from "@/components/qr/qr-scanner";
import { 
  ArrowLeft, 
  ShieldCheck, 
  Radio, 
  MapPin, 
  Clock, 
  Car, 
  CheckCircle2, 
  LogOut 
} from "lucide-react";

export default function GuardScanPage() {
  const { user } = useAuth();
  const [selectedGate, setSelectedGate] = useState("North Gate 1");
  const [lastActionResult, setLastActionResult] = useState<string>("");

  return (
    <RoleGuard allowedRoles={["security_guard", "parking_manager", "super_admin"]}>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b">
          <div className="space-y-1">
            <Link
              href="/guard"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Guard Console
            </Link>
            <h1 className="text-2xl font-bold tracking-tight">Optical QR & ANPR Scanner</h1>
            <p className="text-xs text-muted-foreground">
              Scan inbound reservation passes or verify departing vehicles
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase block">
                Active Gate Barrier
              </label>
              <select
                value={selectedGate}
                onChange={(e) => setSelectedGate(e.target.value)}
                className="px-3 py-1.5 rounded-xl border bg-background text-xs font-semibold text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
              >
                <option value="North Gate 1">North Gate 1 (Computer Science / Labs)</option>
                <option value="East Gate 2">East Gate 2 (Tech Park & Research)</option>
                <option value="Central Gate 3">Central Gate 3 (Main Library Plaza)</option>
                <option value="South Gate 4">South Gate 4 (Sports Arena)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Scanner Component */}
        <QRScanner
          gateIdentifier={selectedGate}
          guardId={user.id}
          onScanComplete={(res) => {
            if (res.success) {
              setLastActionResult("Barrier operation completed successfully. Occupancy telemetry synchronized.");
              setTimeout(() => setLastActionResult(""), 5000);
            }
          }}
        />

        {lastActionResult && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{lastActionResult}</span>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
