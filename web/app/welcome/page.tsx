"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { SITE, whatsappLink } from "@/lib/siteConfig";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase/client";
import { useState } from "react";

export default function WelcomePage() {
  const { user, loading, configured } = useAuth();
  const router = useRouter();
  const [plans, setPlans] = useState<any[]>([]);
  useEffect(() => {
    if (!configured || loading) return;
    if (user) router.replace("/");
    (supabase as any).from("plans").select("*").eq("is_active", true).order("sort_order").then(({ data }: any) => setPlans(data ?? []));
  }, [user, loading, configured, router]);

  const jsonLd = { "@context": "https://schema.org", "@type": "Organization", "name": "MZM Case Management" };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <MarketingShell>
        <section className="relative overflow-hidden bg-navy-header text-white py-20 px-6">
          <div className="absolute inset-0 opacity-10">
            <svg viewBox="0 0 800 400" className="w-full h-full">
              <line x1="0" y1="200" x2="800" y2="200" stroke="white" strokeWidth="1" />
              <circle cx="400" cy="200" r="80" stroke="white" strokeWidth="1" fill="none" />
            </svg>
          </div>
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-10 items-center relative">
            <div>
              <h1 className="text-4xl md:text-5xl font-heading font-bold leading-tight">{SITE.tagline}</h1>
              <p className="mt-4 text-white/80 text-lg">Cause lists, reminders, clients and documents — in English and Urdu.</p>
              <div className="mt-8 flex gap-3">
                <Link href="/register" className="btn-primary">Start free trial</Link>
                <Link href="/pricing" className="btn-secondary">View pricing</Link>
              </div>
              <p className="mt-4 text-sm text-white/60">Built for Pakistani law firms · English & Urdu</p>
            </div>
            <div className="relative animate-float">
              <Image src="/logo/logoadv.jpeg" alt="logo" width={220} height={220} className="rounded-2xl shadow-lg" priority />
              <div className="absolute -top-4 -end-4 bg-white text-navy text-xs font-semibold px-3 py-2 rounded-lg shadow-md">Hearing today · 10:00</div>
              <div className="absolute -bottom-4 -start-4 bg-gold text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-md">Reminder in 10 days</div>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-6">
          {["Cause list clarity", "Never miss a hearing", "Clients & documents"].map((v) => (
            <div key={v} className="card text-center"><p className="font-semibold">{v}</p></div>
          ))}
        </section>

        <section className="max-w-7xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-heading font-bold text-center mb-8">Features</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {["Daily cause list","Hearing history & previous dates","10-day reminders + push","Clients & documents","Decided cases archive","Urdu & English RTL"].map((f) => (
              <div key={f} className="card hover:shadow-md transition-shadow"><h3 className="font-semibold">{f}</h3><p className="text-sm text-muted mt-1">Truthful product capability.</p></div>
            ))}
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-heading font-bold text-center mb-8">How it works</h2>
          <div className="grid md:grid-cols-4 gap-6 text-center">
            {["Register","Choose plan","Add your team","Track cases"].map((s, i) => (
              <div key={s} className="card"><div className="text-gold-700 font-bold text-xl">{i+1}</div><p className="mt-2 font-semibold">{s}</p></div>
            ))}
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-heading font-bold text-center mb-8">App showcase</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {["/marketing/cause-list.webp","/marketing/reminders.webp","/marketing/case-view.webp"].map((src) => (
              <div key={src} className="card p-2"><Image src={src} alt="app screenshot" width={400} height={300} className="w-full rounded-lg" loading="lazy" /></div>
            ))}
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-heading font-bold text-center mb-8">Pricing</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((p) => (
              <div key={p.id} className="card text-center">
                <h3 className="text-xl font-semibold">{p.name}</h3>
                <p className="text-2xl font-bold mt-2">Rs {p.price_pkr}</p>
                <p className="text-sm text-muted">{p.duration_months} month(s) · {p.max_users} users</p>
                <Link href={`/register?plan=${p.code}`} className="btn-primary mt-4 inline-block">Choose plan</Link>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-muted mt-4">Prepaid plans · pay via bank transfer, JazzCash or Easypaisa</p>
        </section>

        <section className="max-w-7xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-heading font-bold text-center mb-8">Security & trust</h2>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="card"><h3 className="font-semibold">Owner-only team access</h3></div>
            <div className="card"><h3 className="font-semibold">Firm data isolation</h3></div>
            <div className="card"><h3 className="font-semibold">Device limit (2 active)</h3></div>
          </div>
        </section>

        <section className="max-w-3xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-heading font-bold text-center mb-8">FAQ</h2>
          <div className="space-y-4">
            {[
              { q: "What payment methods are supported?", a: "Bank transfer, JazzCash, Easypaisa and other manual methods." },
              { q: "Is there a free trial?", a: "Yes, 7 days by default." },
              { q: "Does it support Urdu?", a: "Yes, full Urdu/RTL support." },
              { q: "How does team access work?", a: "Only the owner can add or remove members." },
              { q: "Is my data safe?", a: "Firm data is isolated per firm with row-level security." },
              { q: "How do renewals work?", a: "Plans are prepaid; renew before expiry." },
            ].map((f) => (
              <details key={f.q} className="card">
                <summary className="font-semibold cursor-pointer">{f.q}</summary>
                <p className="text-sm text-muted mt-2">{f.a}</p>
              </details>
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
    </>
  );
}

