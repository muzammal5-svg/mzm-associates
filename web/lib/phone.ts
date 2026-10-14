/**
 * Pakistani phone number utilities.
 * Accepted formats: 03001234567 | +923001234567 | 923001234567
 * Stored as E.164: +923001234567
 */

/** Strip everything except digits and leading + */
export function stripPhone(value: string): string {
  return value.replace(/[^\d+]/g, "");
}

/** Normalise to E.164 (+92XXXXXXXXXX) */
export function normalisePhone(value: string): string {
  const stripped = stripPhone(value);
  if (stripped.startsWith("+92")) return stripped;
  if (stripped.startsWith("92"))  return `+${stripped}`;
  if (stripped.startsWith("0"))   return `+92${stripped.slice(1)}`;
  return stripped; // unknown format — store as-is
}

/** Display as 0300-1234567 */
export function formatPhoneDisplay(e164: string): string {
  const local = e164.replace(/^\+92/, "0");
  if (local.length === 11) {
    return `${local.slice(0, 4)}-${local.slice(4)}`;
  }
  return e164;
}

/** Zod-compatible validator */
export function isValidPkPhone(value: string): boolean {
  const n = normalisePhone(value);
  return /^\+923\d{9}$/.test(n);
}

/** CNIC utilities — format: 35201-1234567-1 */
export function formatCnic(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 13);
  if (digits.length <= 5)  return digits;
  if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
}

export function isValidCnic(value: string): boolean {
  return /^\d{5}-\d{7}-\d$/.test(value);
}

/** Apply CNIC mask on every keystroke — call from onChange */
export function maskCnic(e: React.ChangeEvent<HTMLInputElement>): string {
  const prev    = e.currentTarget.dataset.prev ?? "";
  const current = e.target.value;
  // Allow backspace by not masking if shorter
  if (current.length < prev.length) return current;
  return formatCnic(current);
}
