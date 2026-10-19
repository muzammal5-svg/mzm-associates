"use client";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/shared/Logo";

export default function WelcomePage() {
  const { user, loading, configured } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!configured || loading) return;
    if (user) router.replace("/");
  }, [user, loading, configured, router]);

  return (
    <main className="min-h-dvh bg-offwhite">
      <section className="bg-navy-header text-white px-6 py-16 text-center">
        <Logo size="lg" variant="full" />
        <h1 className="text-3xl font-heading font-bold mt-6">MZM Case Management</h1>
        <p className="mt-3 text-white/80 max-w-md mx-auto">Cause lists, reminders, clients and documents — in English and Urdu.</p>
        <div className="mt-8 flex gap-3 justify-center">
          <Link href="/register" className="btn-primary">Get started</Link>
          <Link href="/pricing" className="btn-secondary">Pricing</Link>
        </div>
      </section>
      <section className="px-6 py-12 grid gap-4 md:grid-cols-3 max-w-4xl mx-auto">
        {["Cause list","Reminders","Clients","Documents","Urdu/English","Secure"].map((v) => (
          <div key={v} className="card"><h3 className="font-semibold">{v}</h3><p className="text-sm text-muted mt-1">Premium legal app.</p></div>
        ))}
      </section>
      <footer className="px-6 py-8 text-center text-sm text-muted">
        <Link href="/terms" className="mx-2">Terms</Link>
        <Link href="/privacy" className="mx-2">Privacy</Link>
        <Link href="/refund-policy" className="mx-2">Refund</Link>
        <Link href="/contact" className="mx-2">Contact</Link>
      </footer>
    </main>
  );
}
