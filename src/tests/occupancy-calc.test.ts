import { describe, it, expect } from "vitest";
import { storage } from "../lib/storage";

describe("Campus Occupancy Tracking & Telemetry Truth Calculation", () => {
  it("should calculate occupancy distinguishing total, usable and active sessions", () => {
    const summaries = storage.getOccupancySummaries();
    expect(summaries.length).toBeGreaterThan(0);

    const zoneA = summaries.find((s) => s.zoneId === "zone-a");
    expect(zoneA).toBeDefined();
    if (zoneA) {
      expect(zoneA.totalCapacity).toBeGreaterThanOrEqual(zoneA.usableCapacity);
      expect(zoneA.availableNow).toBe(Math.max(0, zoneA.usableCapacity - zoneA.activeSessions));
      expect(zoneA.occupancyPercent).toBeGreaterThanOrEqual(0);
      expect(zoneA.occupancyPercent).toBeLessThanOrEqual(100);
    }
  });

  it("should reconcile discrepancy and write immutable audit log", () => {
    const initialLogsCount = storage.getAuditLogs().length;

    storage.reconcileOccupancy(
      "zone-a",
      25,
      "Manual physical count conducted by Estate Officer",
      "usr-admin-01"
    );

    const updatedLogs = storage.getAuditLogs();
    expect(updatedLogs.length).toBe(initialLogsCount + 1);
    expect(updatedLogs[0].action).toBe("RECONCILE_ZONE_OCCUPANCY");
  });
});
