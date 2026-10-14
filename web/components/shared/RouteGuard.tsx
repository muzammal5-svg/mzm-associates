"use client";

import { type ReactNode } from "react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { PageLoader }     from "@/components/ui/LoadingSpinner";
import type { UserRole }  from "@/types/supabase";

interface RouteGuardProps {
  children:       ReactNode;
  allowedRoles?:  UserRole[];
  redirectTo?:    string;
  unauthorizedTo?: string;
  /** Custom fallback while session resolves */
  fallback?:      ReactNode;
}

/**
 * Wrap any page component with RouteGuard to enforce authentication
 * and optional role requirements.
 *
 * Usage:
 *   <RouteGuard allowedRoles={["admin","lawyer"]}>
 *     <MyPage />
 *   </RouteGuard>
 */
export function RouteGuard({
  children,
  allowedRoles,
  redirectTo,
  unauthorizedTo,
  fallback,
}: RouteGuardProps) {
  const { loading } = useRequireAuth({ redirectTo, allowedRoles, unauthorizedTo });

  if (loading) return <>{fallback ?? <PageLoader />}</>;
  return <>{children}</>;
}
