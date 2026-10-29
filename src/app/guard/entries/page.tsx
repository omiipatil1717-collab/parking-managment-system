"use client";

import React, { useState } from "react";
import Link from "next/link";
import { storage } from "@/lib/storage";
import { RoleGuard } from "@/components/role-guard";
import { formatISTDateTime, formatIndianPlate } from "@/lib/utils";
import { ArrowLeft, Car, ShieldCheck, CheckCircle2, Search, Filter } from "lucide-react";

export default function GuardEntriesPage() {
  const [search, setSearch] = useState("");
  const allEvents = storage.getGateEvents(100);
  const entryEvents = allEvents.filter((e) => e.eventType === "entry_scan" || e.eventType === "manual_entry");

  const filtered = entryEvents.filter((e) => {
    return e.vehicleRegistration.toLowerCase().includes(search.toLowerCase()) ||
           e.gateIdentifier.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <RoleGuard allowedRoles={["security_guard", "parking_manager", "super_admin"]}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b">
          <div className="space-y-1">
            <Link
              href="/guard"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Guard Console
            </Link>
            <h1 className="text-2xl font-bold tracking-tight">Gate Inbound Entries Log</h1>
            <p className="text-xs text-muted-foreground">
              Official campus security ledger of all authorized inbound vehicles
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search plate or gate..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border bg-background text-xs focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
        </div>

        <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b bg-muted/40 text-muted-foreground font-semibold">
                  <th className="py-3 px-4">Vehicle Plate</th>
                  <th className="py-3 px-4">Gate Station</th>
                  <th className="py-3 px-4">Reservation Ref</th>
                  <th className="py-3 px-4">Validation</th>
                  <th className="py-3 px-4">Timestamp (IST)</th>
                </tr>
              </thead>
              <tbody className="divide-y text-foreground">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      No inbound gate entry events found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((evt) => (
                    <tr key={evt.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold flex items-center gap-2">
                        <Car className="w-4 h-4 text-emerald-600" />
                        <span>{formatIndianPlate(evt.vehicleRegistration)}</span>
                      </td>
                      <td className="py-3 px-4 font-medium">{evt.gateIdentifier}</td>
                      <td className="py-3 px-4 font-mono text-muted-foreground">
                        {evt.reservationId ? `PASS-${evt.reservationId.substring(0, 8)}` : "Direct Gate Pass"}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                          <CheckCircle2 className="w-3 h-3" /> Cleared Entry
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-muted-foreground">
                        {formatISTDateTime(evt.eventTime)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
