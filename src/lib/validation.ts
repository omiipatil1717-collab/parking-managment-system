import { z } from "zod";
import { isValidIndianPlate } from "./utils";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid campus email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid academic/institutional email"),
  campusId: z.string().min(3, "Campus ID/Roll Number is required (e.g. IITM/2026/CS/042)"),
  department: z.string().min(2, "Department name is required"),
  phoneNumber: z.string().regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian mobile number").optional().or(z.literal("")),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["student", "faculty", "staff"], {
    errorMap: () => ({ message: "Only standard roles can be self-registered" }),
  }),
});

export const vehicleSchema = z.object({
  registrationNumber: z
    .string()
    .min(5, "Registration plate is too short")
    .refine(isValidIndianPlate, {
      message: "Please enter a valid Indian vehicle number (e.g., MH 12 AB 1234 or DL 01 CA 5678)",
    }),
  vehicleType: z.enum(["two_wheeler", "four_wheeler", "electric_vehicle", "accessible"]),
  makeModel: z.string().min(2, "Make and model is required (e.g. Tata Nexon EV, Honda Activa)"),
  color: z.string().min(2, "Vehicle color is required"),
});

export const reservationSchema = z.object({
  vehicleId: z.string().min(1, "Please select a registered vehicle"),
  zoneId: z.string().min(1, "Please select a parking zone"),
  spaceId: z.string().optional(),
  date: z.string().min(1, "Please select a reservation date"),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid start time format (HH:MM)"),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid end time format (HH:MM)"),
}).refine(
  (data) => {
    return data.endTime > data.startTime;
  },
  {
    message: "End time must be after start time",
    path: ["endTime"],
  }
);

export const zoneSchema = z.object({
  code: z.string().min(2, "Zone code is required (e.g., ZONE-A)"),
  name: z.string().min(3, "Zone name is required"),
  description: z.string().min(5, "Description is required"),
  location: z.string().min(3, "Campus location description is required"),
  totalCapacity: z.number().int().positive("Total capacity must be greater than 0"),
  usableCapacity: z.number().int().positive("Usable capacity must be greater than 0"),
  openingTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Format must be HH:MM"),
  closingTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Format must be HH:MM"),
  isActive: z.boolean().default(true),
  hourlyRate: z.number().min(0, "Hourly rate cannot be negative"),
});

export const spaceSchema = z.object({
  spaceNumber: z.string().min(1, "Space number is required"),
  spaceType: z.enum(["two_wheeler", "four_wheeler", "electric_vehicle", "accessible", "faculty_reserved", "staff_reserved"]),
  isActive: z.boolean(),
  isOutOfService: z.boolean(),
});

export const gateScanSchema = z.object({
  reservationCode: z.string().min(5, "Reservation code is required"),
  gateIdentifier: z.string().min(1, "Gate identifier is required"),
});

export const occupancyReconcileSchema = z.object({
  zoneId: z.string().min(1, "Zone is required"),
  actualCount: z.number().int().min(0, "Actual count cannot be negative"),
  reason: z.string().min(5, "Audit reason is required for discrepancy correction"),
});
