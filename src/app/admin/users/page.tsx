"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { storage } from "@/lib/storage";
import { RoleGuard } from "@/components/role-guard";
import { UserProfile, UserRole, AccountStatus } from "@/lib/types";
import { 
  ArrowLeft, 
  Users, 
  Search, 
  ShieldCheck, 
  CheckCircle2, 
  UserCheck, 
  UserX,
  Mail,
  Building
} from "lucide-react";

export default function AdminUsersPage() {
  const { user, allUsers, switchUser } = useAuth();
  const [userList, setUserList] = useState<UserProfile[]>(() => storage.getUsers());
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  const refresh = () => setUserList(storage.getUsers());

  const handleRoleChange = (targetUserId: string, newRole: UserRole) => {
    try {
      storage.updateUser(targetUserId, { role: newRole });
      storage.logAudit(user.id, "USER_ROLE_PROMOTION", "user", targetUserId, { newRole });
      refresh();
      setActionSuccess(`User role updated to ${newRole.replace("_", " ")}.`);
      setTimeout(() => setActionSuccess(""), 4000);
    } catch (err: any) {
      alert(err?.message || "Failed to update role");
    }
  };

  const handleStatusToggle = (targetUser: UserProfile) => {
    const nextStatus: AccountStatus = targetUser.accountStatus === "active" ? "suspended" : "active";
    try {
      storage.updateUser(targetUser.id, { accountStatus: nextStatus });
      storage.logAudit(user.id, "USER_STATUS_CHANGE", "user", targetUser.id, { status: nextStatus });
      refresh();
      setActionSuccess(`User account status set to ${nextStatus}.`);
      setTimeout(() => setActionSuccess(""), 4000);
    } catch (err: any) {
      alert(err?.message || "Failed to update status");
    }
  };

  const filtered = userList.filter((u) => {
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return u.fullName.toLowerCase().includes(q) ||
             u.campusId.toLowerCase().includes(q) ||
             u.email.toLowerCase().includes(q);
    }
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
            <h1 className="text-2xl font-bold tracking-tight">Campus User Directory & Access Control</h1>
            <p className="text-xs text-muted-foreground">
              Review campus identification profiles, manage role authorizations, and audit account statuses
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, ID, or email..."
                className="pl-9 pr-3 py-1.5 rounded-xl border bg-background text-xs focus:ring-2 focus:ring-primary focus:outline-none w-56"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border bg-background text-xs font-semibold focus:ring-2 focus:ring-primary focus:outline-none"
            >
              <option value="all">All Roles ({userList.length})</option>
              <option value="student">Students</option>
              <option value="faculty">Faculty</option>
              <option value="staff">Staff</option>
              <option value="security_guard">Security Guards</option>
              <option value="parking_manager">Parking Managers</option>
              <option value="super_admin">Super Administrators</option>
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
                  <th className="py-3 px-4">Campus User</th>
                  <th className="py-3 px-4">Institutional Email</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Assigned Role</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y text-foreground">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-foreground">{u.fullName}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">{u.campusId}</div>
                    </td>

                    <td className="py-3 px-4 text-muted-foreground">
                      {u.email}
                    </td>

                    <td className="py-3 px-4">
                      {u.department}
                    </td>

                    <td className="py-3 px-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                        className="px-2.5 py-1 rounded-lg border bg-background text-[11px] font-semibold capitalize focus:ring-2 focus:ring-primary focus:outline-none"
                      >
                        <option value="student">Student</option>
                        <option value="faculty">Faculty</option>
                        <option value="staff">Staff</option>
                        <option value="security_guard">Security Guard</option>
                        <option value="parking_manager">Parking Manager</option>
                        <option value="super_admin">Super Admin</option>
                      </select>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          u.accountStatus === "active"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                            : "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300"
                        }`}
                      >
                        {u.accountStatus}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleStatusToggle(u)}
                        className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-colors ${
                          u.accountStatus === "active"
                            ? "border-destructive/30 text-destructive hover:bg-destructive/10"
                            : "border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                        }`}
                      >
                        {u.accountStatus === "active" ? "Suspend Access" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
