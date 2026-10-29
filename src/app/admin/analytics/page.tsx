"use client";

import React from "react";
import Link from "next/link";
import { storage } from "@/lib/storage";
import { RoleGuard } from "@/components/role-guard";
import { OccupancyCharts } from "@/components/analytics/occupancy-chart";
import { ArrowLeft, BarChart3, TrendingUp, Calendar, Download } from "lucide-react";

export default function AdminAnalyticsPage() {
  const summaries = storage.getOccupancySummaries();

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
            <h1 className="text-2xl font-bold tracking-tight">Campus Mobility Analytics & Telemetry</h1>
            <p className="text-xs text-muted-foreground">
              In-depth utilization statistics, peak hour distributions, and modal share insights
            </p>
          </div>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border bg-card hover:bg-muted text-xs font-semibold transition-colors"
          >
            <Download className="w-4 h-4 text-muted-foreground" />
            <span>Export Analytics PDF</span>
          </button>
        </div>

        {/* Charts Container */}
        <OccupancyCharts summaries={summaries} />
      </div>
    </RoleGuard>
  );
}
