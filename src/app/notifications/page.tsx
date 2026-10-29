"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { storage } from "@/lib/storage";
import { SystemNotification } from "@/lib/types";
import { formatISTDateTime } from "@/lib/utils";
import { 
  Bell, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  AlertCircle, 
  ArrowRight,
  Check
} from "lucide-react";

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<SystemNotification[]>(() =>
    storage.getNotifications(user.id)
  );

  const refresh = () => {
    setNotifications(storage.getNotifications(user.id));
  };

  const handleMarkAsRead = (id: string) => {
    storage.markNotificationRead(id);
    refresh();
  };

  const handleMarkAllRead = () => {
    notifications.forEach((n) => {
      if (!n.readAt) storage.markNotificationRead(n.id);
    });
    refresh();
  };

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications & Alerts</h1>
          <p className="text-xs text-muted-foreground">
            System announcements, booking reminders, and gate security updates
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border bg-card hover:bg-muted text-xs font-semibold transition-colors"
          >
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Mark All Read ({unreadCount})</span>
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-16 border border-dashed rounded-2xl bg-muted/20 space-y-3">
          <Bell className="w-10 h-10 text-muted-foreground/40 mx-auto" />
          <h3 className="font-bold text-sm">No notifications</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            You are all caught up! New reservation reminders and gate check-in alerts will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => {
            const isUnread = !notif.readAt;

            return (
              <div
                key={notif.id}
                className={`p-4 rounded-2xl border transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  isUnread
                    ? "bg-card border-primary/40 shadow-sm ring-1 ring-primary/20"
                    : "bg-muted/30 border-border/60 opacity-80"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      notif.type === "success"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                        : notif.type === "warning"
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300"
                        : notif.type === "urgent"
                        ? "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300"
                        : "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300"
                    }`}
                  >
                    {notif.type === "success" && <CheckCircle2 className="w-5 h-5" />}
                    {notif.type === "warning" && <AlertTriangle className="w-5 h-5" />}
                    {notif.type === "urgent" && <AlertCircle className="w-5 h-5" />}
                    {notif.type === "info" && <Info className="w-5 h-5" />}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-foreground">{notif.title}</h4>
                      {isUnread && (
                        <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0"></span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{notif.message}</p>
                    <span className="text-[10px] text-muted-foreground block font-mono">
                      {formatISTDateTime(notif.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  {notif.link && (
                    <Link
                      href={notif.link}
                      className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white font-medium text-xs transition-colors flex items-center gap-1"
                    >
                      <span>View</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}

                  {isUnread && (
                    <button
                      onClick={() => handleMarkAsRead(notif.id)}
                      className="px-3 py-1.5 rounded-lg border bg-card hover:bg-muted text-xs font-medium text-muted-foreground transition-colors"
                    >
                      Mark Read
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
