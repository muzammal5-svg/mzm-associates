"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { MarketingShell } from "@/components/marketing/MarketingShell";

function RegisterForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useSearchParams();
  const plan = params.get("plan") ?? "";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firmName, setFirmName] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { data, error: signUpErr } = await supabase.auth.signUp({ email, password });
    if (signUpErr) { setError(signUpErr.message); setLoading(false); return; }
    const userId = data.user?.id;
    if (!userId) { setError(t("marketing.regCheckEmail")); setLoading(false); return; }
    const { error: rpcErr } = await (supabase as any).rpc("register_firm", { p_firm_name: firmName, p_full_name: fullName, p_phone: phone });
    if (rpcErr) { setError(rpcErr.message); setLoading(false); return; }
    // Carry the chosen plan through to billing so the owner can submit the
    // payment for it (UI preselect only — no billing logic here).
    router.replace(plan ? `/billing?plan=${encodeURIComponent(plan)}` : "/");
  }

  return (
    <main className="min-h-dvh bg-offwhite flex items-center justify-center px-4">
      <form onSubmit={submit} className="card w-full max-w-md space-y-4">
        <h1 className="text-2xl font-heading font-bold">{t("marketing.regTitle")}</h1>
        {plan && <p className="text-sm text-muted">{t("marketing.regPlan", { plan })}</p>}
        {error && <p className="text-danger text-sm">{error}</p>}
        <Input label={t("auth.email")} type="email" value={email} onChange={(e: any) => setEmail(e.target.value)} required />
        <Input label={t("auth.password")} type="password" value={password} onChange={(e: any) => setPassword(e.target.value)} required />
        <Input label={t("marketing.regFirmName")} value={firmName} onChange={(e: any) => setFirmName(e.target.value)} required />
        <Input label={t("marketing.regFullName")} value={fullName} onChange={(e: any) => setFullName(e.target.value)} required />
        <Input label={t("auth.phone")} type="tel" value={phone} onChange={(e: any) => setPhone(e.target.value)} />
        <Button type="submit" loading={loading} className="w-full">{t("marketing.regTitle")}</Button>
        <p className="text-sm text-muted">
          {t("marketing.regHaveAccount")}{" "}
          <Link href="/auth/sign-in" className="text-gold">{t("marketing.signIn")}</Link>
        </p>
      </form>
    </main>
  );
}

export default function RegisterPage() {
  // useSearchParams must sit behind Suspense for static export prerendering.
  return (
    <MarketingShell>
      <Suspense fallback={<div className="min-h-dvh bg-offwhite" />}>
        <RegisterForm />
      </Suspense>
    </MarketingShell>
  );
}
