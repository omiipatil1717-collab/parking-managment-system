import { describe, it, expect } from "vitest";
import { storage } from "../lib/storage";

describe("Campus Parking Reservation & Gate Engine", () => {
  it("should reject bookings with invalid time windows", () => {
    expect(() => {
      storage.createReservation({
        userId: "usr-student-01",
        vehicleId: "veh-01",
        zoneId: "zone-a",
        startTime: new Date(Date.now() + 7200000).toISOString(),
        endTime: new Date(Date.now() + 3600000).toISOString(), // earlier than start
      });
    }).toThrow("End time must be after start time");
  });

  it("should create a valid confirmed reservation with unique code and QR token", () => {
    const startTime = new Date(Date.now() + 3600000).toISOString();
    const endTime = new Date(Date.now() + 7200000).toISOString();

    const reservation = storage.createReservation({
      userId: "usr-student-01",
      vehicleId: "veh-01",
      zoneId: "zone-a",
      startTime,
      endTime,
    });

    expect(reservation.id).toBeDefined();
    expect(reservation.reservationCode).toMatch(/^SPK-\d{8}-[A-Z0-9]{4}$/);
    expect(reservation.status).toBe("confirmed");
    expect(reservation.qrTokenHash).toBeDefined();
  });

  it("should successfully process gate entry for confirmed reservation", () => {
    // Create fresh reservation
    const startTime = new Date(Date.now() - 600000).toISOString(); // 10 mins ago
    const endTime = new Date(Date.now() + 7200000).toISOString(); // 2 hours from now

    // Add unique test vehicle
    const vehicle = storage.addVehicle({
      ownerId: "usr-faculty-01",
      registrationNumber: "MH 12 ZZ 9900",
      vehicleType: "four_wheeler",
      makeModel: "Honda City",
      color: "Silver",
      isVerified: true,
    });

    const res = storage.createReservation({
      userId: "usr-faculty-01",
      vehicleId: vehicle.id,
      zoneId: "zone-b",
      startTime,
      endTime,
    });

    // Process gate entry
    const entryResult = storage.processGateEntry({
      reservationCode: res.reservationCode,
      guardId: "usr-guard-01",
      gateIdentifier: "North Gate 1",
      registrationNumber: vehicle.registrationNumber,
    });

    expect(entryResult.success).toBe(true);
    expect(entryResult.session).toBeDefined();
    expect(entryResult.session?.status).toBe("active");

    // Process gate exit
    const exitResult = storage.processGateExit({
      reservationCode: res.reservationCode,
      guardId: "usr-guard-01",
      gateIdentifier: "North Gate 1",
    });

    expect(exitResult.success).toBe(true);
    expect(exitResult.durationMinutes).toBeGreaterThanOrEqual(1);
  });
});
