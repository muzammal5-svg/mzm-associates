"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import Link from "next/link";

export default function PricingPage() {
  const [plans, setPlans] = useState<any[]>([]);
  useEffect(() => {
    (supabase as any).from("plans").select("*").eq("is_active", true).order("sort_order").then(({ data }: any) => setPlans(data ?? []));
  }, []);
  return (
    <MarketingShell>
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-heading font-bold text-center">Pricing</h1>
        <p className="text-center text-muted mt-2">Prepaid plans · pay via bank transfer, JazzCash or Easypaisa</p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {plans.map((p) => (
            <div key={p.id} className="card text-center">
              <h2 className="text-xl font-semibold">{p.name}</h2>
              <p className="text-2xl font-bold mt-2">Rs {p.price_pkr}</p>
              <p className="text-sm text-muted">{p.duration_months} month(s) · {p.max_users} users</p>
              <Link href={`/register?plan=${p.code}`} className="btn-primary mt-4 inline-block">Choose plan</Link>
            </div>
          ))}
        </div>
      </section>
    </MarketingShell>
  );
}
