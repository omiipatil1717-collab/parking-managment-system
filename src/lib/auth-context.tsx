"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserProfile, UserRole } from "./types";
import { storage } from "./storage";

interface AuthContextType {
  user: UserProfile;
  role: UserRole;
  allUsers: UserProfile[];
  switchUser: (userId: string) => void;
  switchRole: (role: UserRole) => void;
  login: (email: string) => boolean;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile>(() => storage.getCurrentUser());
  const [allUsers, setAllUsers] = useState<UserProfile[]>(() => storage.getUsers());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleStorageChange = () => {
      setUser(storage.getCurrentUser());
      setAllUsers(storage.getUsers());
    };

    window.addEventListener("smartpark-data-changed", handleStorageChange);
    return () => window.removeEventListener("smartpark-data-changed", handleStorageChange);
  }, []);

  const switchUser = (userId: string) => {
    storage.setCurrentUser(userId);
    const updated = storage.getCurrentUser();
    setUser(updated);
  };

  const switchRole = (role: UserRole) => {
    const target = allUsers.find((u) => u.role === role);
    if (target) {
      switchUser(target.id);
    }
  };

  const login = (email: string): boolean => {
    setIsLoading(true);
    const found = allUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      switchUser(found.id);
      setIsLoading(false);
      return true;
    }
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    // Default to student
    const student = allUsers.find((u) => u.role === "student");
    if (student) {
      switchUser(student.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user.role,
        allUsers,
        switchUser,
        switchRole,
        login,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
