"use client";

import React from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { ZoneOccupancySummary } from "@/lib/types";

interface AnalyticsChartsProps {
  summaries: ZoneOccupancySummary[];
}

export function OccupancyCharts({ summaries }: AnalyticsChartsProps) {
  // Simulated campus hourly load based on real academic timetable
  const hourlyData = [
    { time: "06:00", vehicles: 12, capacity: 245 },
    { time: "07:30", vehicles: 45, capacity: 245 },
    { time: "09:00", vehicles: 198, capacity: 245 }, // Peak morning lectures
    { time: "11:00", vehicles: 228, capacity: 245 }, // Peak campus occupancy
    { time: "13:00", vehicles: 185, capacity: 245 }, // Lunch mobility
    { time: "15:00", vehicles: 215, capacity: 245 }, // Afternoon labs
    { time: "17:30", vehicles: 140, capacity: 245 }, // Evening departure
    { time: "19:30", vehicles: 70, capacity: 245 }, // Library & hostelers
    { time: "22:00", vehicles: 25, capacity: 245 },
  ];

  // Zone by zone utilization data
  const zoneComparisonData = summaries.map((s) => ({
    name: s.zoneCode,
    parked: s.activeSessions,
    reserved: s.activeReservations,
    available: s.availableNow,
    usable: s.usableCapacity,
  }));

  // Vehicle type distribution
  const vehicleSplitData = [
    { name: "4-Wheelers (Car/SUV)", value: 58, color: "#2563eb" },
    { name: "2-Wheelers (Bike/Scooter)", value: 32, color: "#10b981" },
    { name: "Electric Vehicles (EV)", value: 8, color: "#0284c7" },
    { name: "Accessible / Spec. Needs", value: 2, color: "#7c3aed" },
  ];

  return (
    <div className="space-y-6">
      {/* Hourly Occupancy Area Chart */}
      <div className="bg-card border rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-sm">Hourly Campus Occupancy Curve</h4>
            <p className="text-xs text-muted-foreground">
              Peak congestion occurs during 09:30 - 11:30 AM IST (Morning Lecture Window)
            </p>
          </div>
          <span className="text-xs font-mono bg-primary/10 text-primary px-2.5 py-1 rounded-full font-bold">
            Max Cap: 245 Bays
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorVehicles" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
              <XAxis dataKey="time" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#1e293b",
                  borderRadius: "0.75rem",
                  color: "#fff",
                  fontSize: "12px",
                }}
              />
              <Area
                type="monotone"
                dataKey="vehicles"
                stroke="#2563eb"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorVehicles)"
                name="Parked Vehicles"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid of Zone Breakdown & Pie Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Zone Utilization Comparison */}
        <div className="bg-card border rounded-2xl p-5 shadow-sm space-y-3">
          <h4 className="font-bold text-sm">Zone-by-Zone Capacity Allocation</h4>
          <p className="text-xs text-muted-foreground">
            Current live split of physically parked, reserved, and available bays
          </p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={zoneComparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#1e293b",
                    borderRadius: "0.75rem",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                <Bar dataKey="parked" name="Parked" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="reserved" name="Reserved" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="available" name="Available" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fleet Distribution */}
        <div className="bg-card border rounded-2xl p-5 shadow-sm space-y-3">
          <h4 className="font-bold text-sm">Campus Vehicle Modal Split</h4>
          <p className="text-xs text-muted-foreground">
            Proportion of vehicle types entering campus gates
          </p>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={vehicleSplitData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {vehicleSplitData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: number) => [`${val}%`, "Share"]}
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#1e293b",
                    borderRadius: "0.75rem",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
