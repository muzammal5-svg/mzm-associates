import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { BRAND } from "./brand";

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format an ISO date string (or Date) to "DD MMM YYYY" in Asia/Karachi timezone.
 * Returns "—" for null/undefined.
 */
export function fmtDate(value: string | Date | null | undefined): string {
  if (!value) return "—";
  try {
    const date = typeof value === "string" ? parseISO(value) : value;
    const zoned = toZonedTime(date, BRAND.timezone);
    return format(zoned, BRAND.dateFormat);
  } catch {
    return "—";
  }
}

/** Format a short time HH:mm in Karachi timezone */
export function fmtTime(value: string | Date | null | undefined): string {
  if (!value) return "—";
  try {
    const date = typeof value === "string" ? parseISO(value) : value;
    const zoned = toZonedTime(date, BRAND.timezone);
    return format(zoned, "HH:mm");
  } catch {
    return "—";
  }
}

/** Today's date string YYYY-MM-DD in Karachi timezone */
export function todayKarachi(): string {
  const now = toZonedTime(new Date(), BRAND.timezone);
  return format(now, "yyyy-MM-dd");
}

/** Truncate long text with ellipsis */
export function truncate(text: string, max = 60): string {
  return text.length <= max ? text : text.slice(0, max) + "…";
}

/** Detect if text contains Urdu/Arabic characters (for RTL rendering) */
export function isUrdu(text: string): boolean {
  return /[\u0600-\u06FF\u0750-\u077F]/.test(text);
}

/** Return dir="rtl" if the text is Urdu */
export function textDir(text: string): "rtl" | "ltr" {
  return isUrdu(text) ? "rtl" : "ltr";
}

/** Build a "vs" display string from plaintiff/defendant */
export function vsLabel(plaintiff: string, defendant: string): string {
  return `${plaintiff} vs ${defendant}`;
}
