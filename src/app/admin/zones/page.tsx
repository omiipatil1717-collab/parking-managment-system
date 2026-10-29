"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { storage } from "@/lib/storage";
import { RoleGuard } from "@/components/role-guard";
import { ParkingZone, VehicleType } from "@/lib/types";
import { 
  ArrowLeft, 
  MapPin, 
  Plus, 
  Edit, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Car, 
  Zap, 
  Bike, 
  Accessibility, 
  X,
  Sliders
} from "lucide-react";

export default function AdminZonesPage() {
  const { user } = useAuth();
  const [zones, setZones] = useState<ParkingZone[]>(() => storage.getZones());
  const [showModal, setShowModal] = useState(false);
  const [editingZone, setEditingZone] = useState<ParkingZone | null>(null);

  // Form states
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [totalCapacity, setTotalCapacity] = useState(50);
  const [usableCapacity, setUsableCapacity] = useState(50);
  const [openingTime, setOpeningTime] = useState("06:00");
  const [closingTime, setClosingTime] = useState("23:00");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const refresh = () => setZones(storage.getZones());

  const handleOpenAdd = () => {
    setEditingZone(null);
    setCode("");
    setName("");
    setDescription("");
    setLocation("");
    setTotalCapacity(40);
    setUsableCapacity(40);
    setOpeningTime("06:00");
    setClosingTime("23:00");
    setError("");
    setShowModal(true);
  };

  const handleOpenEdit = (z: ParkingZone) => {
    setEditingZone(z);
    setCode(z.code);
    setName(z.name);
    setDescription(z.description);
    setLocation(z.location);
    setTotalCapacity(z.totalCapacity);
    setUsableCapacity(z.usableCapacity);
    setOpeningTime(z.openingTime);
    setClosingTime(z.closingTime);
    setError("");
    setShowModal(true);
  };

  const handleToggleActive = (zone: ParkingZone) => {
    try {
      storage.updateZone(zone.id, { isActive: !zone.isActive }, user.id);
      refresh();
      setSuccess(`Zone ${zone.code} status updated.`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      alert(err?.message || "Failed to toggle status");
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!code || !name || !location) {
      setError("Code, Name and Location are required.");
      return;
    }

    try {
      if (editingZone) {
        storage.updateZone(
          editingZone.id,
          {
            code: code.toUpperCase(),
            name,
            description,
            location,
            totalCapacity: Number(totalCapacity),
            usableCapacity: Number(usableCapacity),
            openingTime,
            closingTime,
          },
          user.id
        );
        setSuccess("Zone details updated successfully.");
      } else {
        storage.createZone(
          {
            code: code.toUpperCase(),
            name,
            description,
            location,
            latitude: 18.5204,
            longitude: 73.8567,
            totalCapacity: Number(totalCapacity),
            usableCapacity: Number(usableCapacity),
            openingTime,
            closingTime,
            timezone: "Asia/Kolkata",
            allowedVehicleTypes: ["four_wheeler", "two_wheeler", "electric_vehicle", "accessible"],
            isActive: true,
            hourlyRate: 0,
          },
          user.id
        );
        setSuccess("New parking zone created.");
      }
      setShowModal(false);
      refresh();
      setTimeout(() => setSuccess(""), 4000);
    } catch (err: any) {
      setError(err?.message || "Failed to save zone.");
    }
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
            <h1 className="text-2xl font-bold tracking-tight">Campus Parking Zones</h1>
            <p className="text-xs text-muted-foreground">
              Configure zone capacities, operating hours, vehicle restrictions, and operational status
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white font-semibold text-xs hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Zone</span>
          </button>
        </div>

        {success && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{success}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {zones.map((zone) => (
            <div
              key={zone.id}
              className={`bg-card border rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between transition-colors ${
                !zone.isActive ? "opacity-60 bg-muted/20" : ""
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs bg-primary/10 text-primary px-2.5 py-0.5 rounded">
                    {zone.code}
                  </span>

                  <button
                    onClick={() => handleToggleActive(zone)}
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider transition-colors ${
                      zone.isActive
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                        : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    {zone.isActive ? "Active Zone" : "Deactivated"}
                  </button>
                </div>

                <div>
                  <h3 className="font-bold text-base text-foreground">{zone.name}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                    {zone.description}
                  </p>
                  <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-2">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    <span>{zone.location}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-muted/30 p-3 rounded-xl">
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Capacity</span>
                    <span className="font-bold">{zone.usableCapacity} <span className="text-muted-foreground font-normal">/ {zone.totalCapacity} usable</span></span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Hours</span>
                    <span className="font-bold">{zone.openingTime} - {zone.closingTime}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t flex items-center justify-between text-xs">
                <button
                  onClick={() => handleOpenEdit(zone)}
                  className="flex items-center gap-1 text-primary hover:underline font-semibold"
                >
                  <Edit className="w-3.5 h-3.5" /> Edit Zone
                </button>

                <Link
                  href={`/admin/spaces?zone=${zone.id}`}
                  className="text-muted-foreground hover:text-foreground font-medium"
                >
                  Manage Bays →
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Dialog for Add / Edit Zone */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card border rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 animate-in zoom-in-95">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-bold text-base">
                  {editingZone ? `Edit Zone (${editingZone.code})` : "Create Campus Parking Zone"}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 rounded-lg hover:bg-muted text-muted-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium">
                  {error}
                </div>
              )}

              <form onSubmit={handleSave} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">Zone Identifier Code *</label>
                    <input
                      type="text"
                      required
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="e.g. ZONE-F"
                      className="w-full px-3 py-2 rounded-xl border bg-background font-mono text-xs uppercase focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">Zone Name *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Bio-Tech Plaza"
                      className="w-full px-3 py-2 rounded-xl border bg-background text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Campus Sector / Location *</label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. South Sector 4, Opposite Cafeteria"
                    className="w-full px-3 py-2 rounded-xl border bg-background text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Description</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Short description of accessibility and adjacent departments..."
                    className="w-full px-3 py-2 rounded-xl border bg-background text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">Total Capacity</label>
                    <input
                      type="number"
                      min={1}
                      value={totalCapacity}
                      onChange={(e) => setTotalCapacity(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border bg-background text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">Usable Capacity</label>
                    <input
                      type="number"
                      min={1}
                      value={usableCapacity}
                      onChange={(e) => setUsableCapacity(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border bg-background text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">Opening Time (IST)</label>
                    <input
                      type="time"
                      value={openingTime}
                      onChange={(e) => setOpeningTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border bg-background text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">Closing Time (IST)</label>
                    <input
                      type="time"
                      value={closingTime}
                      onChange={(e) => setClosingTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border bg-background text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-xl border bg-muted/40 hover:bg-muted font-medium text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-primary text-white font-semibold text-xs hover:bg-primary/90 transition-colors shadow-sm"
                  >
                    Save Zone
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
