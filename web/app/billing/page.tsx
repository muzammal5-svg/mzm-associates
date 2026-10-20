"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useSubscriptionAccess } from "@/hooks/useSubscriptionAccess";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

function BillingView() {
  const { state, status, loading } = useSubscriptionAccess();
  const params = useSearchParams();
  const preselectCode = params.get("plan") ?? "";
  const [plans, setPlans] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [planId, setPlanId] = useState("");
  const [method, setMethod] = useState("bank_transfer");
  const [ref, setRef] = useState("");
  const [amount, setAmount] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (supabase as any).from("plans").select("*").eq("is_active", true).then(({ data }: any) => setPlans(data ?? []));
    (supabase as any).from("payment_accounts").select("*").eq("is_active", true).then(({ data }: any) => setAccounts(data ?? []));
  }, []);

  // UI-only: preselect the plan carried over from /register?plan= or /pricing.
  useEffect(() => {
    if (!preselectCode || !plans.length || planId) return;
    const match = plans.find((p) => p.code === preselectCode);
    if (match) setPlanId(match.id);
  }, [preselectCode, plans, planId]);

  useEffect(() => {
    (supabase as any).from("payments").select("*").order("created_at", { ascending: false }).then(({ data }: any) => setPayments(data ?? []));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    let slipPath: string | null = null;
    if (file) {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await (supabase as any).from("profiles").select("firm_id").eq("id", user?.id).single();
      const path = `${profile.firm_id}/${Date.now()}-${file.name}`;
      const { error: upErr } = await supabase.storage.from("payment-slips").upload(path, file);
      if (upErr) { setMsg(upErr.message); return; }
      slipPath = path;
    }
    const { error } = await (supabase as any).rpc("submit_payment", {
      p_plan_id: planId,
      p_method: method,
      p_reference_no: ref,
      p_slip_path: slipPath,
      p_amount: Number(amount),
    });
    if (error) setMsg(error.message);
    else { setMsg("Submitted"); setRef(""); setAmount(""); setFile(null); }
  }

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
      {locked && <div className="card mt-4 bg-danger/10"><p className="font-semibold">Subscription locked</p><p className="text-sm text-muted">Renew to access the app.</p></div>}

      <form onSubmit={submit} className="card mt-6 space-y-3">
        <h2 className="font-semibold">Submit payment</h2>
        <select className="input" value={planId} onChange={(e) => setPlanId(e.target.value)}>
          <option value="">Select plan</option>
          {plans.map((p) => <option key={p.id} value={p.id}>{p.name} - Rs {p.price_pkr}</option>)}
        </select>
        <select className="input" value={method} onChange={(e) => setMethod(e.target.value)}>
          {accounts.map((a) => <option key={a.id} value={a.method}>{a.method}</option>)}
        </select>
        <div className="space-y-1">
          {accounts.filter((a) => a.method === method).map((a) => (
            <div key={a.id} className="text-sm text-muted">{a.account_title} - {a.account_number} ({a.bank_name}) {a.instructions}</div>
          ))}
        </div>
        <Input label="Transaction ID" value={ref} onChange={(e:any)=>setRef(e.target.value)} required />
        <Input label="Amount" type="number" value={amount} onChange={(e:any)=>setAmount(e.target.value)} required />
        <input type="file" accept="image/*,application/pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        {msg && <p className="text-sm text-danger">{msg}</p>}
        <Button type="submit" className="w-full">Submit payment</Button>
      </form>

      <div className="card mt-6">
        <h2 className="font-semibold">Payment history</h2>
        <table className="w-full text-sm mt-2">
          <thead><tr><th>Plan</th><th>Amount</th><th>Status</th><th>Note</th></tr></thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id}><td>{p.plan_id}</td><td>{p.amount_pkr}</td><td>{p.status}</td><td>{p.note}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

export default function BillingPage() {
  // useSearchParams must sit behind Suspense for static export prerendering.
  return (
    <Suspense fallback={<div className="min-h-dvh bg-offwhite" />}>
      <BillingView />
    </Suspense>
  );
}
