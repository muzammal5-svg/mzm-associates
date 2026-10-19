"use client";
import { useSubscriptionAccess } from "@/hooks/useSubscriptionAccess";
import Link from "next/link";

export default function BillingPage() {
  const { state, status, loading } = useSubscriptionAccess();
  if (loading) return <div className="p-6">Loading...</div>;
  const locked = status === "expired" || status === "suspended" || status === "cancelled" || status === "none" || status === "pending";
  return (
    <main className="min-h-dvh bg-offwhite px-6 py-12 max-w-3xl mx-auto">
      <h1 className="text-2xl font-heading font-bold">Billing</h1>
      <div className="card mt-4">
        <p>Status: {status}</p>
        {state?.days_left != null && <p>Days left: {state.days_left}</p>}
        {state?.ends_at && <p>Renews: {state.ends_at}</p>}
        {state?.seats_used != null && <p>Seats: {state.seats_used}/{state.seats_max}</p>}
      </div>
      {locked && (
        <div className="card mt-4 bg-danger/10">
          <p className="font-semibold">Subscription locked</p>
          <p className="text-sm text-muted">Renew to access the app.</p>
          <Link href="/pricing" className="btn-primary mt-3 inline-block">Renew</Link>
        </div>
      )}
      <div className="mt-6">
        <Link href="/pricing" className="btn-secondary">View plans</Link>
      </div>
    </main>
  );
}
