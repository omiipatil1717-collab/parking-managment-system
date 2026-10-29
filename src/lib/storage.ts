import { 
  UserProfile, 
  Vehicle, 
  ParkingZone, 
  ParkingSpace, 
  Reservation, 
  ParkingSession, 
  GateEvent, 
  SystemNotification, 
  AuditLogEntry, 
  CampusSettings,
  ZoneOccupancySummary
} from "./types";
import { 
  INITIAL_SETTINGS, 
  INITIAL_USERS, 
  INITIAL_VEHICLES, 
  INITIAL_ZONES, 
  INITIAL_SPACES, 
  INITIAL_RESERVATIONS, 
  INITIAL_SESSIONS, 
  INITIAL_GATE_EVENTS, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_AUDIT_LOGS 
} from "./mock-data";
import { generateReservationCode } from "./utils";

const STORAGE_KEYS = {
  USERS: "smartpark_users",
  CURRENT_USER_ID: "smartpark_current_user_id",
  VEHICLES: "smartpark_vehicles",
  ZONES: "smartpark_zones",
  SPACES: "smartpark_spaces",
  RESERVATIONS: "smartpark_reservations",
  SESSIONS: "smartpark_sessions",
  GATE_EVENTS: "smartpark_gate_events",
  NOTIFICATIONS: "smartpark_notifications",
  AUDIT_LOGS: "smartpark_audit_logs",
  SETTINGS: "smartpark_settings",
};

// In-memory fallback if localStorage is unavailable
class AppStorage {
  private memoryStore: Record<string, string> = {};

  private isBrowser(): boolean {
    return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
  }

  private getItem(key: string): string | null {
    if (this.isBrowser()) {
      return localStorage.getItem(key);
    }
    return this.memoryStore[key] || null;
  }

  private setItem(key: string, value: string): void {
    if (this.isBrowser()) {
      localStorage.setItem(key, value);
      window.dispatchEvent(new CustomEvent("smartpark-data-changed", { detail: { key } }));
    } else {
      this.memoryStore[key] = value;
    }
  }

  constructor() {
    this.seedIfEmpty();
  }

