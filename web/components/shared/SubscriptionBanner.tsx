"use client";
import Link from "next/link";
import { useSubscriptionAccess } from "@/hooks/useSubscriptionAccess";

export function SubscriptionBanner() {
  const { inGrace, status, state } = useSubscriptionAccess();
  if (!inGrace) return null;
  return (
    <div className="bg-warning/10 border-b border-warning px-4 py-2 text-sm flex items-center justify-between">
      <span>Read-only: subscription in grace. Renew to continue.</span>
      <Link href="/billing" className="btn-primary btn-xs">Renew</Link>
    </div>
  );
}
