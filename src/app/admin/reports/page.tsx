"use client";

import React, { useState } from "react";
import Link from "next/link";
import { storage } from "@/lib/storage";
import { RoleGuard } from "@/components/role-guard";
import { formatISTDateTime, formatIndianPlate } from "@/lib/utils";
import { 
  ArrowLeft, 
  FileText, 
  Download, 
  Calendar, 
  Car, 
  CheckCircle2, 
  AlertTriangle 
} from "lucide-react";

export default function AdminReportsPage() {
  const [reportType, setReportType] = useState<string>("daily_mobility");
  const sessions = storage.getSessions();
  const reservations = storage.getReservations();
  const gateEvents = storage.getGateEvents();

  const handleDownloadCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";

    if (reportType === "daily_mobility") {
      csvContent += "Session ID,Vehicle Plate,Zone,Entry Gate,Entry Time (IST),Exit Time (IST),Status\n";
      sessions.forEach((s) => {
        csvContent += `"${s.id}","${s.vehicle?.registrationNumber || ''}","${s.zone?.name || ''}","${s.entryGate}","${formatISTDateTime(s.entryTime)}","${s.exitTime ? formatISTDateTime(s.exitTime) : 'Active'}","${s.status}"\n`;
      });
    } else {
      csvContent += "Event ID,Gate Station,Vehicle Plate,Event Type,Validation,Timestamp (IST)\n";
      gateEvents.forEach((e) => {
        csvContent += `"${e.id}","${e.gateIdentifier}","${e.vehicleRegistration}","${e.eventType}","${e.validationResult}","${formatISTDateTime(e.eventTime)}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `CAMPUS_${reportType.toUpperCase()}_REPORT.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
            <h1 className="text-2xl font-bold tracking-tight">Mobility Reports & Compliance Ledger</h1>
            <p className="text-xs text-muted-foreground">
              Generate certified compliance spreadsheets, overstay audits, and campus parking usage summaries
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="px-3 py-2 rounded-xl border bg-background text-xs font-semibold focus:ring-2 focus:ring-primary focus:outline-none"
            >
              <option value="daily_mobility">Daily Campus Mobility & Sessions</option>
              <option value="gate_security">Security Gate Events & ANPR Scans</option>
            </select>

            <button
              onClick={handleDownloadCSV}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white font-semibold text-xs hover:bg-primary/90 transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Report Preview */}
        <div className="bg-card border rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              <span>
                {reportType === "daily_mobility"
                  ? "Daily Campus Mobility Sessions (CSV Preview)"
                  : "Gate Events & ANPR Scans (CSV Preview)"}
              </span>
            </h3>
            <span className="text-[11px] text-muted-foreground font-mono">
              Timezone: Asia/Kolkata (IST)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b bg-muted/40 text-muted-foreground font-semibold">
                  {reportType === "daily_mobility" ? (
                    <>
                      <th className="py-3 px-4">Vehicle Plate</th>
                      <th className="py-3 px-4">Zone</th>
                      <th className="py-3 px-4">Entry Gate</th>
                      <th className="py-3 px-4">Inbound (IST)</th>
                      <th className="py-3 px-4">Outbound (IST)</th>
                      <th className="py-3 px-4">Status</th>
                    </>
                  ) : (
                    <>
                      <th className="py-3 px-4">Gate Station</th>
                      <th className="py-3 px-4">Vehicle Plate</th>
                      <th className="py-3 px-4">Event Type</th>
                      <th className="py-3 px-4">Validation Outcome</th>
                      <th className="py-3 px-4">Timestamp (IST)</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y text-foreground">
                {reportType === "daily_mobility"
                  ? sessions.map((s) => (
                      <tr key={s.id} className="hover:bg-muted/30">
                        <td className="py-3 px-4 font-mono font-bold">
                          {formatIndianPlate(s.vehicle?.registrationNumber || "")}
                        </td>
                        <td className="py-3 px-4">{s.zone?.name}</td>
                        <td className="py-3 px-4">{s.entryGate}</td>
                        <td className="py-3 px-4 font-mono text-muted-foreground">
                          {formatISTDateTime(s.entryTime)}
                        </td>
                        <td className="py-3 px-4 font-mono text-muted-foreground">
                          {s.exitTime ? formatISTDateTime(s.exitTime) : "Currently Parked"}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-muted">
                            {s.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  : gateEvents.map((e) => (
                      <tr key={e.id} className="hover:bg-muted/30">
                        <td className="py-3 px-4 font-semibold">{e.gateIdentifier}</td>
                        <td className="py-3 px-4 font-mono font-bold">
                          {formatIndianPlate(e.vehicleRegistration)}
                        </td>
                        <td className="py-3 px-4 capitalize">{e.eventType.replace("_", " ")}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              e.validationResult === "success"
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                                : "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300"
                            }`}
                          >
                            {e.validationResult}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-muted-foreground">
                          {formatISTDateTime(e.eventTime)}
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
