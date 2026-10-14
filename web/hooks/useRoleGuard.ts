"use client";

import { useAuth }      from "@/providers/AuthProvider";
import type { UserRole } from "@/types/supabase";

const ROLE_RANK: Record<UserRole, number> = {
  super_admin: 4,
  admin:       3,
  lawyer:      2,
  clerk:       1,
};

/**
 * Returns boolean helpers for role-based UI decisions.
 * Does NOT redirect — use useRequireAuth for that.
 *
 * Usage:
 *   const { canDelete, isAdminOrAbove } = useRoleGuard();
 */
export function useRoleGuard() {
  const { profile } = useAuth();
  const role = profile?.role ?? "clerk";
  const rank = ROLE_RANK[role];

  return {
    role,
    /** true for super_admin and admin */
    isAdminOrAbove:      rank >= ROLE_RANK.admin,
    /** true for super_admin only */
    isSuperAdmin:        role === "super_admin",
    /** true for lawyer and above */
    isLawyerOrAbove:     rank >= ROLE_RANK.lawyer,
    /** Can insert/update cases and clients */
    canWrite:            rank >= ROLE_RANK.lawyer,
    /** Can delete records */
    canDelete:           rank >= ROLE_RANK.admin,
    canDeleteDocuments:  rank >= ROLE_RANK.lawyer,
    /** Can manage users */
    canManageUsers:      rank >= ROLE_RANK.admin,
    /** Generic check */
    hasRole:             (r: UserRole) => role === r,
    atLeast:             (r: UserRole) => rank >= ROLE_RANK[r],
  };
}
