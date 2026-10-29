"use client";

import React from "react";
import { ParkingSpace, SpaceCategory } from "@/lib/types";
import { Car, Bike, Zap, Accessibility, Star, Wrench, CheckCircle } from "lucide-react";

interface BayGridProps {
  spaces: ParkingSpace[];
  occupiedSpaceIds?: string[];
  reservedSpaceIds?: string[];
  selectedSpaceId?: string;
  onSelectSpace?: (space: ParkingSpace) => void;
  readOnly?: boolean;
}

export function BayGrid({
  spaces,
  occupiedSpaceIds = [],
  reservedSpaceIds = [],
  selectedSpaceId,
  onSelectSpace,
  readOnly = false,
}: BayGridProps) {
  const getSpaceIcon = (type: SpaceCategory) => {
    switch (type) {
      case "two_wheeler":
        return <Bike className="w-4 h-4" />;
      case "electric_vehicle":
        return <Zap className="w-4 h-4 text-sky-500" />;
      case "accessible":
        return <Accessibility className="w-4 h-4 text-purple-500" />;
      case "faculty_reserved":
      case "staff_reserved":
        return <Star className="w-4 h-4 text-amber-500" />;
      default:
        return <Car className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs bg-muted/40 p-3 rounded-xl border">
        <span className="font-semibold text-foreground">Bay Status:</span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-emerald-500"></span> Available
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-red-500"></span> Parked (Occupied)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-amber-500"></span> Reserved
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-slate-400"></span> Maintenance
        </span>
      </div>

      {/* Grid of bays */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {spaces.map((space) => {
          const isOccupied = occupiedSpaceIds.includes(space.id);
          const isReserved = reservedSpaceIds.includes(space.id);
          const isMaintenance = space.isOutOfService || !space.isActive;
          const isSelected = selectedSpaceId === space.id;

          let statusClass = "bg-emerald-50 border-emerald-300 text-emerald-950 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-200 hover:border-emerald-500";
          let badgeLabel = "Available";

          if (isMaintenance) {
            statusClass = "bg-slate-100 border-slate-300 text-slate-500 dark:bg-slate-900 dark:border-slate-800 opacity-60 cursor-not-allowed";
            badgeLabel = "Maintenance";
          } else if (isOccupied) {
            statusClass = "bg-red-50 border-red-300 text-red-950 dark:bg-red-950/30 dark:border-red-800 dark:text-red-200 cursor-not-allowed";
            badgeLabel = "Parked";
          } else if (isReserved) {
            statusClass = "bg-amber-50 border-amber-300 text-amber-950 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-200 cursor-not-allowed";
            badgeLabel = "Reserved";
          }

          if (isSelected) {
            statusClass = "bg-primary text-white border-primary ring-2 ring-primary/40 shadow-md";
          }

          const canClick = !readOnly && !isMaintenance && !isOccupied && !isReserved;

          return (
            <button
              key={space.id}
              disabled={!canClick && !readOnly}
              onClick={() => canClick && onSelectSpace && onSelectSpace(space)}
              className={`flex flex-col justify-between p-3.5 rounded-xl border-2 text-left transition-all ${statusClass} ${
                canClick ? "cursor-pointer hover:scale-[1.02]" : ""
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <span className="font-mono font-bold text-sm tracking-wide">
                  {space.spaceNumber}
                </span>
                <div className="flex items-center gap-1">
                  {isMaintenance ? <Wrench className="w-3.5 h-3.5 text-slate-400" /> : getSpaceIcon(space.spaceType)}
                  {isSelected && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] font-medium opacity-90">
                <span className="capitalize">{space.spaceType.replace("_", " ")}</span>
                <span className="text-[10px] uppercase font-bold tracking-wider">{badgeLabel}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
