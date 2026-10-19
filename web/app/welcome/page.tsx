"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { SITE, whatsappLink } from "@/lib/siteConfig";
import Link from "next/link";
import Image from "next/image";

export default function WelcomePage() {
  const { user, loading, configured } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!configured || loading) return;
    if (user) router.replace("/");
  }, [user, loading, configured, router]);

  return (
    <MarketingShell>
      <section className="relative overflow-hidden bg-navy-header text-white py-20 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-heading font-bold leading-tight">{SITE.tagline}</h1>
            <p className="mt-4 text-white/80 text-lg">Cause lists, reminders, clients and documents — in English and Urdu.</p>
            <div className="mt-8 flex gap-3">
              <Link href="/register" className="btn-primary">Start free trial</Link>
              <Link href="/pricing" className="btn-secondary">View pricing</Link>
            </div>
            <p className="mt-4 text-sm text-white/60">Built for Pakistani law firms · English & Urdu</p>
          </div>
          <div className="relative">
            <Image src="/logo/logoadv.jpeg" alt="logo" width={200} height={200} className="rounded-2xl shadow-lg" />
          </div>
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-6">
        {["Daily cause list", "Hearing reminders", "Clients & documents"].map((v) => (
          <div key={v} className="card"><h3 className="font-semibold">{v}</h3><p className="text-sm text-muted mt-1">Truthful product capability.</p></div>
        ))}
      </section>
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-heading font-bold text-center mb-8">Features</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {["Daily cause list","Hearing history","10-day reminders","Clients & documents","Decided cases archive","Urdu & English RTL"].map((f) => (
            <div key={f} className="card hover:shadow-md transition-shadow"><h3 className="font-semibold">{f}</h3></div>
          ))}
        </div>
      </section>
      <section className="bg-navy text-white py-16 px-6 text-center">
        <h2 className="text-2xl font-heading font-bold">Ready to start?</h2>
        <div className="mt-6 flex gap-3 justify-center">
          <Link href="/register" className="btn-primary">Sign up</Link>
          <a href={whatsappLink()} className="btn-secondary">WhatsApp</a>
        </div>
      </section>
    </MarketingShell>
  );
}
