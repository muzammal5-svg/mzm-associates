import { describe, it, expect } from "vitest";
import type { UserRole } from "@/types/supabase";

function getEssentialFormsCapabilities(role: UserRole | "guest") {
  const isSuperAdmin = role === "super_admin";
  return {
    canUpload: isSuperAdmin,
    canDelete: isSuperAdmin,
    canView: true,
    canDownload: true,
  };
}

describe("Essential Court Forms Access Control Matrix", () => {
  it("allows ONLY super_admin to upload and delete", () => {
    const superAdminCaps = getEssentialFormsCapabilities("super_admin");
    expect(superAdminCaps.canUpload).toBe(true);
    expect(superAdminCaps.canDelete).toBe(true);
    expect(superAdminCaps.canView).toBe(true);
    expect(superAdminCaps.canDownload).toBe(true);
  });

  it("restricts firm admin to view & download only (no upload, no delete)", () => {
    const adminCaps = getEssentialFormsCapabilities("admin");
    expect(adminCaps.canUpload).toBe(false);
    expect(adminCaps.canDelete).toBe(false);
    expect(adminCaps.canView).toBe(true);
    expect(adminCaps.canDownload).toBe(true);
  });

  it("restricts lawyers to view & download only", () => {
    const lawyerCaps = getEssentialFormsCapabilities("lawyer");
    expect(lawyerCaps.canUpload).toBe(false);
    expect(lawyerCaps.canDelete).toBe(false);
    expect(lawyerCaps.canView).toBe(true);
    expect(lawyerCaps.canDownload).toBe(true);
  });

  it("restricts clerks to view & download only", () => {
    const clerkCaps = getEssentialFormsCapabilities("clerk");
    expect(clerkCaps.canUpload).toBe(false);
    expect(clerkCaps.canDelete).toBe(false);
    expect(clerkCaps.canView).toBe(true);
    expect(clerkCaps.canDownload).toBe(true);
  });
});