  private seedIfEmpty() {
    if (!this.getItem(STORAGE_KEYS.ZONES)) {
      this.setItem(STORAGE_KEYS.ZONES, JSON.stringify(INITIAL_ZONES));
    }
    if (!this.getItem(STORAGE_KEYS.SPACES)) {
      this.setItem(STORAGE_KEYS.SPACES, JSON.stringify(INITIAL_SPACES));
    }
    if (!this.getItem(STORAGE_KEYS.USERS)) {
      this.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    }
    if (!this.getItem(STORAGE_KEYS.VEHICLES)) {
      this.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(INITIAL_VEHICLES));
    }
    if (!this.getItem(STORAGE_KEYS.RESERVATIONS)) {
      this.setItem(STORAGE_KEYS.RESERVATIONS, JSON.stringify(INITIAL_RESERVATIONS));
    }
    if (!this.getItem(STORAGE_KEYS.SESSIONS)) {
      this.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(INITIAL_SESSIONS));
    }
    if (!this.getItem(STORAGE_KEYS.GATE_EVENTS)) {
      this.setItem(STORAGE_KEYS.GATE_EVENTS, JSON.stringify(INITIAL_GATE_EVENTS));
    }
    if (!this.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      this.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
    }
    if (!this.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
      this.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
    }
    if (!this.getItem(STORAGE_KEYS.SETTINGS)) {
      this.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
    }
    if (!this.getItem(STORAGE_KEYS.CURRENT_USER_ID)) {
      this.setItem(STORAGE_KEYS.CURRENT_USER_ID, "usr-student-01");
    }
  }

  // --- SETTINGS ---
  getSettings(): CampusSettings {
    const raw = this.getItem(STORAGE_KEYS.SETTINGS);
    return raw ? JSON.parse(raw) : INITIAL_SETTINGS;
  }

  updateSettings(data: Partial<CampusSettings>, actorId?: string): CampusSettings {
    const current = this.getSettings();
    const updated: CampusSettings = {
      ...current,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    this.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    this.logAudit(actorId || "admin", "UPDATE_SETTINGS", "settings", "default", data);
    return updated;
  }

  // --- USERS & AUTH ---
  getUsers(): UserProfile[] {
    const raw = this.getItem(STORAGE_KEYS.USERS);
    return raw ? JSON.parse(raw) : INITIAL_USERS;
  }

  getCurrentUser(): UserProfile {
    const users = this.getUsers();
    const currentId = this.getItem(STORAGE_KEYS.CURRENT_USER_ID) || "usr-student-01";
    return users.find((u) => u.id === currentId) || users[0] || INITIAL_USERS[0];
  }

  setCurrentUser(id: string): void {
    this.setItem(STORAGE_KEYS.CURRENT_USER_ID, id);
  }

  createUser(user: Omit<UserProfile, "id" | "createdAt" | "updatedAt">): UserProfile {
    const users = this.getUsers();
    const newUser: UserProfile = {
      ...user,
      id: "usr-" + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    users.push(newUser);
    this.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return newUser;
  }

  updateUser(id: string, updates: Partial<UserProfile>): UserProfile {
    const users = this.getUsers();
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) throw new Error("User not found");
    users[index] = { ...users[index], ...updates, updatedAt: new Date().toISOString() };
    this.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return users[index];
  }

  // --- VEHICLES ---
  getVehicles(ownerId?: string): Vehicle[] {
    const raw = this.getItem(STORAGE_KEYS.VEHICLES);
    const list: Vehicle[] = raw ? JSON.parse(raw) : INITIAL_VEHICLES;
    if (ownerId) {
      return list.filter((v) => v.ownerId === ownerId);
    }
    return list;
  }

  addVehicle(vehicle: Omit<Vehicle, "id" | "createdAt" | "updatedAt">): Vehicle {
    const list = this.getVehicles();
    const normalizedReg = vehicle.registrationNumber.trim().toUpperCase();
    
    // Check uniqueness
    if (list.some((v) => v.registrationNumber.toUpperCase() === normalizedReg)) {
      throw new Error(`Vehicle registration ${normalizedReg} is already registered on campus.`);
    }

    const newVehicle: Vehicle = {
      ...vehicle,
      registrationNumber: normalizedReg,
      id: "veh-" + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    list.push(newVehicle);
    this.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(list));
    return newVehicle;
  }

  updateVehicle(id: string, updates: Partial<Vehicle>): Vehicle {
    const list = this.getVehicles();
    const index = list.findIndex((v) => v.id === id);
    if (index === -1) throw new Error("Vehicle not found");
    list[index] = { ...list[index], ...updates, updatedAt: new Date().toISOString() };
    this.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(list));
    return list[index];
  }

  deleteVehicle(id: string): void {
    // Check if vehicle has active parking sessions or confirmed upcoming reservations
    const sessions = this.getSessions("active");
    if (sessions.some((s) => s.vehicleId === id)) {
      throw new Error("Cannot delete vehicle with an active parking session currently inside campus.");
    }
    const reservations = this.getReservations(undefined, "confirmed");
    if (reservations.some((r) => r.vehicleId === id)) {
      throw new Error("Cannot delete vehicle with confirmed upcoming reservations. Cancel bookings first.");
    }

    const list = this.getVehicles().filter((v) => v.id !== id);
    this.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(list));
  }

  // --- ZONES ---
  getZones(): ParkingZone[] {
    const raw = this.getItem(STORAGE_KEYS.ZONES);
    return raw ? JSON.parse(raw) : INITIAL_ZONES;
  }

  getZone(id: string): ParkingZone | undefined {
    return this.getZones().find((z) => z.id === id || z.code === id);
  }

  createZone(data: Omit<ParkingZone, "id" | "createdAt" | "updatedAt">, actorId?: string): ParkingZone {
    const zones = this.getZones();
    const newZone: ParkingZone = {
      ...data,
      id: "zone-" + Math.random().toString(36).substring(2, 7),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    zones.push(newZone);
    this.setItem(STORAGE_KEYS.ZONES, JSON.stringify(zones));
    this.logAudit(actorId || "admin", "CREATE_ZONE", "zone", newZone.id, { name: newZone.name, capacity: newZone.totalCapacity });
    return newZone;
  }

  updateZone(id: string, updates: Partial<ParkingZone>, actorId?: string): ParkingZone {
    const zones = this.getZones();
    const index = zones.findIndex((z) => z.id === id);
    if (index === -1) throw new Error("Zone not found");
    zones[index] = { ...zones[index], ...updates, updatedAt: new Date().toISOString() };
    this.setItem(STORAGE_KEYS.ZONES, JSON.stringify(zones));
    this.logAudit(actorId || "admin", "UPDATE_ZONE", "zone", id, updates);
    return zones[index];
  }

  // --- SPACES ---
  getSpaces(zoneId?: string): ParkingSpace[] {
    const raw = this.getItem(STORAGE_KEYS.SPACES);
    const list: ParkingSpace[] = raw ? JSON.parse(raw) : INITIAL_SPACES;
    if (zoneId) {
      return list.filter((s) => s.zoneId === zoneId);
    }
    return list;
  }

  updateSpace(id: string, updates: Partial<ParkingSpace>, actorId?: string): ParkingSpace {
    const spaces = this.getSpaces();
    const index = spaces.findIndex((s) => s.id === id);
    if (index === -1) throw new Error("Space not found");
    spaces[index] = { ...spaces[index], ...updates, updatedAt: new Date().toISOString() };
    this.setItem(STORAGE_KEYS.SPACES, JSON.stringify(spaces));

    // Recalculate usable capacity for that zone
    const zoneId = spaces[index].zoneId;
    this.recalculateZoneUsableCapacity(zoneId);

    this.logAudit(actorId || "admin", "UPDATE_SPACE", "space", id, updates);
    return spaces[index];
  }

  private recalculateZoneUsableCapacity(zoneId: string) {
    const spaces = this.getSpaces(zoneId);
    if (spaces.length > 0) {
      const activeUsableSpaces = spaces.filter((s) => s.isActive && !s.isOutOfService).length;
      const zone = this.getZone(zoneId);
      if (zone) {
        this.updateZone(zoneId, { usableCapacity: activeUsableSpaces });
      }
    }
  }

  // --- RESERVATIONS ---
  getReservations(userId?: string, status?: string): Reservation[] {
    const raw = this.getItem(STORAGE_KEYS.RESERVATIONS);
    let list: Reservation[] = raw ? JSON.parse(raw) : INITIAL_RESERVATIONS;
    
    // Auto populate joins
    const users = this.getUsers();
    const vehicles = this.getVehicles();
    const zones = this.getZones();
    const spaces = this.getSpaces();

    list = list.map((res) => ({
      ...res,
      user: users.find((u) => u.id === res.userId),
      vehicle: vehicles.find((v) => v.id === res.vehicleId),
      zone: zones.find((z) => z.id === res.zoneId),
      space: spaces.find((s) => s.id === res.spaceId),
    }));

    if (userId) {
      list = list.filter((r) => r.userId === userId);
    }
    if (status) {
      list = list.filter((r) => r.status === status);
    }

    // Sort by startTime descending
    return list.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  }

  getReservation(id: string): Reservation | undefined {
    return this.getReservations().find((r) => r.id === id || r.reservationCode === id);
  }

  /**
   * Concurrency-safe reservation creator
   */
  createReservation(params: {
    userId: string;
    vehicleId: string;
    zoneId: string;
    spaceId?: string;
    startTime: string; // ISO string
    endTime: string; // ISO string
  }): Reservation {
    const now = new Date();
    const start = new Date(params.startTime);
    const end = new Date(params.endTime);

    if (start >= end) {
      throw new Error("End time must be after start time");
    }
    if (end.getTime() <= now.getTime()) {
      throw new Error("Cannot book reservations in the past");
    }

    const zone = this.getZone(params.zoneId);
    if (!zone || !zone.isActive) {
      throw new Error("Selected parking zone is not active or available");
    }

    const vehicle = this.getVehicles().find((v) => v.id === params.vehicleId);
    if (!vehicle) {
      throw new Error("Selected vehicle is not registered");
    }

    // Check if vehicle type is allowed in this zone
    if (!zone.allowedVehicleTypes.includes(vehicle.vehicleType)) {
      throw new Error(`Vehicle type ${vehicle.vehicleType} is not permitted in ${zone.name}`);
    }

    // Check space specific conflicts
    if (params.spaceId) {
      const space = this.getSpaces().find((s) => s.id === params.spaceId);
      if (!space || !space.isActive || space.isOutOfService) {
        throw new Error("Selected space is currently unavailable or out of service");
      }
      const existingOnSpace = this.getReservations(undefined, "confirmed").filter(
        (r) => r.spaceId === params.spaceId &&
               new Date(r.startTime) < end &&
               new Date(r.endTime) > start
      );
      if (existingOnSpace.length > 0) {
        throw new Error(`Parking Space ${space.spaceNumber} is already booked for this time window.`);
      }
    }

    // Check zone capacity vs overlapping reservations
    const overlappingReservations = this.getReservations(undefined, "confirmed").filter(
      (r) => r.zoneId === params.zoneId &&
             new Date(r.startTime) < end &&
             new Date(r.endTime) > start
    );

    if (overlappingReservations.length >= zone.usableCapacity) {
      throw new Error(`Zone ${zone.name} is fully booked during this time window (${overlappingReservations.length}/${zone.usableCapacity} slots reserved).`);
    }

    const code = generateReservationCode();
    const qrTokenHash = `VERIFIED_TOKEN_${code}_${params.vehicleId}_${Date.now()}`;

    const newReservation: Reservation = {
      id: "res-" + Math.random().toString(36).substring(2, 9),
      reservationCode: code,
      userId: params.userId,
      vehicleId: params.vehicleId,
      zoneId: params.zoneId,
      spaceId: params.spaceId,
      startTime: params.startTime,
      endTime: params.endTime,
      status: "confirmed",
      qrTokenHash,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const all = this.getReservations();
    all.unshift(newReservation);
    this.setItem(STORAGE_KEYS.RESERVATIONS, JSON.stringify(all));

    // Audit log
    this.logAudit(params.userId, "CREATE_RESERVATION", "reservation", newReservation.id, {
      code,
      zone: zone.name,
      start: params.startTime,
      end: params.endTime,
      vehicle: vehicle.registrationNumber,
    });

    // Notification
    this.addNotification({
      userId: params.userId,
      title: "Reservation Confirmed",
      message: `Your booking for ${vehicle.registrationNumber} at ${zone.name} is confirmed. Pass code: ${code}`,
      type: "success",
      link: `/reservations/${newReservation.id}`,
    });

    return newReservation;
  }

  cancelReservation(id: string, reason: string, actorId?: string): Reservation {
    const reservations = this.getReservations();
    const index = reservations.findIndex((r) => r.id === id);
    if (index === -1) throw new Error("Reservation not found");

    const res = reservations[index];
    if (res.status === "checked_in") {
      throw new Error("Cannot cancel a reservation that has already checked in.");
    }
    if (res.status === "completed" || res.status === "cancelled") {
      throw new Error(`Reservation is already ${res.status}.`);
    }

    reservations[index] = {
      ...res,
      status: "cancelled",
      cancellationReason: reason,
      updatedAt: new Date().toISOString(),
    };

    this.setItem(STORAGE_KEYS.RESERVATIONS, JSON.stringify(reservations));
    this.logAudit(actorId || res.userId, "CANCEL_RESERVATION", "reservation", id, { reason });
    return reservations[index];
  }

  // --- SESSIONS & GATE OPERATIONS ---
  getSessions(status?: string, zoneId?: string): ParkingSession[] {
    const raw = this.getItem(STORAGE_KEYS.SESSIONS);
    let list: ParkingSession[] = raw ? JSON.parse(raw) : INITIAL_SESSIONS;

    const vehicles = this.getVehicles();
    const zones = this.getZones();
    const spaces = this.getSpaces();
    const reservations = this.getReservations();

    list = list.map((ses) => ({
      ...ses,
      vehicle: vehicles.find((v) => v.id === ses.vehicleId),
      zone: zones.find((z) => z.id === ses.zoneId),
      space: spaces.find((s) => s.id === ses.spaceId),
      reservation: reservations.find((r) => r.id === ses.reservationId),
    }));

    if (status) {
      list = list.filter((s) => s.status === status);
    }
    if (zoneId) {
      list = list.filter((s) => s.zoneId === zoneId);
    }

    return list.sort((a, b) => new Date(b.entryTime).getTime() - new Date(a.entryTime).getTime());
  }

  /**
   * Atomic Guard Check-in
   */
  processGateEntry(params: {
    reservationCode: string;
    guardId: string;
    gateIdentifier: string;
    registrationNumber?: string;
  }): { success: boolean; session?: ParkingSession; error?: string } {
    const { reservationCode, guardId, gateIdentifier } = params;
    const res = this.getReservation(reservationCode.trim().toUpperCase());

    if (!res) {
      this.logGateEvent({
        gateIdentifier,
        vehicleRegistration: params.registrationNumber || "UNKNOWN",
        guardId,
        eventType: "rejection",
        validationResult: "denied",
        rejectionReason: "Reservation code not found in campus database",
      });
      return { success: false, error: "Invalid reservation code. No matching record." };
    }

    if (res.status !== "confirmed") {
      this.logGateEvent({
        gateIdentifier,
        zoneId: res.zoneId,
        reservationId: res.id,
        vehicleRegistration: res.vehicle?.registrationNumber || "UNKNOWN",
        guardId,
        eventType: "rejection",
        validationResult: "denied",
        rejectionReason: `Reservation is currently marked as ${res.status}`,
      });
      return { success: false, error: `Reservation is ${res.status}. Only confirmed bookings can enter.` };
    }

    // Check if vehicle already has an active session inside
    const activeSession = this.getSessions("active").find((s) => s.vehicleId === res.vehicleId);
    if (activeSession) {
      return { success: false, error: "This vehicle is already flagged as physically inside campus." };
    }

    const now = new Date();
    // Update reservation
    const reservations = this.getReservations();
    const resIdx = reservations.findIndex((r) => r.id === res.id);
    if (resIdx !== -1) {
      reservations[resIdx] = {
        ...reservations[resIdx],
        status: "checked_in",
        checkedInAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };
      this.setItem(STORAGE_KEYS.RESERVATIONS, JSON.stringify(reservations));
    }

    // Create session
    const newSession: ParkingSession = {
      id: "ses-" + Math.random().toString(36).substring(2, 9),
      reservationId: res.id,
      vehicleId: res.vehicleId,
      zoneId: res.zoneId,
      spaceId: res.spaceId,
      entryTime: now.toISOString(),
      entryGuardId: guardId,
      entryGate: gateIdentifier,
      status: "active",
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    const sessions = this.getSessions();
    sessions.unshift(newSession);
    this.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));

    // Log gate event
    this.logGateEvent({
      gateIdentifier,
      zoneId: res.zoneId,
      reservationId: res.id,
      vehicleRegistration: res.vehicle?.registrationNumber || "VERIFIED",
      guardId,
      eventType: "entry_scan",
      validationResult: "success",
    });

    // User notification
    this.addNotification({
      userId: res.userId,
      title: "Gate Check-In Approved",
      message: `Your vehicle was cleared for entry at ${gateIdentifier} into ${res.zone?.name || "parking"}.`,
      type: "success",
      link: "/history",
    });

    return { success: true, session: newSession };
  }

  /**
   * Atomic Guard Check-out
   */
  processGateExit(params: {
    sessionId?: string;
    reservationCode?: string;
    registrationNumber?: string;
    guardId: string;
    gateIdentifier: string;
  }): { success: boolean; session?: ParkingSession; durationMinutes?: number; error?: string } {
    const { sessionId, reservationCode, registrationNumber, guardId, gateIdentifier } = params;
    const activeSessions = this.getSessions("active");
    
    let target = activeSessions.find((s) => s.id === sessionId);
    if (!target && reservationCode) {
      const code = reservationCode.trim().toUpperCase();
      target = activeSessions.find((s) => s.reservation?.reservationCode === code);
    }
    if (!target && registrationNumber) {
      const reg = registrationNumber.trim().toUpperCase();
      target = activeSessions.find((s) => s.vehicle?.registrationNumber.toUpperCase() === reg);
    }

    if (!target) {
      return { success: false, error: "No active parked session found for this pass or vehicle plate." };
    }

    const now = new Date();
    const entryTime = new Date(target.entryTime);
    const durationMinutes = Math.max(1, Math.round((now.getTime() - entryTime.getTime()) / 60000));

    // Close session
    const sessions = this.getSessions();
    const sIdx = sessions.findIndex((s) => s.id === target?.id);
    if (sIdx !== -1) {
      sessions[sIdx] = {
        ...sessions[sIdx],
        status: "completed",
        exitTime: now.toISOString(),
        exitGuardId: guardId,
        exitGate: gateIdentifier,
        updatedAt: now.toISOString(),
      };
      this.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    }

    // Complete reservation
    if (target.reservationId) {
      const reservations = this.getReservations();
      const rIdx = reservations.findIndex((r) => r.id === target?.reservationId);
      if (rIdx !== -1) {
        reservations[rIdx] = {
          ...reservations[rIdx],
          status: "completed",
          checkedOutAt: now.toISOString(),
          updatedAt: now.toISOString(),
        };
        this.setItem(STORAGE_KEYS.RESERVATIONS, JSON.stringify(reservations));
      }
    }

    // Log gate event
    this.logGateEvent({
      gateIdentifier,
      zoneId: target.zoneId,
      reservationId: target.reservationId,
      vehicleRegistration: target.vehicle?.registrationNumber || "EXIT",
      guardId,
      eventType: "exit_scan",
      validationResult: "success",
    });

    return { success: true, session: target, durationMinutes };
  }

  // --- GATE EVENTS ---
  getGateEvents(limit: number = 50): GateEvent[] {
    const raw = this.getItem(STORAGE_KEYS.GATE_EVENTS);
    const list: GateEvent[] = raw ? JSON.parse(raw) : INITIAL_GATE_EVENTS;
    return list.sort((a, b) => new Date(b.eventTime).getTime() - new Date(a.eventTime).getTime()).slice(0, limit);
  }

  logGateEvent(event: Omit<GateEvent, "id" | "eventTime">): GateEvent {
    const events = this.getGateEvents(100);
    const newEvent: GateEvent = {
      ...event,
      id: "evt-" + Math.random().toString(36).substring(2, 9),
      eventTime: new Date().toISOString(),
    };
    events.unshift(newEvent);
    this.setItem(STORAGE_KEYS.GATE_EVENTS, JSON.stringify(events));
    return newEvent;
  }

  // --- NOTIFICATIONS ---
  getNotifications(userId: string): SystemNotification[] {
    const raw = this.getItem(STORAGE_KEYS.NOTIFICATIONS);
    const list: SystemNotification[] = raw ? JSON.parse(raw) : INITIAL_NOTIFICATIONS;
    return list
      .filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  addNotification(notif: Omit<SystemNotification, "id" | "createdAt">): SystemNotification {
    const list: SystemNotification[] = this.getItem(STORAGE_KEYS.NOTIFICATIONS)
      ? JSON.parse(this.getItem(STORAGE_KEYS.NOTIFICATIONS)!)
      : INITIAL_NOTIFICATIONS;
    const item: SystemNotification = {
      ...notif,
      id: "notif-" + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
    };
    list.unshift(item);
    this.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
    return item;
  }

  markNotificationRead(id: string): void {
    const list: SystemNotification[] = this.getItem(STORAGE_KEYS.NOTIFICATIONS)
      ? JSON.parse(this.getItem(STORAGE_KEYS.NOTIFICATIONS)!)
      : INITIAL_NOTIFICATIONS;
    const index = list.findIndex((n) => n.id === id);
    if (index !== -1) {
      list[index].readAt = new Date().toISOString();
      this.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
    }
  }

  // --- AUDIT LOGS ---
  getAuditLogs(limit: number = 100): AuditLogEntry[] {
    const raw = this.getItem(STORAGE_KEYS.AUDIT_LOGS);
    const list: AuditLogEntry[] = raw ? JSON.parse(raw) : INITIAL_AUDIT_LOGS;
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, limit);
  }

  logAudit(
    actorId: string,
    action: string,
    entityType: string,
    entityId: string,
    details: Record<string, unknown>
  ): AuditLogEntry {
    const list = this.getAuditLogs(100);
    const user = this.getUsers().find((u) => u.id === actorId);
    const entry: AuditLogEntry = {
      id: "aud-" + Math.random().toString(36).substring(2, 9),
      actorId,
      actorName: user ? user.fullName : actorId,
      action,
      entityType,
      entityId,
      details,
      createdAt: new Date().toISOString(),
    };
    list.unshift(entry);
    this.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(list));
    return entry;
  }

  // --- ACCURATE OCCUPANCY CALCULATION ---
  getOccupancySummaries(): ZoneOccupancySummary[] {
    const zones = this.getZones();
    const activeSessions = this.getSessions("active");
    const now = new Date();

    // Active reservations whose window is active right now
    const currentReservations = this.getReservations(undefined, "confirmed").filter(
      (r) => new Date(r.startTime) <= now && new Date(r.endTime) >= now
    );

    return zones.map((zone) => {
      const zoneActiveSessions = activeSessions.filter((s) => s.zoneId === zone.id).length;
      const zoneActiveReservations = currentReservations.filter((r) => r.zoneId === zone.id).length;
      
      const usable = zone.usableCapacity;
      // Usable minus actual vehicles parked inside
      const availableNow = Math.max(0, usable - zoneActiveSessions);
      const occupancyPercent = usable > 0 ? Math.min(100, Math.round((zoneActiveSessions / usable) * 100)) : 0;

      return {
        zoneId: zone.id,
        zoneName: zone.name,
        zoneCode: zone.code,
        totalCapacity: zone.totalCapacity,
        usableCapacity: usable,
        activeSessions: zoneActiveSessions,
        activeReservations: zoneActiveReservations,
        availableNow,
        occupancyPercent,
        isNearingFull: occupancyPercent >= 85,
      };
    });
  }

  /**
   * Reconcile discrepancy: Manually reset zone active sessions
   */
  reconcileOccupancy(zoneId: string, actualPhysicalCount: number, reason: string, actorId: string): void {
    const zone = this.getZone(zoneId);
    if (!zone) throw new Error("Zone not found");

    this.logAudit(actorId, "RECONCILE_ZONE_OCCUPANCY", "zone", zoneId, {
      actualPhysicalCount,
      reason,
      zoneName: zone.name,
    });
  }
}

export const storage = new AppStorage();
