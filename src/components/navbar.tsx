"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "next-themes";
import { storage } from "@/lib/storage";
import { formatISTTime } from "@/lib/utils";
import { 
  Car, 
  ShieldCheck, 
  LayoutDashboard, 
  MapPin, 
  CalendarCheck, 
  History, 
  QrCode, 
  Bell, 
  Sun, 
  Moon, 
  Menu, 
  X, 
  Sliders, 
  LogOut, 
  User, 
  BarChart3,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Info
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const { user, role, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const notifications = storage.getNotifications(user.id);
  const unreadCount = notifications.filter((n) => !n.readAt).length;

  // Determine active navigation links based on user role
  const getNavLinks = () => {
    if (role === "security_guard") {
      return [
        { label: "Guard Console", href: "/guard", icon: <ShieldCheck className="w-4 h-4" /> },
        { label: "Scan Pass", href: "/guard/scan", icon: <QrCode className="w-4 h-4" /> },
        { label: "Gate Inbound", href: "/guard/entries", icon: <Car className="w-4 h-4" /> },
        { label: "Gate Outbound", href: "/guard/exits", icon: <LogOut className="w-4 h-4" /> },
      ];
    }

    if (role === "parking_manager" || role === "super_admin") {
      return [
        { label: "Admin Hub", href: "/admin", icon: <LayoutDashboard className="w-4 h-4" /> },
        { label: "Zones", href: "/admin/zones", icon: <MapPin className="w-4 h-4" /> },
        { label: "Spaces", href: "/admin/spaces", icon: <Layers className="w-4 h-4" /> },
        { label: "Reservations", href: "/admin/reservations", icon: <CalendarCheck className="w-4 h-4" /> },
        { label: "Active Sessions", href: "/admin/sessions", icon: <Car className="w-4 h-4" /> },
        { label: "Analytics", href: "/admin/analytics", icon: <BarChart3 className="w-4 h-4" /> },
        { label: "Settings", href: "/admin/settings", icon: <Sliders className="w-4 h-4" /> },
      ];
    }

    // Default: student / faculty / staff
    return [
      { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
      { label: "Campus Parking", href: "/parking", icon: <MapPin className="w-4 h-4" /> },
      { label: "My Vehicles", href: "/vehicles", icon: <Car className="w-4 h-4" /> },
      { label: "Reservations", href: "/reservations", icon: <CalendarCheck className="w-4 h-4" /> },
      { label: "History", href: "/history", icon: <History className="w-4 h-4" /> },
    ];
  };

  const navLinks = getNavLinks();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-card/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <Car className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-tight tracking-tight text-foreground flex items-center gap-1.5">
                  SmartPark <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded font-mono font-semibold">CAMPUS</span>
                </span>
                <span className="text-[10px] text-muted-foreground font-medium">IITM Smart Mobility</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Tools & Profile */}
          <div className="flex items-center gap-3">
            {/* Notifications Popover */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-destructive text-white rounded-full text-[10px] flex items-center justify-center font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border bg-card p-3 shadow-xl z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between pb-2 border-b mb-2">
                    <span className="font-semibold text-sm">Notifications</span>
                    <Link
                      href="/notifications"
                      onClick={() => setNotifOpen(false)}
                      className="text-xs text-primary hover:underline font-medium"
                    >
                      View All
                    </Link>
                  </div>
                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-4">No notifications yet</p>
                    ) : (
                      notifications.slice(0, 4).map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-2 rounded-lg text-xs border ${
                            notif.type === "success"
                              ? "bg-emerald-50/50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800"
                              : notif.type === "warning"
                              ? "bg-amber-50/50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800"
                              : "bg-muted/50 border-border"
                          }`}
                        >
                          <div className="flex items-center justify-between font-semibold mb-0.5">
                            <span className="flex items-center gap-1.5">
                              {notif.type === "success" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                              {notif.type === "warning" && <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
                              {notif.type === "info" && <Info className="w-3.5 h-3.5 text-primary" />}
                              {notif.title}
                            </span>
                            <span className="text-[10px] text-muted-foreground">{formatISTTime(notif.createdAt)}</span>
                          </div>
                          <p className="text-muted-foreground text-[11px]">{notif.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* User Profile Pill */}
            <Link
              href="/profile"
              className="hidden sm:flex items-center gap-2 pl-2 pr-3 py-1 rounded-full border bg-muted/40 hover:bg-muted transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs uppercase overflow-hidden">
                {user.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
                ) : (
                  user.fullName.charAt(0)
                )}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-semibold leading-tight truncate max-w-[110px]">{user.fullName}</span>
                <span className="text-[10px] text-muted-foreground capitalize">{role.replace("_", " ")}</span>
              </div>
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-muted-foreground hover:bg-muted"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-card px-4 pt-2 pb-6 space-y-2 animate-in slide-in-from-top">
          <div className="p-3 bg-muted rounded-xl mb-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">
              {user.fullName.charAt(0)}
            </div>
            <div>
              <div className="text-sm font-semibold">{user.fullName}</div>
              <div className="text-xs text-muted-foreground">{user.campusId} • {role}</div>
            </div>
          </div>
          <div className="space-y-1">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  pathname === item.href ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
            <Link
              href="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted"
            >
              <User className="w-4 h-4" />
              <span>My Campus Profile</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
