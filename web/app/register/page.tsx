"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Scale, ShieldCheck, Sparkles, Check, Mail, Lock, User, Building2, Phone, ArrowRight, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { saasRpc } from "@/lib/supabase/saas";
import { Button } from "@/components/ui/Button";
import { FloatingField } from "@/components/billing/FloatingField";
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
  const [touched, setTouched] = useState(false);

  const emailValid    = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const passwordValid = password.length >= 8;
  const firmValid     = firmName.trim().length >= 2;
  const nameValid     = fullName.trim().length >= 2;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    setLoading(true);
    setError("");

    const { data, error: signUpErr } = await supabase.auth.signUp({ email, password });
    if (signUpErr) {
      setError(signUpErr.message);
      setLoading(false);
      return;
    }
    let session = data.session;
    const userId = data.user?.id;
    if (!userId) {
      setError(t("marketing.regCheckEmail"));
      setLoading(false);
      return;
    }
    // Ensure an authenticated session exists before calling register_firm (RPC requires auth.uid())
    if (!session) {
      const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
      if (signInErr || !signInData.session) {
        setError(t("marketing.regCheckEmail"));
        setLoading(false);
        return;
      }
      session = signInData.session;
    }
    const { error: rpcErr } = await saasRpc.registerFirm(firmName, fullName, phone);
    if (rpcErr) {
      setError(rpcErr.message);
      setLoading(false);
      return;
    }
    router.replace(plan ? `/billing?plan=${encodeURIComponent(plan)}` : "/");
  }

  const benefits = [
    t("marketing.regBenefit1"),
    t("marketing.regBenefit2"),
    t("marketing.regBenefit3"),
  ];

  return (
    <div className="relative min-h-dvh overflow-hidden bg-mesh-surface px-4 py-10 sm:px-6 md:py-16">
      <div className="mx-auto w-full max-w-5xl">
        <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xl backdrop-blur-md lg:grid lg:grid-cols-[1.05fr_1fr]">

          {/* Brand panel */}
          <aside className="relative overflow-hidden bg-mesh-dark px-7 py-10 text-white sm:px-10 lg:py-14">
            <div className="pointer-events-none absolute -top-16 -start-16 h-56 w-56 rounded-full bg-gold-400/15 blur-3xl" aria-hidden="true" />
            <div className="relative">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-gold-cta shadow-gold">
                  <Scale className="h-5 w-5 text-navy-900" aria-hidden="true" />
                </span>
                <span className="flex flex-col leading-none">
                  <span className="font-heading text-lg font-bold text-white">MZM</span>
                  <span className="text-[10px] uppercase tracking-[0.18em] text-gold-300">&amp; Associates</span>
                </span>
              </div>

              <span className="pill-badge mt-8 border border-gold-400/30 bg-white/[0.06] text-gold-100 backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5 text-gold-300" aria-hidden="true" />
                {t("marketing.regTrialBadge")}
              </span>

              <h1 className="mt-5 font-heading text-3xl font-bold leading-tight text-white">
                {t("marketing.regTitle")}
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-white/65">
                {t("marketing.regSubtitle")}
              </p>

              <ul className="mt-8 space-y-3.5">
                {benefits.map((b) => (
                  <li key={b} className="flex items-start gap-3 text-sm text-white/80">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-gold-cta text-navy-900">
                      <Check className="h-3 w-3" aria-hidden="true" />
                    </span>
                    {b}
                  </li>
                ))}
              </ul>

              <p className="mt-10 flex items-center gap-2 border-t border-white/10 pt-6 text-xs text-white/50">
                <ShieldCheck className="h-4 w-4 text-gold-300" aria-hidden="true" />
                {t("marketing.regSecureNote")}
              </p>
            </div>
          </aside>

          {/* Form panel */}
          <div className="px-6 py-10 sm:px-10 lg:py-14">
            {plan && (
              <p className="mb-6 inline-flex items-center gap-2 rounded-xl border border-gold-300/60 bg-gold-50 px-3.5 py-2 text-xs font-semibold text-gold-800">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                {t("marketing.regPlan", { plan })}
              </p>
            )}

            {error && (
              <p
                role="alert"
                className="mb-5 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-xs font-medium text-rose-700"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                {error}
              </p>
            )}

            <form onSubmit={submit} className="space-y-4" noValidate>
              <FloatingField
                label={t("marketing.regFirmName")}
                value={firmName}
                onChange={(e) => setFirmName(e.target.value)}
                required
                autoComplete="organization"
                leftIcon={<Building2 className="h-4 w-4" />}
                valid={firmValid}
                error={touched && !firmValid ? t("marketing.regFirmNameRequired") : undefined}
              />
              <FloatingField
                label={t("marketing.regFullName")}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                autoComplete="name"
                leftIcon={<User className="h-4 w-4" />}
                valid={nameValid}
                error={touched && !nameValid ? t("marketing.regFullNameRequired") : undefined}
              />
              <FloatingField
                label={t("auth.email")}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                leftIcon={<Mail className="h-4 w-4" />}
                valid={emailValid}
                error={touched && !emailValid ? t("marketing.regEmailRequired") : undefined}
              />
              <FloatingField
                label={t("auth.password")}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                leftIcon={<Lock className="h-4 w-4" />}
                valid={passwordValid}
                error={touched && !passwordValid ? t("marketing.regPasswordRequired") : undefined}
                hint={t("marketing.regPasswordHint")}
              />
              <FloatingField
                label={t("auth.phone")}
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
                leftIcon={<Phone className="h-4 w-4" />}
                valid={phone.trim().length >= 10}
              />

              <Button
                type="submit"
                loading={loading}
                fullWidth
                className="h-12"
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                {t("marketing.regTitle")}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted">
              {t("marketing.regHaveAccount")}{" "}
              <Link href="/auth/sign-in" className="font-semibold text-gold-700 underline-offset-4 transition-colors hover:text-gold-500 hover:underline">
                {t("marketing.signIn")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <MarketingShell>
      <Suspense fallback={<div className="min-h-dvh bg-offwhite" />}>
        <RegisterForm />
      </Suspense>
    </MarketingShell>
  );
}
