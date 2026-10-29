"use client";

import React, { useState } from "react";
import { ParkingZone, ZoneOccupancySummary } from "@/lib/types";
import { storage } from "@/lib/storage";
import { Car, Zap, Accessibility, Bike, ShieldCheck, ArrowRight, MapPin, RefreshCw } from "lucide-react";
import Link from "next/link";

interface CampusMapProps {
  onSelectZone?: (zoneId: string) => void;
  selectedZoneId?: string;
}

export function CampusParkingMap({ onSelectZone, selectedZoneId }: CampusMapProps) {
  const [summaries, setSummaries] = useState<ZoneOccupancySummary[]>(() => storage.getOccupancySummaries());
  const [hoveredZoneId, setHoveredZoneId] = useState<string | null>(null);

  const refresh = () => {
    setSummaries(storage.getOccupancySummaries());
  };

  const activeZoneSummary = summaries.find((s) => s.zoneId === (hoveredZoneId || selectedZoneId || "zone-a"));

  // Layout coordinates for SVG blocks representing campus parking zones
  const zoneCoords: Record<string, { x: number; y: number; width: number; height: number; color: string; label: string }> = {
    "zone-a": { x: 80, y: 50, width: 220, height: 130, color: "#16a34a", label: "Zone A: North Quad (4W/EV)" },
    "zone-b": { x: 380, y: 70, width: 200, height: 120, color: "#0284c7", label: "Zone B: Tech Park & EV" },
    "zone-c": { x: 230, y: 220, width: 220, height: 140, color: "#7c3aed", label: "Zone C: Library Plaza (2W/4W)" },
    "zone-d": { x: 70, y: 370, width: 200, height: 110, color: "#e11d48", label: "Zone D: Faculty Enclave" },
    "zone-e": { x: 360, y: 380, width: 240, height: 120, color: "#ea580c", label: "Zone E: Sports Arena (2W)" },
  };

  return (
    <div className="bg-card border rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            <span>Interactive Campus Mobility & Parking Map</span>
          </h3>
          <p className="text-xs text-muted-foreground">
            Real-time verified occupancy based on active gate check-ins and sensor feeds
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Available</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Fast Filling</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Full</span>
          </div>

          <button
            onClick={refresh}
            className="p-1.5 rounded-lg border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Refresh map telemetry"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SVG Campus Map Canvas */}
        <div className="lg:col-span-2 relative bg-slate-900/5 dark:bg-slate-950/60 rounded-xl p-3 border border-border/60 overflow-hidden">
          <svg
            viewBox="0 0 680 530"
            className="w-full h-auto max-h-[460px] select-none"
          >
            {/* Campus Background Grass/Grounds */}
            <rect x="10" y="10" width="660" height="510" rx="16" fill="#f1f5f9" className="dark:fill-slate-900" />
            
            {/* Campus Internal Avenues & Pathways */}
            {/* North-South central avenue */}
            <path d="M 330 20 L 330 500" stroke="#cbd5e1" className="dark:stroke-slate-800" strokeWidth="28" strokeLinecap="round" />
            <path d="M 330 20 L 330 500" stroke="#f8fafc" className="dark:stroke-slate-900" strokeWidth="2" strokeDasharray="10 10" />

            {/* East-West spine */}
            <path d="M 20 200 L 660 200" stroke="#cbd5e1" className="dark:stroke-slate-800" strokeWidth="26" strokeLinecap="round" />
            <path d="M 20 200 L 660 200" stroke="#f8fafc" className="dark:stroke-slate-900" strokeWidth="2" strokeDasharray="10 10" />

            {/* Campus Center Landmark: Academic Admin Rotunda */}
            <circle cx="330" cy="200" r="30" fill="#3b82f6" fillOpacity="0.15" stroke="#3b82f6" strokeWidth="2" />
            <text x="330" y="204" textAnchor="middle" fill="#2563eb" className="dark:fill-blue-400 font-bold text-[11px]">
              CAMPUS CENTER
            </text>

            {/* Gates */}
            <g>
              <rect x="290" y="12" width="80" height="18" rx="4" fill="#0f172a" />
              <text x="330" y="25" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">NORTH GATE 1</text>

              <rect x="635" y="175" width="35" height="50" rx="4" fill="#0f172a" />
              <text x="652" y="204" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">EAST G2</text>

              <rect x="290" y="495" width="80" height="18" rx="4" fill="#0f172a" />
              <text x="330" y="508" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">SOUTH GATE 4</text>

              <rect x="12" y="175" width="35" height="50" rx="4" fill="#0f172a" />
              <text x="29" y="204" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">WEST G3</text>
            </g>

            {/* Parking Zones Interactive Blocks */}
            {summaries.map((summary) => {
              const coords = zoneCoords[summary.zoneId] || { x: 100, y: 100, width: 160, height: 100, color: "#16a34a", label: summary.zoneName };
              const isSelected = (selectedZoneId || "zone-a") === summary.zoneId;
              const isHovered = hoveredZoneId === summary.zoneId;
              
              // Color indicator based on occupancy
              let statusFill = "#10b981"; // emerald
              let badgeText = "FREE";
              if (summary.occupancyPercent >= 95) {
                statusFill = "#ef4444"; // red
                badgeText = "FULL";
              } else if (summary.occupancyPercent >= 75) {
                statusFill = "#f59e0b"; // amber
                badgeText = "BUSY";
              }

              return (
                <g
                  key={summary.zoneId}
                  className="cursor-pointer transition-transform duration-200"
                  onMouseEnter={() => setHoveredZoneId(summary.zoneId)}
                  onMouseLeave={() => setHoveredZoneId(null)}
                  onClick={() => onSelectZone && onSelectZone(summary.zoneId)}
                >
                  {/* Zone base rect */}
                  <rect
                    x={coords.x}
                    y={coords.y}
                    width={coords.width}
                    height={coords.height}
                    rx="12"
                    fill="currentColor"
                    className={`${
                      isSelected
                        ? "text-white dark:text-slate-800 filter drop-shadow-lg"
                        : isHovered
                        ? "text-white/90 dark:text-slate-850"
                        : "text-white/80 dark:text-slate-800/90"
                    } transition-colors`}
                    stroke={isSelected ? "#2563eb" : statusFill}
                    strokeWidth={isSelected ? "3" : "2"}
                  />

                  {/* Header Tag with Status Pill */}
                  <rect
                    x={coords.x + 10}
                    y={coords.y + 10}
                    width={coords.width - 20}
                    height="24"
                    rx="6"
                    fill={isSelected ? "#2563eb" : "#1e293b"}
                  />
                  <text
                    x={coords.x + 18}
                    y={coords.y + 26}
                    fill="#ffffff"
                    fontSize="11"
                    fontWeight="bold"
                  >
                    {summary.zoneCode}
                  </text>

                  {/* Availability pill */}
                  <rect
                    x={coords.x + coords.width - 65}
                    y={coords.y + 13}
                    width="48"
                    height="18"
                    rx="9"
                    fill={statusFill}
                  />
                  <text
                    x={coords.x + coords.width - 41}
                    y={coords.y + 25}
                    fill="#ffffff"
                    fontSize="9"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {badgeText}
                  </text>

                  {/* Zone Name */}
                  <text
                    x={coords.x + 12}
                    y={coords.y + 55}
                    fill="#0f172a"
                    className="dark:fill-slate-100 font-semibold"
                    fontSize="12"
                  >
                    {summary.zoneName.length > 20 ? summary.zoneName.substring(0, 19) + "…" : summary.zoneName}
                  </text>

                  {/* Occupancy Progress Bar */}
                  <rect
                    x={coords.x + 12}
                    y={coords.y + 70}
                    width={coords.width - 24}
                    height="8"
                    rx="4"
                    fill="#e2e8f0"
                    className="dark:fill-slate-700"
                  />
                  <rect
                    x={coords.x + 12}
                    y={coords.y + 70}
                    width={Math.max(6, ((coords.width - 24) * summary.occupancyPercent) / 100)}
                    height="8"
                    rx="4"
                    fill={statusFill}
                  />

                  {/* Live Count Labels */}
                  <text
                    x={coords.x + 12}
                    y={coords.y + 98}
                    fill="#64748b"
                    className="dark:fill-slate-400"
                    fontSize="11"
                    fontWeight="500"
                  >
                    Available: <tspan fill="#10b981" fontWeight="bold">{summary.availableNow}</tspan> / {summary.usableCapacity}
                  </text>

                  <text
                    x={coords.x + coords.width - 12}
                    y={coords.y + 98}
                    fill="#64748b"
                    className="dark:fill-slate-400"
                    fontSize="10"
                    textAnchor="end"
                  >
                    {summary.occupancyPercent}% full
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Selected Zone Deep Dive Panel */}
        <div className="flex flex-col justify-between bg-muted/30 border rounded-xl p-5">
          {activeZoneSummary ? (
            <div className="space-y-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary mb-2">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{activeZoneSummary.zoneCode} Telemetry</span>
                </div>
                <h4 className="text-lg font-bold">{activeZoneSummary.zoneName}</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  IITM Campus Central Area • Monitored 24/7 with ANPR Cameras
                </p>
              </div>

              {/* Real Metrics Grid */}
              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <div className="bg-card border rounded-lg p-3">
                  <span className="text-[11px] text-muted-foreground font-medium block">Available Now</span>
                  <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {activeZoneSummary.availableNow}
                  </span>
                  <span className="text-[10px] text-muted-foreground block">Ready for parking</span>
                </div>

                <div className="bg-card border rounded-lg p-3">
                  <span className="text-[11px] text-muted-foreground font-medium block">Parked Vehicles</span>
                  <span className="text-2xl font-bold text-foreground">
                    {activeZoneSummary.activeSessions}
                  </span>
                  <span className="text-[10px] text-muted-foreground block">Inside campus right now</span>
                </div>

                <div className="bg-card border rounded-lg p-3">
                  <span className="text-[11px] text-muted-foreground font-medium block">Reserved Passes</span>
                  <span className="text-xl font-bold text-amber-600 dark:text-amber-400">
                    {activeZoneSummary.activeReservations}
                  </span>
                  <span className="text-[10px] text-muted-foreground block">Holding slot</span>
                </div>

                <div className="bg-card border rounded-lg p-3">
                  <span className="text-[11px] text-muted-foreground font-medium block">Usable Capacity</span>
                  <span className="text-xl font-bold text-foreground">
                    {activeZoneSummary.usableCapacity} <span className="text-xs font-normal text-muted-foreground">/ {activeZoneSummary.totalCapacity}</span>
                  </span>
                  <span className="text-[10px] text-muted-foreground block">
                    {activeZoneSummary.totalCapacity - activeZoneSummary.usableCapacity > 0 ? `${activeZoneSummary.totalCapacity - activeZoneSummary.usableCapacity} bays under service` : "All bays active"}
                  </span>
                </div>
              </div>

              {/* Vehicle Allowed Types Badge row */}
              <div className="pt-2">
                <span className="text-[11px] font-semibold text-muted-foreground block mb-1.5">Permitted Vehicles:</span>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-card border font-medium">
                    <Car className="w-3.5 h-3.5 text-primary" /> 4-Wheeler
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-card border font-medium">
                    <Zap className="w-3.5 h-3.5 text-sky-500" /> EV Charger
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-card border font-medium">
                    <Accessibility className="w-3.5 h-3.5 text-purple-500" /> Divyangjan
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Select a zone on the map to inspect.</p>
          )}

          {/* Action button */}
          <div className="pt-6 border-t mt-4 space-y-2">
            <Link
              href={`/parking/${activeZoneSummary?.zoneId || "zone-a"}`}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-colors shadow-sm text-sm"
            >
              <span>Inspect Bay Grid & Book Slot</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
