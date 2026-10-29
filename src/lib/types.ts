// ====================================================================
// SMARTPARK CAMPUS - TYPE DEFINITIONS
// ====================================================================

export type UserRole = 
  | 'student' 
  | 'faculty' 
  | 'staff' 
  | 'security_guard' 
  | 'parking_manager' 
  | 'super_admin';

export type AccountStatus = 'active' | 'pending_approval' | 'suspended';

export type VehicleType = 
  | 'two_wheeler' 
  | 'four_wheeler' 
  | 'electric_vehicle' 
  | 'accessible';

export type SpaceCategory = 
  | 'two_wheeler' 
  | 'four_wheeler' 
  | 'electric_vehicle' 
  | 'accessible' 
  | 'faculty_reserved' 
  | 'staff_reserved';

export type ReservationStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'checked_in' 
  | 'completed' 
  | 'cancelled' 
  | 'expired' 
  | 'no_show';

export type SessionStatus = 
  | 'active' 
  | 'completed' 
  | 'overstayed' 
  | 'discrepancy_resolved';

export type GateEventType = 
  | 'entry_scan' 
  | 'exit_scan' 
  | 'manual_entry' 
  | 'manual_exit' 
  | 'rejection';

export type ValidationResult = 'success' | 'denied' | 'warning';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  campusId: string; // e.g. "IITM/2026/CS/042"
  department: string; // e.g. "Computer Science & Engineering"
  role: UserRole;
  phoneNumber?: string;
  accountStatus: AccountStatus;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Vehicle {
  id: string;
  ownerId: string;
  registrationNumber: string; // Indian format e.g. "MH 12 AB 1234"
  vehicleType: VehicleType;
  makeModel: string; // e.g. "Tata Nexon EV", "Honda Activa 6G"
  color: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ParkingZone {
  id: string;
  code: string; // e.g. "ZONE-A"
  name: string; // e.g. "North Academic Quad"
  description: string;
  location: string;
  latitude: number;
  longitude: number;
  openingTime: string; // "06:00"
  closingTime: string; // "23:00"
  timezone: string; // "Asia/Kolkata"
  totalCapacity: number;
  usableCapacity: number;
  allowedVehicleTypes: VehicleType[];
  isActive: boolean;
  hourlyRate: number; // In INR ₹
  createdAt: string;
  updatedAt: string;
}

export interface ParkingSpace {
  id: string;
  zoneId: string;
  spaceNumber: string; // e.g. "A-01"
  spaceType: SpaceCategory;
  isActive: boolean;
  isOutOfService: boolean;
  mapX: number;
  mapY: number;
  createdAt: string;
  updatedAt: string;
}

export interface Reservation {
  id: string;
  reservationCode: string; // e.g. "SPK-20261029-4X9B"
  userId: string;
  vehicleId: string;
  zoneId: string;
  spaceId?: string;
  startTime: string; // ISO 8601 string
  endTime: string; // ISO 8601 string
  status: ReservationStatus;
  qrTokenHash: string; // Cryptographic verification payload
  checkedInAt?: string;
  checkedOutAt?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
  // Computed / joined fields
  user?: UserProfile;
  vehicle?: Vehicle;
  zone?: ParkingZone;
  space?: ParkingSpace;
}

export interface ParkingSession {
  id: string;
  reservationId?: string;
  vehicleId: string;
  zoneId: string;
  spaceId?: string;
  entryTime: string; // ISO string
  exitTime?: string; // ISO string
  entryGuardId?: string;
  exitGuardId?: string;
  entryGate: string;
  exitGate?: string;
  status: SessionStatus;
  createdAt: string;
  updatedAt: string;
  // Computed / joined fields
  vehicle?: Vehicle;
  zone?: ParkingZone;
  space?: ParkingSpace;
  reservation?: Reservation;
}

export interface GateEvent {
  id: string;
  gateIdentifier: string; // e.g. "North Gate 1"
  zoneId?: string;
  reservationId?: string;
  vehicleRegistration: string;
  guardId?: string;
  eventType: GateEventType;
  validationResult: ValidationResult;
  rejectionReason?: string;
  eventTime: string;
  rawPayload?: Record<string, unknown>;
}

export interface SystemNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'urgent';
  link?: string;
  readAt?: string;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  actorId?: string;
  actorName?: string;
  action: string;
  entityType: string;
  entityId?: string;
  details: Record<string, unknown>;
  ipAddress?: string;
  createdAt: string;
}

export interface CampusSettings {
  id: string;
  campusName: string;
  campusCode: string;
  timezone: string;
  maxBookingHours: number;
  advanceBookingDays: number;
  cancellationCutoffMinutes: number;
  gracePeriodMinutes: number;
  requireVehicleVerification: boolean;
  updatedAt: string;
}

export interface ZoneOccupancySummary {
  zoneId: string;
  zoneName: string;
  zoneCode: string;
  totalCapacity: number;
  usableCapacity: number;
  activeSessions: number; // physically present vehicles
  activeReservations: number; // booked for current window but not checked in yet
  availableNow: number; // max(0, usableCapacity - activeSessions)
  occupancyPercent: number;
  isNearingFull: boolean;
}
