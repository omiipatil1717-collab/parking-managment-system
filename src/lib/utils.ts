import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format date to Indian Standard Time (IST)
 * Example: "29 Oct 2026, 02:30 PM IST"
 */
export function formatISTDateTime(dateInput: string | number | Date): string {
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return "Invalid Date";
    
    return new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(d) + " IST";
  } catch {
    return String(dateInput);
  }
}

/**
 * Format time only in IST
 * Example: "02:30 PM"
 */
export function formatISTTime(dateInput: string | number | Date): string {
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return "--:--";
    
    return new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(d);
  } catch {
    return "--:--";
  }
}

/**
 * Format Date only in Indian format
 * Example: "29 Oct 2026"
 */
export function formatISTDate(dateInput: string | number | Date): string {
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return "--";
    
    return new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(d);
  } catch {
    return "--";
  }
}

/**
 * Formats Indian vehicle registration plate standardly
 * e.g., "mh12ab1234" -> "MH 12 AB 1234"
 */
export function formatIndianPlate(plate: string): string {
  if (!plate) return "";
  const cleaned = plate.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  
  // Standard format: 2 letters (State) + 2 digits (RTO) + 1-2 letters (Series) + 4 digits (Number)
  const regex = /^([A-Z]{2})(\d{1,2})([A-Z]{1,3})?(\d{1,4})?$/;
  const match = cleaned.match(regex);
  if (match) {
    const [, state, rto, series, num] = match;
    const parts = [state, rto.padStart(2, "0")];
    if (series) parts.push(series);
    if (num) parts.push(num.padStart(4, "0"));
    return parts.join(" ");
  }
  return plate.toUpperCase();
}

/**
 * Validates Indian vehicle registration plate pattern
 * Valid examples: MH 12 AB 1234, DL 01 CA 5678, KA 05 MJ 9876, 22 BH 1234 AA (Bharat series)
 */
export function isValidIndianPlate(plate: string): boolean {
  if (!plate) return false;
  const cleaned = plate.replace(/\s+/g, "").toUpperCase();
  
  // Standard state RTO: MH12AB1234 or DL1CA5678
  const standardRegex = /^[A-Z]{2}\d{1,2}[A-Z]{1,3}\d{4}$/;
  // Bharat (BH) series: 22BH1234AA
  const bharatRegex = /^\d{2}BH\d{4}[A-Z]{1,2}$/;
  // Temporary or 2-wheeler old style: MH12A1234
  const flexRegex = /^[A-Z]{2}\d{1,2}[A-Z]{0,3}\d{1,4}$/;
  
  return standardRegex.test(cleaned) || bharatRegex.test(cleaned) || flexRegex.test(cleaned);
}

/**
 * Generates human-friendly campus reservation code
 * Example: "SPK-20261029-4X9B"
 */
export function generateReservationCode(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `SPK-${year}${month}${day}-${randomChars}`;
}

/**
 * Currency formatter for Indian Rupees (₹)
 */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
