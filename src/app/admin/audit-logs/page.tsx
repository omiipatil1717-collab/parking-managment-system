"use client";

import React, { useState } from "react";
import Link from "next/link";
import { storage } from "@/lib/storage";
import { RoleGuard } from "@/components/role-guard";
import { formatISTDateTime } from "@/lib/utils";
import { ArrowLeft, ShieldAlert, Search, Filter } from "lucide-react";

export default function AdminAuditLogsPage() {
  const [search, setSearch] = useState("");
  const logs = storage.getAuditLogs(100);

  const filtered = logs.filter((l) => {
    const q = search.toLowerCase();
    return l.action.toLowerCase().includes(q) ||
           (l.actorName && l.actorName.toLowerCase().includes(q)) ||
           l.entityType.toLowerCase().includes(q);
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
            <h1 className="text-2xl font-bold tracking-tight">Security & System Audit Logs</h1>
            <p className="text-xs text-muted-foreground">
              Immutable ledger of administrative actions, capacity overrides, security scans, and configuration edits
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by action or actor..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border bg-background text-xs focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
        </div>

        <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b bg-muted/40 text-muted-foreground font-semibold">
                  <th className="py-3 px-4">Action Type</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Entity Type</th>
                  <th className="py-3 px-4">Entity ID</th>
                  <th className="py-3 px-4">Structured Audit Details</th>
                  <th className="py-3 px-4">Timestamp (IST)</th>
                </tr>
              </thead>
              <tbody className="divide-y text-foreground">
                {filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-[10px] px-2 py-0.5 rounded bg-primary/10 text-primary">
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-semibold">
                      {log.actorName || log.actorId}
                    </td>

                    <td className="py-3 px-4 capitalize text-muted-foreground">
                      {log.entityType}
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] text-muted-foreground">
                      {log.entityId}
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] text-muted-foreground max-w-xs truncate">
                      {JSON.stringify(log.details)}
                    </td>

                    <td className="py-3 px-4 font-mono text-muted-foreground whitespace-nowrap">
                      {formatISTDateTime(log.createdAt)}
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
