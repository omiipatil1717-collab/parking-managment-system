import React from "react";
import Link from "next/link";
import { Car, Shield, Phone, Mail, Clock, HelpCircle } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto border-t bg-card text-muted-foreground text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary text-white flex items-center justify-center">
                <Car className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm text-foreground">SmartPark Campus</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Official centralized parking management & access control for students, faculty, staff and visitors at IITM Campus.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono">
              <Clock className="w-3.5 h-3.5" />
              <span>Current Timezone: Asia/Kolkata (IST)</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <span className="font-semibold text-foreground text-sm block">Campus Portals</span>
            <ul className="space-y-1.5">
              <li><Link href="/dashboard" className="hover:text-primary transition-colors">Student & Faculty Hub</Link></li>
              <li><Link href="/parking" className="hover:text-primary transition-colors">Live Zone Availability</Link></li>
              <li><Link href="/reservations" className="hover:text-primary transition-colors">Parking Passes</Link></li>
              <li><Link href="/guard" className="hover:text-primary transition-colors">Security Guard Gate Console</Link></li>
              <li><Link href="/admin" className="hover:text-primary transition-colors">Estate & Operations Admin</Link></li>
            </ul>
          </div>

          {/* Security & Policies */}
          <div className="space-y-2">
            <span className="font-semibold text-foreground text-sm block">Security & Rules</span>
            <ul className="space-y-1.5">
              <li><span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-primary" /> Max duration: 8 hrs/slot</span></li>
              <li><span>15-minute cancellation cutoff policy</span></li>
              <li><span>Speed limit on campus: 20 km/h</span></li>
              <li><span>EV charging priority bays enforcement</span></li>
              <li><span>No-show penalty after 20-min grace period</span></li>
            </ul>
          </div>

          {/* Contact Helpline */}
          <div className="space-y-2">
            <span className="font-semibold text-foreground text-sm block">Campus Helpdesk</span>
            <div className="space-y-2 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" />
                <span>Security Control: +91 (20) 2590-8000</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                <span>parking-helpdesk@campus.edu</span>
              </div>
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-primary" />
                <span>North Gate Control Station 1</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-muted-foreground text-[11px]">
          <div>
            © {new Date().getFullYear()} SmartPark Campus • Indian Institute of Technology & Management. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              All 5 Gates & Sensors Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
