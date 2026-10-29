"use client";

import React, { useState } from "react";
import Link from "next/link";
import { storage } from "@/lib/storage";
import { CampusParkingMap } from "@/components/map/campus-parking-map";
import { 
  MapPin, 
  Car, 
  Zap, 
  Accessibility, 
  Bike, 
  ArrowRight, 
  Search, 
  CheckCircle2, 
  AlertTriangle,
  SlidersHorizontal
} from "lucide-react";

export default function ParkingPage() {
  const [selectedZone, setSelectedZone] = useState("zone-a");
  const [vehicleFilter, setVehicleFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const zones = storage.getZones();
  const summaries = storage.getOccupancySummaries();

  const filteredZones = summaries.filter((s) => {
    const matchesSearch = s.zoneName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.zoneCode.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (vehicleFilter === "two_wheeler") {
      return s.zoneId === "zone-c" || s.zoneId === "zone-e";
    }
    if (vehicleFilter === "electric_vehicle") {
      return s.zoneId === "zone-a" || s.zoneId === "zone-b";
    }
    if (vehicleFilter === "accessible") {
      return s.zoneId === "zone-a" || s.zoneId === "zone-c" || s.zoneId === "zone-d";
    }
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Campus Parking Availability</h1>
          <p className="text-xs text-muted-foreground">
            Explore parking areas, check live bay status, and reserve a space before driving to campus
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-mono bg-muted px-2.5 py-1 rounded-md">
            Asia/Kolkata (IST)
          </span>
        </div>
      </div>

      {/* Interactive SVG Campus Map */}
      <section className="space-y-3">
        <CampusParkingMap
          selectedZoneId={selectedZone}
          onSelectZone={(zoneId) => setSelectedZone(zoneId)}
        />
      </section>

      {/* Zone Directory with search & filters */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by zone code or academic sector..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border bg-background text-xs focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap text-xs">
            <span className="text-muted-foreground font-medium mr-1 flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Filter:
            </span>
            <button
              onClick={() => setVehicleFilter("all")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                vehicleFilter === "all" ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setVehicleFilter("four_wheeler")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                vehicleFilter === "four_wheeler" ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              4-Wheelers
            </button>
            <button
              onClick={() => setVehicleFilter("two_wheeler")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                vehicleFilter === "two_wheeler" ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              2-Wheelers
            </button>
            <button
              onClick={() => setVehicleFilter("electric_vehicle")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                vehicleFilter === "electric_vehicle" ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              EV Fast Chargers
            </button>
          </div>
        </div>

        {/* Zones List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredZones.map((summary) => {
            const rawZone = zones.find((z) => z.id === summary.zoneId);
            const isFull = summary.availableNow <= 0;
            const isBusy = summary.occupancyPercent >= 80;

            return (
              <div
                key={summary.zoneId}
                className="bg-card border rounded-2xl p-5 shadow-sm space-y-4 hover:border-primary/50 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">
                      {summary.zoneCode}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        isFull
                          ? "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300"
                          : isBusy
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                          : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                      }`}
                    >
                      {isFull ? "Zone Full" : isBusy ? "Filling Fast" : "Available"}
                    </span>
                  </div>

                  <h3 className="font-bold text-base">{summary.zoneName}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {rawZone?.description}
                  </p>
                </div>

                <div className="space-y-3 pt-2 border-t">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded-lg bg-muted/40">
                      <span className="text-[10px] text-muted-foreground block">Available</span>
                      <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                        {summary.availableNow}
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-muted/40">
                      <span className="text-[10px] text-muted-foreground block">Parked</span>
                      <span className="text-base font-bold text-foreground">
                        {summary.activeSessions}
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-muted/40">
                      <span className="text-[10px] text-muted-foreground block">Usable</span>
                      <span className="text-base font-bold text-foreground">
                        {summary.usableCapacity}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-primary" />
                      <span>{rawZone?.location}</span>
                    </span>
                    <span>Hours: {rawZone?.openingTime} - {rawZone?.closingTime}</span>
                  </div>

                  <Link
                    href={`/parking/${summary.zoneId}`}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-primary text-white font-medium text-xs hover:bg-primary/90 transition-colors shadow-sm"
                  >
                    <span>View Bay Grid & Reserve</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
