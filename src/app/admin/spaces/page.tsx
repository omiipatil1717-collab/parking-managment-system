"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { storage } from "@/lib/storage";
import { RoleGuard } from "@/components/role-guard";
import { ParkingSpace, SpaceCategory } from "@/lib/types";
import { 
  ArrowLeft, 
  Layers, 
  Wrench, 
  CheckCircle2, 
  Car, 
  Bike, 
  Zap, 
  Accessibility, 
  Star,
  Search,
  Filter
} from "lucide-react";

export default function AdminSpacesPage() {
  const { user } = useAuth();
  const zones = storage.getZones();
  const [selectedZoneId, setSelectedZoneId] = useState<string>("all");
  const [spaces, setSpaces] = useState<ParkingSpace[]>(() => storage.getSpaces());
  const [search, setSearch] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  const refresh = () => setSpaces(storage.getSpaces());

  const handleToggleMaintenance = (space: ParkingSpace) => {
    try {
      storage.updateSpace(
        space.id,
        { isOutOfService: !space.isOutOfService },
        user.id
      );
      refresh();
      setActionSuccess(`Bay ${space.spaceNumber} marked as ${!space.isOutOfService ? "Out of Service (Maintenance)" : "Active Usable"}. Zone usable capacity updated.`);
      setTimeout(() => setActionSuccess(""), 4000);
    } catch (err: any) {
      alert(err?.message || "Failed to update space");
    }
  };

  const filteredSpaces = spaces.filter((s) => {
    if (selectedZoneId !== "all" && s.zoneId !== selectedZoneId) return false;
    if (search && !s.spaceNumber.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
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
            <h1 className="text-2xl font-bold tracking-tight">Parking Spaces & Individual Bays</h1>
            <p className="text-xs text-muted-foreground">
              Audit bay conditions, categorize EV / accessible bays, and cordon bays for maintenance
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={selectedZoneId}
              onChange={(e) => setSelectedZoneId(e.target.value)}
              className="px-3 py-2 rounded-xl border bg-background text-xs font-semibold focus:ring-2 focus:ring-primary focus:outline-none"
            >
              <option value="all">All Zones ({spaces.length} Bays)</option>
              {zones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.code} — {z.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {actionSuccess && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{actionSuccess}</span>
          </div>
        )}

        <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b bg-muted/40 text-muted-foreground font-semibold">
                  <th className="py-3 px-4">Bay Number</th>
                  <th className="py-3 px-4">Campus Zone</th>
                  <th className="py-3 px-4">Bay Category</th>
                  <th className="py-3 px-4">Maintenance Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y text-foreground">
                {filteredSpaces.map((space) => {
                  const zone = zones.find((z) => z.id === space.zoneId);

                  return (
                    <tr key={space.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-sm">
                        {space.spaceNumber}
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-semibold text-foreground">
                          {zone?.name || "Zone"}
                        </span>
                        <span className="text-[10px] text-muted-foreground block font-mono">
                          {zone?.code}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-muted text-[11px] font-medium capitalize">
                          {space.spaceType === "two_wheeler" && <Bike className="w-3.5 h-3.5" />}
                          {space.spaceType === "electric_vehicle" && <Zap className="w-3.5 h-3.5 text-sky-500" />}
                          {space.spaceType === "accessible" && <Accessibility className="w-3.5 h-3.5 text-purple-500" />}
                          {space.spaceType === "faculty_reserved" && <Star className="w-3.5 h-3.5 text-amber-500" />}
                          {space.spaceType === "four_wheeler" && <Car className="w-3.5 h-3.5 text-primary" />}
                          <span>{space.spaceType.replace("_", " ")}</span>
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        {space.isOutOfService ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300">
                            <Wrench className="w-3 h-3 text-slate-500" /> Out of Service (Under Maintenance)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Usable & Active
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleToggleMaintenance(space)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                            space.isOutOfService
                              ? "bg-emerald-600 text-white hover:bg-emerald-700"
                              : "border border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                          }`}
                        >
                          {space.isOutOfService ? "Mark Active" : "Cordon / Maintenance"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
