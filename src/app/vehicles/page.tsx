"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { storage } from "@/lib/storage";
import { Vehicle, VehicleType } from "@/lib/types";
import { formatIndianPlate, isValidIndianPlate } from "@/lib/utils";
import { 
  Car, 
  Bike, 
  Zap, 
  Accessibility, 
  Plus, 
  Trash2, 
  Edit2, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  X
} from "lucide-react";

export default function VehiclesPage() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => storage.getVehicles(user?.id));
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  // Form states
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [vehicleType, setVehicleType] = useState<VehicleType>("four_wheeler");
  const [makeModel, setMakeModel] = useState("");
  const [color, setColor] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const refresh = React.useCallback(() => {
    if (user?.id) {
      setVehicles(storage.getVehicles(user.id));
    }
  }, [user?.id]);

  useEffect(() => {
    refresh();
    const handleDataChanged = () => refresh();
    window.addEventListener("smartpark-data-changed", handleDataChanged);
    return () => window.removeEventListener("smartpark-data-changed", handleDataChanged);
  }, [refresh]);

  const handleOpenAdd = () => {
    setEditingVehicle(null);
    setRegistrationNumber("");
    setVehicleType("four_wheeler");
    setMakeModel("");
    setColor("");
    setError("");
    setShowModal(true);
  };

  const handleOpenEdit = (v: Vehicle) => {
    setEditingVehicle(v);
    setRegistrationNumber(v.registrationNumber);
    setVehicleType(v.vehicleType);
    setMakeModel(v.makeModel);
    setColor(v.color);
    setError("");
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const formattedPlate = formatIndianPlate(registrationNumber);
    if (!isValidIndianPlate(formattedPlate)) {
      setError("Please enter a valid Indian vehicle registration number (e.g. MH 12 AB 1234, DL 01 CA 5678).");
      return;
    }

    if (!makeModel || !color) {
      setError("Make/Model and Color are required.");
      return;
    }

    try {
      if (editingVehicle) {
        storage.updateVehicle(editingVehicle.id, {
          registrationNumber: formattedPlate,
          vehicleType,
          makeModel,
          color,
        });
        setSuccess("Vehicle details updated successfully.");
      } else {
        storage.addVehicle({
          ownerId: user.id,
          registrationNumber: formattedPlate,
          vehicleType,
          makeModel,
          color,
          isVerified: true,
        });
        setSuccess("Vehicle registered successfully with campus security.");
      }
      setShowModal(false);
      refresh();
      setTimeout(() => setSuccess(""), 4000);
    } catch (err: any) {
      setError(err?.message || "Failed to save vehicle details.");
    }
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Are you sure you want to remove this vehicle from your campus profile?")) return;
    try {
      storage.deleteVehicle(id);
      refresh();
      setSuccess("Vehicle removed successfully.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      alert(err?.message || "Cannot delete vehicle.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Registered Campus Vehicles</h1>
          <p className="text-xs text-muted-foreground">
            Manage your personal vehicles authorized for parking in IITM Campus zones
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white font-medium text-xs hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Vehicle</span>
        </button>
      </div>

      {success && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {/* Vehicles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {vehicles.length === 0 ? (
          <div className="col-span-full text-center py-12 border border-dashed rounded-2xl p-6 bg-muted/20 space-y-3">
            <Car className="w-10 h-10 text-muted-foreground mx-auto opacity-40" />
            <h3 className="font-bold text-sm">No Registered Vehicles Found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              You must register at least one vehicle with Indian registration plates to book campus parking slots.
            </p>
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold shadow-sm"
            >
              Add Vehicle Plate
            </button>
          </div>
        ) : (
          vehicles.map((v) => (
            <div
              key={v.id}
              className="bg-card border rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between hover:border-primary/50 transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    {v.vehicleType === "two_wheeler" ? (
                      <Bike className="w-5 h-5" />
                    ) : v.vehicleType === "electric_vehicle" ? (
                      <Zap className="w-5 h-5 text-sky-500" />
                    ) : v.vehicleType === "accessible" ? (
                      <Accessibility className="w-5 h-5 text-purple-500" />
                    ) : (
                      <Car className="w-5 h-5" />
                    )}
                  </div>

                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    Verified Plate
                  </span>
                </div>

                <div>
                  <div className="font-mono font-bold text-lg tracking-wider text-foreground">
                    {formatIndianPlate(v.registrationNumber)}
                  </div>
                  <div className="text-xs font-medium text-foreground mt-0.5">{v.makeModel}</div>
                  <div className="text-[11px] text-muted-foreground flex items-center gap-2 mt-1">
                    <span>Color: {v.color}</span>
                    <span>•</span>
                    <span className="capitalize">{v.vehicleType.replace("_", " ")}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t flex items-center justify-between text-xs">
                <button
                  onClick={() => handleOpenEdit(v)}
                  className="flex items-center gap-1 text-muted-foreground hover:text-foreground font-medium transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>

                <button
                  onClick={() => handleDelete(v.id)}
                  className="flex items-center gap-1 text-destructive hover:opacity-80 font-medium transition-opacity"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Dialog for Add / Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base">
                {editingVehicle ? "Edit Vehicle Details" : "Register Campus Vehicle"}
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
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Indian Registration Plate *</label>
                <input
                  type="text"
                  required
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value.toUpperCase())}
                  placeholder="e.g. MH 12 AB 1234 or DL 01 CA 5678"
                  className="w-full px-3.5 py-2.5 rounded-xl border bg-background font-mono text-sm tracking-wide text-foreground focus:ring-2 focus:ring-primary focus:outline-none uppercase"
                />
                <span className="text-[10px] text-muted-foreground block">
                  Accepted formats: State RTO format (MH 12 AB 1234) or Bharat series (22 BH 1234 AA).
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Vehicle Type *</label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value as VehicleType)}
                  className="w-full px-3 py-2 rounded-xl border bg-background text-foreground text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                >
                  <option value="four_wheeler">4-Wheeler (Car / Sedan / SUV)</option>
                  <option value="two_wheeler">2-Wheeler (Motorcycle / Scooter)</option>
                  <option value="electric_vehicle">Electric Vehicle (EV)</option>
                  <option value="accessible">Accessible / Specially Abled</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Make & Model *</label>
                  <input
                    type="text"
                    required
                    value={makeModel}
                    onChange={(e) => setMakeModel(e.target.value)}
                    placeholder="e.g. Tata Nexon EV"
                    className="w-full px-3 py-2 rounded-xl border bg-background text-foreground text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Color *</label>
                  <input
                    type="text"
                    required
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="e.g. Midnight Blue"
                    className="w-full px-3 py-2 rounded-xl border bg-background text-foreground text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border bg-muted/40 hover:bg-muted font-medium text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-primary text-white font-semibold text-xs hover:bg-primary/90 transition-colors shadow-sm"
                >
                  Save Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
