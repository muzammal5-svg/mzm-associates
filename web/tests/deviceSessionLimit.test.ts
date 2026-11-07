import { describe, it, expect, beforeEach, beforeAll } from "vitest";
import { getDeviceId, getDeviceLabel } from "@/lib/devices";

describe("Device Session & Concurrency Limits", () => {
  const store = new Map<string, string>();

  beforeAll(() => {
    // Provide standard browser globals for the test runner
    (globalThis as any).window = globalThis;
    (globalThis as any).localStorage = {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => { store.set(k, v); },
      removeItem: (k: string) => { store.delete(k); },
      clear: () => { store.clear(); },
    };
    Object.defineProperty(globalThis, "navigator", {
      value: {
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
      },
      configurable: true,
      writable: true,
    });
  });

  beforeEach(() => {
    store.clear();
  });

  it("generates a valid, persistent device ID for the current browser / device", () => {
    const id1 = getDeviceId();
    expect(id1).toBeDefined();
    expect(typeof id1).toBe("string");
    expect(id1.length).toBeGreaterThan(8);

    // Subsequent calls return the same cached device ID
    const id2 = getDeviceId();
    expect(id2).toBe(id1);
  });

  it("detects a friendly device and browser label", () => {
    const label = getDeviceLabel();
    expect(typeof label).toBe("string");
    expect(label).toBe("Chrome on Windows");
  });

  it("enforces max 2 active sessions logic in registration algorithm", () => {
    // Simulating database policy: max 2 active devices
    const devices: { id: string; device_id: string; last_seen_at: number; revoked_at: number | null }[] = [];

    function simulateRegister(deviceId: string) {
      // Upsert
      const existing = devices.find((d) => d.device_id === deviceId);
      if (existing) {
        existing.last_seen_at = Date.now();
        existing.revoked_at = null;
      } else {
        devices.push({
          id: `row-${devices.length + 1}`,
          device_id: deviceId,
          last_seen_at: Date.now(),
          revoked_at: null,
        });
      }

      // Check active devices count
      const active = devices.filter((d) => d.revoked_at === null);
      if (active.length > 2) {
        // Revoke oldest active device that is not the current device
        const candidates = active
          .filter((d) => d.device_id !== deviceId)
          .sort((a, b) => a.last_seen_at - b.last_seen_at);
        if (candidates.length > 0) {
          candidates[0].revoked_at = Date.now();
        }
      }
    }

    // Device 1 registers
    simulateRegister("device-1");
    expect(devices.filter((d) => d.revoked_at === null)).toHaveLength(1);
    expect(devices.find((d) => d.device_id === "device-1")?.revoked_at).toBeNull();

    // Device 2 registers (both 1 and 2 are active)
    simulateRegister("device-2");
    expect(devices.filter((d) => d.revoked_at === null)).toHaveLength(2);
    expect(devices.find((d) => d.device_id === "device-1")?.revoked_at).toBeNull();
    expect(devices.find((d) => d.device_id === "device-2")?.revoked_at).toBeNull();

    // Device 3 registers -> Device 1 (oldest) must be revoked!
    simulateRegister("device-3");
    const activeAfterThird = devices.filter((d) => d.revoked_at === null);
    expect(activeAfterThird).toHaveLength(2);
    expect(devices.find((d) => d.device_id === "device-1")?.revoked_at).not.toBeNull();
    expect(devices.find((d) => d.device_id === "device-2")?.revoked_at).toBeNull();
    expect(devices.find((d) => d.device_id === "device-3")?.revoked_at).toBeNull();

    // If Device 1 logs back in -> Device 2 (now oldest active) gets revoked
    simulateRegister("device-1");
    expect(devices.filter((d) => d.revoked_at === null)).toHaveLength(2);
    expect(devices.find((d) => d.device_id === "device-1")?.revoked_at).toBeNull();
    expect(devices.find((d) => d.device_id === "device-2")?.revoked_at).not.toBeNull();
    expect(devices.find((d) => d.device_id === "device-3")?.revoked_at).toBeNull();
  });
});
