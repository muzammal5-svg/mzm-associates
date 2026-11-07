import { supabase } from "@/lib/supabase/client";
import { saasDb, saasRpc } from "@/lib/supabase/saas";

const DEVICE_ID_KEY = "mzm_device_id";

/**
 * Returns a persistent unique device ID for this client (browser or app instance).
 */
export function getDeviceId(): string {
  if (typeof window === "undefined") return "server";
  try {
    let id = localStorage.getItem(DEVICE_ID_KEY);
    if (!id || id.length < 8) {
      id = typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `dev-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(DEVICE_ID_KEY, id);
    }
    return id;
  } catch {
    return "ephemeral-device";
  }
}

/**
 * Human-readable label for this client device (e.g., "Chrome on Windows", "Daily Diary App (Android)").
 */
export function getDeviceLabel(): string {
  if (typeof window === "undefined") return "Server";
  try {
    const ua = navigator.userAgent;
    let browser = "Browser";
    if (ua.includes("Firefox/")) browser = "Firefox";
    else if (ua.includes("Edg/")) browser = "Edge";
    else if (ua.includes("Chrome/")) browser = "Chrome";
    else if (ua.includes("Safari/")) browser = "Safari";

    let os = "Device";
    if (ua.includes("Windows")) os = "Windows";
    else if (ua.includes("Android")) os = "Android";
    else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";
    else if (ua.includes("Mac OS")) os = "macOS";
    else if (ua.includes("Linux")) os = "Linux";

    return `${browser} on ${os}`;
  } catch {
    return "Authorized Client";
  }
}

/**
 * Register this device with the backend.
 * Enforces the maximum 2 concurrent devices per user policy.
 * If more than 2 devices are registered, the database revokes the oldest session.
 */
export async function registerCurrentDevice(): Promise<{ ok: boolean; error?: string }> {
  try {
    const deviceId = getDeviceId();
    const label = getDeviceLabel();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return { ok: false, error: "Not authenticated" };

    const { error } = await saasRpc.registerDevice(deviceId, label, session.access_token ?? null);
    if (error) {
      console.warn("[devices] register failed:", error.message);
      return { ok: false, error: error.message };
    }
    return { ok: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to register device";
    console.warn("[devices] register exception:", msg);
    return { ok: false, error: msg };
  }
}

/**
 * Check if this device is still authorized (i.e. has not been revoked by a 3rd device logging in).
 */
export async function checkCurrentDeviceValid(): Promise<{ valid: boolean; reason?: string }> {
  try {
    const deviceId = getDeviceId();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return { valid: false, reason: "not_authenticated" };

    const { data, error } = await saasRpc.checkDeviceValid(deviceId);
    if (error) {
      console.warn("[devices] check failed:", error.message);
      return { valid: true };
    }

    const res = data as { valid?: boolean; reason?: string } | null;
    if (res && res.valid === false) {
      return { valid: false, reason: res.reason ?? "revoked" };
    }
    return { valid: true };
  } catch {
    return { valid: true };
  }
}

/**
 * Revoke this device on logout so its slot is immediately freed for another device.
 */
export async function revokeCurrentDevice(): Promise<void> {
  try {
    const deviceId = getDeviceId();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    await saasDb
      .userDevices()
      .update({ revoked_at: new Date().toISOString() })
      .eq("user_id", session.user.id)
      .eq("device_id", deviceId);
  } catch (err) {
    console.warn("[devices] revoke failed:", err);
  }
}
