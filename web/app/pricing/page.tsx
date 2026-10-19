"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";

export default function PricingPage() {
  const [plans, setPlans] = useState<any[]>([]);
  useEffect(() => {
    (supabase as any).from("plans").select("*").eq("is_active", true).order("sort_order").then(({ data }: any) => setPlans(data ?? []));
  }, []);
  return (
    <main className="min-h-dvh bg-offwhite px-6 py-12">
      <h1 className="text-3xl font-heading font-bold text-center">Pricing</h1>
      <div className="mt-8 grid gap-4 md:grid-cols-3 max-w-4xl mx-auto">
        {plans.map((p) => (
          <div key={p.id} className="card text-center">
            <h2 className="text-xl font-semibold">{p.name}</h2>
            <p className="text-2xl font-bold mt-2">Rs {p.price_pkr}</p>
            <p className="text-sm text-muted">{p.duration_months} month(s) · {p.max_users} users</p>
            <Link href="/register" className="btn-primary mt-4 inline-block">Choose</Link>
          </div>
        ))}
      </div>
    </main>
  );
}


