import { describe, it, expect } from "vitest";
import { isValidIndianPlate, formatIndianPlate, formatISTDateTime } from "../lib/utils";

describe("Indian Vehicle Registration Validation & Formatting", () => {
  it("should validate standard Indian state registration plates", () => {
    expect(isValidIndianPlate("MH 12 AB 1234")).toBe(true);
    expect(isValidIndianPlate("DL 01 CA 5678")).toBe(true);
    expect(isValidIndianPlate("KA 05 MJ 9876")).toBe(true);
    expect(isValidIndianPlate("TN 09 BX 4321")).toBe(true);
  });

  it("should validate Bharat (BH) series plates", () => {
    expect(isValidIndianPlate("22 BH 1234 AA")).toBe(true);
  });

  it("should reject invalid vehicle plate strings", () => {
    expect(isValidIndianPlate("12345")).toBe(false);
    expect(isValidIndianPlate("ABCXYZ")).toBe(false);
    expect(isValidIndianPlate("")).toBe(false);
  });

  it("should format lowercase unspaced plates to uppercase spaced standard", () => {
    expect(formatIndianPlate("mh12ab1234")).toBe("MH 12 AB 1234");
    expect(formatIndianPlate("dl01ca5678")).toBe("DL 01 CA 5678");
  });

  it("should format timestamps to Indian Standard Time (IST)", () => {
    const isoString = "2026-10-29T10:00:00Z";
    const formatted = formatISTDateTime(isoString);
    expect(formatted).toContain("IST");
    expect(formatted).toContain("2026");
  });
});
