"use client";

import React, { useState } from "react";
import Link from "next/link";
import { storage } from "@/lib/storage";
import { CampusParkingMap } from "@/components/map/campus-parking-map";
import { 
  Car, 
  ShieldCheck, 
  QrCode, 
  Clock, 
  Zap, 
  CheckCircle2, 
  ArrowRight, 
  GraduationCap, 
  Award, 
  Building2, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp,
  MapPin,
  Sparkles,
  BarChart3,
  Smartphone
} from "lucide-react";

export default function LandingPage() {
  const [selectedZone, setSelectedZone] = useState("zone-a");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const summaries = storage.getOccupancySummaries();
  const totalUsable = summaries.reduce((acc, s) => acc + s.usableCapacity, 0);
  const totalParked = summaries.reduce((acc, s) => acc + s.activeSessions, 0);
  const totalAvailable = summaries.reduce((acc, s) => acc + s.availableNow, 0);
  const totalReserved = summaries.reduce((acc, s) => acc + s.activeReservations, 0);
  const occupancyRate = totalUsable > 0 ? Math.round((totalParked / totalUsable) * 100) : 0;

  const faqs = [
    {
      q: "How does the digital QR parking pass work at campus security gates?",
      a: "When you book a slot, SmartPark generates a cryptographically signed QR pass with a unique verification token. At the campus gate, present the pass on your mobile device to the guard or optical scanner. The system verifies the time window and vehicle plate, marks your check-in, and raises the barrier in under 2 seconds.",
    },
    {
      q: "Can I reserve a parking slot in advance?",
      a: "Yes. Students, faculty, and authorized campus staff can book parking slots up to 3 days in advance for maximum booking windows of up to 8 hours per session.",
    },
    {
      q: "Are Electric Vehicles (EV) provided dedicated charging bays?",
      a: "Yes! Zone B (Tech Park Hub) and Zone A (North Quad) feature dedicated EV fast charging bays. Charging slots can be specifically reserved by EV owners with priority green power allocation.",
    },
    {
      q: "What happens if I arrive earlier or stay past my reserved time?",
      a: "A 30-minute early grace window is permitted for gate entry. If an overstay occurs, security notifications are sent to the user and estate managers, and the vehicle session is flagged for security compliance.",
    },
    {
      q: "How is real-time occupancy verified?",
      a: "Unlike systems that merely estimate, SmartPark computes availability strictly from verified physical gate check-in and check-out events logged by security personnel and optical sensors.",
    },
  ];

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-8 sm:p-12 md:p-16 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-emerald-400 text-xs font-semibold border border-white/10">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Live Campus Mobility Engine • IITM Pune</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Seamless, Verified Campus Parking with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Zero Guesswork</span>.
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            A unified smart campus parking management system for students, faculty, staff and security guards. Real-time slot availability, instant QR access control, and guaranteed bay reservations.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/25 hover:scale-[1.02]"
            >
              <span>Access Student / Faculty Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/guard"
              className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white/10 backdrop-blur-md text-white font-semibold hover:bg-white/20 transition-all border border-white/15"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Guard Gate Scanner</span>
            </Link>
          </div>

          {/* Quick telemetry pills */}
          <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-white/10 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Total Usable Bays</span>
              <span className="text-xl font-bold text-white font-mono">{totalUsable}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Vehicles Parked</span>
              <span className="text-xl font-bold text-emerald-400 font-mono">{totalParked}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Available Slots Now</span>
              <span className="text-xl font-bold text-blue-400 font-mono">{totalAvailable}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Active Occupancy</span>
              <span className="text-xl font-bold text-amber-400 font-mono">{occupancyRate}%</span>
            </div>
          </div>
        </div>
      </section>

      {/* Live Campus Parking Map Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Live Campus Parking Telemetry</h2>
            <p className="text-sm text-muted-foreground">
              Interactive map displaying verified real-time slot occupancy across all 5 campus zones
            </p>
          </div>
          <span className="text-xs bg-muted px-2.5 py-1 rounded-md text-muted-foreground font-mono">
            IST: Asia/Kolkata
          </span>
        </div>

        <CampusParkingMap
          selectedZoneId={selectedZone}
          onSelectZone={(zoneId) => setSelectedZone(zoneId)}
        />
      </section>

      {/* How it works 3-step workflow */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">How SmartPark Operates</h2>
          <p className="text-sm text-muted-foreground">
            Eliminating morning campus bottlenecks with a 3-step digital reservation and physical check-in workflow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-3 relative group hover:border-primary/50 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg group-hover:bg-primary group-hover:text-white transition-colors">
              1
            </div>
            <h3 className="font-bold text-base">Select Zone & Vehicle</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Choose your registered vehicle (2W, 4W or EV) and view real-time availability in your department quad or academic library zone.
            </p>
          </div>

          <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-3 relative group hover:border-primary/50 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              2
            </div>
            <h3 className="font-bold text-base">Instant QR Pass Issuance</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Confirm your booking window. The system locks capacity atomically and issues an encrypted digital parking pass with dynamic QR code.
            </p>
          </div>

          <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-3 relative group hover:border-primary/50 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold text-lg group-hover:bg-purple-600 group-hover:text-white transition-colors">
              3
            </div>
            <h3 className="font-bold text-base">Guard Scan & Barrier Raise</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Present your pass at campus gates. Havaldar Vikram and security optical scanners authenticate the plate and grant seamless entry.
            </p>
          </div>
        </div>
      </section>

      {/* Role-Specific Benefits */}
      <section className="space-y-8 bg-muted/30 border rounded-3xl p-8 sm:p-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Engineered for Every Campus Stakeholder</h2>
          <p className="text-sm text-muted-foreground">
            From undergraduate students to security guards and campus estate directors.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Students */}
          <div className="bg-card border rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg">Students & Scholars</h3>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Reserve 2-wheeler & 4-wheeler slots ahead of lecture exams</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Save digital pass to mobile wallet with instant barcode</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Real-time notifications for grace periods & expirations</span>
              </li>
            </ul>
          </div>

          {/* Faculty & Staff */}
          <div className="bg-card border rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg">Faculty & Researchers</h3>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Guaranteed access to Faculty Enclave (Zone D) bays</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Dedicated EV fast charger bay reservations at Tech Park</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Priority pass approvals for guest speakers & examiners</span>
              </li>
            </ul>
          </div>

          {/* Administration & Security */}
          <div className="bg-card border rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg">Estate & Security</h3>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Eliminate unauthorized and unregistered vehicles inside</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Immutable audit logs of all security scans & gate events</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Live discrepancy reconciliation and overstay enforcement</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="space-y-6 max-w-3xl mx-auto">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Frequently Asked Questions</h2>
          <p className="text-sm text-muted-foreground">
            Clear guidelines on campus parking policy, slot rules and vehicle compliance.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className="border bg-card rounded-2xl overflow-hidden shadow-sm">
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-4 sm:p-5 text-left text-sm font-semibold hover:bg-muted/50 transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <HelpCircle className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>{faq.q}</span>
                  </span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-muted-foreground leading-relaxed border-t bg-muted/20">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Call to action card */}
      <section className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <h3 className="text-xl font-bold">Ready to park on campus without hassle?</h3>
          <p className="text-xs text-muted-foreground max-w-xl">
            Register your vehicle plate once, reserve slots from your phone, and enjoy instant gate entry at IITM.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/register"
            className="px-5 py-2.5 rounded-xl bg-primary text-white font-semibold text-xs hover:bg-primary/90 transition-all shadow-md"
          >
            Create Account
          </Link>
          <Link
            href="/login"
            className="px-5 py-2.5 rounded-xl border bg-card hover:bg-muted font-semibold text-xs transition-colors"
          >
            Sign In
          </Link>
        </div>
      </section>
    </div>
  );
}
