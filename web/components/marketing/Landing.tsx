"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import {
  Sparkles, ArrowRight, ShieldCheck, Zap, Star, Quote, Check,
} from "lucide-react";
import { PublicHeader } from "@/components/marketing/PublicHeader";
import { PublicFooter } from "@/components/marketing/PublicFooter";
import { HeroDashboard } from "@/components/marketing/HeroDashboard";
import { PlanCard, type PlanView } from "@/components/marketing/PlanCard";
import { Reveal } from "@/components/marketing/Reveal";
import { SITE, whatsappLink } from "@/lib/siteConfig";
import { REVIEWS } from "@/lib/reviews";
import { saasDb } from "@/lib/supabase/saas";

const CONTAINER = "max-w-[1200px] mx-auto px-4 md:px-6";
const SECTION   = "py-[72px] md:py-[112px]";

export function Landing() {
  const { t } = useTranslation();
  const [plans, setPlans] = useState<PlanView[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>("");

  useEffect(() => {
    let mounted = true;
    saasDb
      .plans()
      .select("id, code, name, price_pkr, duration_months, max_users")
      .eq("is_active", true)
      .order("sort_order")
      .then((result) => {
        if (!mounted) return;
        const rows = (result.data as unknown as PlanView[]) ?? [];
        setPlans(rows);
        const yearly = rows.find((p) => p.duration_months >= 12) ?? rows[0];
        if (yearly) setSelectedPlan(yearly.id);
      });
    return () => { mounted = false; };
  }, []);

  /** Cheapest per-month price — the baseline used for "Save X%" badges. */
  const baselineMonthly = useMemo(() => {
    if (plans.length === 0) return 0;
    return Math.min(
      ...plans.map((p) => Math.round(Number(p.price_pkr) / Math.max(1, p.duration_months)))
    );
  }, [plans]);

  const popularPlanId = useMemo(
    () => plans.find((p) => p.duration_months >= 12)?.id ?? plans[0]?.id ?? "",
    [plans]
  );

  const activePlan = plans.find((p) => p.id === selectedPlan) ?? plans[0];

  const trustBar = [
    t("marketing.trust1"), t("marketing.trust2"),
    t("marketing.trust3"), t("marketing.trust4"),
  ];

  const problems = [
    { problem: t("marketing.ps1Problem"), solution: t("marketing.ps1Solution") },
    { problem: t("marketing.ps2Problem"), solution: t("marketing.ps2Solution") },
    { problem: t("marketing.ps3Problem"), solution: t("marketing.ps3Solution") },
  ];

  const features = [
    { title: t("marketing.f1Title"), body: t("marketing.f1Body") },
    { title: t("marketing.f2Title"), body: t("marketing.f2Body") },
    { title: t("marketing.f3Title"), body: t("marketing.f3Body") },
    { title: t("marketing.f4Title"), body: t("marketing.f4Body") },
    { title: t("marketing.f5Title"), body: t("marketing.f5Body") },
    { title: t("marketing.f6Title"), body: t("marketing.f6Body") },
  ];

  const steps = [
    { title: t("marketing.s1Title"), body: t("marketing.s1Body") },
    { title: t("marketing.s2Title"), body: t("marketing.s2Body") },
    { title: t("marketing.s3Title"), body: t("marketing.s3Body") },
    { title: t("marketing.s4Title"), body: t("marketing.s4Body") },
  ];

  const security = [
    { title: t("marketing.sec1Title"), body: t("marketing.sec1Body") },
    { title: t("marketing.sec2Title"), body: t("marketing.sec2Body") },
    { title: t("marketing.sec3Title"), body: t("marketing.sec3Body") },
  ];

  const faqs = [
    { q: t("marketing.faq1Q"), a: t("marketing.faq1A") },
    { q: t("marketing.faq2Q"), a: t("marketing.faq2A") },
    { q: t("marketing.faq3Q"), a: t("marketing.faq3A") },
    { q: t("marketing.faq4Q"), a: t("marketing.faq4A") },
    { q: t("marketing.faq5Q"), a: t("marketing.faq5A") },
    { q: t("marketing.faq6Q"), a: t("marketing.faq6A") },
  ];

  return (
    <div className="min-h-dvh bg-mesh-surface">
      <PublicHeader overDark />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-mesh-dark text-white">
        <div
          className="pointer-events-none absolute -top-24 start-1/2 h-[26rem] w-[46rem] -translate-x-1/2 rounded-full bg-gold-400/10 blur-3xl"
          aria-hidden="true"
        />
        <div className={`${CONTAINER} relative grid items-center gap-14 py-16 md:grid-cols-2 md:gap-10 md:py-24`}>
          {/* Copy */}
          <div className="text-center md:text-start">
            {/* Animated gradient pill */}
            <span className="pill-badge border border-gold-400/30 bg-gradient-to-r from-white/[0.06] via-gold-400/20 to-white/[0.06] bg-[length:200%_100%] text-gold-100 backdrop-blur-md animate-gradient-pan">
              <span className="pulse-dot text-gold-300" aria-hidden="true" />
              <Sparkles className="h-3.5 w-3.5 text-gold-300" aria-hidden="true" />
              {t("marketing.heroPill")}
            </span>

            <h1 className="mt-6 font-heading text-[34px] font-bold leading-[1.12] tracking-tight text-white md:text-[52px]">
              <span className="block text-white">{t("marketing.heroTitleLine1")}</span>
              <span className="block text-gold-gradient">{t("marketing.heroTitleLine2")}</span>
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/70 md:mx-0 md:text-lg">
              {t("marketing.heroSubtitle")}
            </p>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-3 md:justify-start">
              <Link
                href="/register"
                className="group inline-flex h-[52px] items-center gap-2 rounded-xl bg-gold-cta px-7 text-sm font-semibold text-navy-900 shadow-gold transition-all duration-200 ease-in-out hover:shadow-glow-gold active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900"
              >
                {t("marketing.heroCta")}
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex h-[52px] items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-7 text-sm font-semibold text-white backdrop-blur-md transition-all duration-200 ease-in-out hover:border-gold-400/60 hover:bg-white/10 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
              >
                {t("marketing.heroCta2")}
              </Link>
            </div>

            <p className="mt-5 flex items-center justify-center gap-2 text-xs text-white/50 md:justify-start">
              <ShieldCheck className="h-4 w-4 text-gold-300" aria-hidden="true" />
              {t("marketing.heroTrust")}
            </p>
          </div>

          {/* Live dashboard mockup */}
          <div className="relative">
            <HeroDashboard />
          </div>
        </div>
      </section>

      {/* ── Trust bar ───────────────────────────────────────────────────── */}
      <section className="border-y border-slate-200/80 bg-white/70 backdrop-blur-md">
        <div className={`${CONTAINER} grid grid-cols-2 gap-4 py-6 text-center md:grid-cols-4`}>
          {trustBar.map((item) => (
            <p key={item} className="flex items-center justify-center gap-2 text-sm font-medium text-navy-600">
              <Check className="h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
              {item}
            </p>
          ))}
        </div>
      </section>

      {/* ── Problem → solution ──────────────────────────────────────────── */}
      <section className={CONTAINER + " " + SECTION}>
        <h2 className="text-center font-heading text-3xl font-bold text-navy">{t("marketing.psTitle")}</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {problems.map((p) => (
            <Reveal key={p.problem} className="glass-card h-full p-6">
              <p className="text-sm text-muted">{p.problem}</p>
              <div className="my-4 h-px bg-slate-200/80" aria-hidden="true" />
              <p className="font-semibold text-navy">{p.solution}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────────── */}
      <section className="bg-white/70 backdrop-blur-md">
        <div className={CONTAINER + " " + SECTION}>
          <h2 className="text-center font-heading text-3xl font-bold text-navy">{t("marketing.featTitle")}</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {features.map((f) => (
              <Reveal key={f.title} className="glass-card h-full p-6">
                <span className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-gold-100 text-gold-700" aria-hidden="true">
                  <Zap className="h-5 w-5" />
                </span>
                <h3 className="font-heading text-lg font-bold text-navy">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{f.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Alternating showcase rows ─────────────────────────────────── */}
      <section className={CONTAINER + " " + SECTION}>
        <div className="grid items-center gap-12 md:grid-cols-2">
          <Reveal>
            <span className="pill-badge border border-gold-300/60 bg-gold-50 text-gold-800">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              {t("marketing.row1Title")}
            </span>
            <h3 className="mt-4 font-heading text-2xl font-bold text-navy md:text-3xl">
              {t("marketing.row1Title")}
            </h3>
            <p className="mt-3 leading-relaxed text-muted">{t("marketing.row1Body")}</p>
          </Reveal>
          <Reveal className="glass-card overflow-hidden p-2">
            <Image
              src="/marketing/reminders.webp"
              alt={t("marketing.row1Title")}
              width={640}
              height={480}
              className="w-full rounded-xl"
              loading="lazy"
            />
          </Reveal>
        </div>

        <div className="mt-16 grid items-center gap-12 md:grid-cols-2">
          <Reveal className="glass-card order-last overflow-hidden p-2 md:order-first">
            <Image
              src="/marketing/case-view.webp"
              alt={t("marketing.row2Title")}
              width={640}
              height={480}
              className="w-full rounded-xl"
              loading="lazy"
            />
          </Reveal>
          <Reveal>
            <span className="pill-badge border border-gold-300/60 bg-gold-50 text-gold-800">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              {t("marketing.row2Title")}
            </span>
            <h3 className="mt-4 font-heading text-2xl font-bold text-navy md:text-3xl">
              {t("marketing.row2Title")}
            </h3>
            <p className="mt-3 leading-relaxed text-muted">{t("marketing.row2Body")}</p>
          </Reveal>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className={CONTAINER + " " + SECTION}>
        <h2 className="text-center font-heading text-3xl font-bold text-navy">{t("marketing.howTitle")}</h2>
        <div className="mt-10 grid gap-6 text-center md:grid-cols-4">
          {steps.map((s, i) => (
            <Reveal key={s.title} className="glass-card h-full p-6">
              <span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-navy-800 font-heading text-lg font-bold text-gold-300 shadow-md">
                {i + 1}
              </span>
              <p className="mt-4 font-heading text-base font-bold text-navy">{s.title}</p>
              <p className="mt-2 text-sm text-muted">{s.body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Pricing (interactive) ────────────────────────────────────────── */}
      <section className="bg-white/70 backdrop-blur-md">
        <div className={CONTAINER + " " + SECTION}>
          <div className="text-center">
            <span className="pill-badge border border-gold-300/60 bg-gold-50 text-gold-800">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              {t("marketing.pricingEyebrow")}
            </span>
            <h2 className="mt-4 font-heading text-3xl font-bold text-navy md:text-4xl">
              {t("marketing.pricingTitle")}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted">{t("marketing.pricingNote")}</p>
          </div>

          <div
            className="mx-auto mt-12 grid max-w-5xl gap-8 md:grid-cols-3"
            role="radiogroup"
            aria-label={t("marketing.pricingTitle")}
          >
            {plans.map((p) => (
              <PlanCard
                key={p.id}
                plan={p}
                selected={p.id === selectedPlan}
                popular={p.id === popularPlanId}
                baselineMonthly={baselineMonthly}
                onSelect={(next) => setSelectedPlan(next.id)}
                showCta={false}
              />
            ))}
          </div>

          {/* Selection summary */}
          {activePlan && (
            <div className="mx-auto mt-10 max-w-5xl">
              <div className="flex flex-col items-center gap-4 rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-sm backdrop-blur-md sm:flex-row sm:justify-between">
                <div className="text-center sm:text-start">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                    {t("marketing.pricingSelected")}
                  </p>
                  <p className="mt-1 font-heading text-lg font-bold text-navy">
                    {activePlan.name} ·{" "}
                    <span className="text-gold-700">Rs {Number(activePlan.price_pkr).toLocaleString()}</span>
                  </p>
                </div>
                <Link
                  href={`/register?plan=${activePlan.code}`}
                  className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-navy-800 px-6 text-sm font-semibold text-white shadow-md transition-all duration-200 ease-in-out hover:bg-navy-700 hover:shadow-lg active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 sm:w-auto"
                >
                  {t("marketing.choosePlan")}
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Security & trust ─────────────────────────────────────────────── */}
      <section className={CONTAINER + " " + SECTION}>
        <h2 className="text-center font-heading text-3xl font-bold text-navy">{t("marketing.secTitle")}</h2>
        <div className="mt-10 grid gap-6 text-center md:grid-cols-3">
          {security.map((s) => (
            <Reveal key={s.title} className="glass-card h-full p-6">
              <span className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-navy-800 text-gold-300 shadow-md" aria-hidden="true">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-heading text-base font-bold text-navy">{s.title}</h3>
              <p className="mt-2 text-sm text-muted">{s.body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="bg-white/70 backdrop-blur-md">
        <div className={`${CONTAINER} ${SECTION}`}>
          <h2 className="text-center font-heading text-3xl font-bold text-navy">{t("marketing.faqTitle")}</h2>
          <div className="mx-auto mt-10 max-w-3xl space-y-3">
            {faqs.map((f) => (
              <details key={f.q} className="glass-card group px-5 py-4">
                <summary className="flex cursor-pointer items-center justify-between gap-3 font-semibold text-navy marker:hidden">
                  {f.q}
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-navy-50 text-navy-500 transition-transform duration-300 group-open:rotate-45" aria-hidden="true">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Reviews ──────────────────────────────────────────────────────── */}
      {SITE.SHOW_REVIEWS && (
        <section className={CONTAINER + " " + SECTION}>
          <h2 className="text-center font-heading text-3xl font-bold text-navy">{t("marketing.reviewsTitle")}</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {REVIEWS.map((r) => (
              <Reveal key={r.name} className="glass-card h-full p-6">
                <Quote className="h-6 w-6 text-gold-300" aria-hidden="true" />
                <p className="mt-3 text-gold" aria-label={`${r.stars}/5`}>{"★".repeat(r.stars)}{"☆".repeat(5 - r.stars)}</p>
                <p className="mt-2 text-navy">&ldquo;{r.quote}&rdquo;</p>
                <p className="mt-3 text-sm font-semibold text-navy">{r.name} — {r.role}, {r.firm}</p>
                {r.sample && <p className="mt-1 text-xs text-muted">{t("marketing.reviewSampleBadge")}</p>}
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* ── Final CTA ────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-mesh-dark px-6 py-[72px] text-center text-white md:py-[112px]">
        <div className="relative mx-auto max-w-2xl">
          <h2 className="font-heading text-3xl font-bold text-white md:text-4xl">{t("marketing.ctaTitle")}</h2>
          <p className="mt-4 text-sm text-white/60">{t("marketing.ctaSubtitle")}</p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link
              href="/register"
              className="group inline-flex h-[52px] items-center gap-2 rounded-xl bg-gold-cta px-7 text-sm font-semibold text-navy-900 shadow-gold transition-all duration-200 ease-in-out hover:shadow-glow-gold active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
            >
              {t("marketing.signUp")}
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
            </Link>
            <a
              href={whatsappLink()}
              className="inline-flex h-[52px] items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-7 text-sm font-semibold text-white backdrop-blur-md transition-all duration-200 hover:border-gold-400/60 hover:bg-white/10 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
            >
              <Star className="h-4 w-4 text-gold-300" aria-hidden="true" />
              {t("marketing.footerWhatsapp")}
            </a>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
