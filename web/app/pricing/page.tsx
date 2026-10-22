"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Check, Sparkles, ShieldCheck, ArrowRight } from "lucide-react";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { PlanCard, type PlanView } from "@/components/marketing/PlanCard";
import { saasDb } from "@/lib/supabase/saas";

export default function PricingPage() {
  const { t } = useTranslation();
  const [plans, setPlans] = useState<PlanView[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState("");
  useEffect(() => {
    let mounted = true;
    saasDb
      .plans()
      .select("*")
      .eq("is_active", true)
      .order("sort_order")
      .then(({ data }) => {
        if (mounted) {
          const rows = (data as unknown as PlanView[]) ?? [];
          setPlans(rows);
          setSelected(rows.find((p) => p.duration_months >= 12)?.id ?? rows[0]?.id ?? "");
          setLoading(false);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

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

  const activePlan = useMemo(
    () => plans.find((p) => p.id === selected),
    [plans, selected]
  );

  const perks = [
    t("marketing.f1Title"),
    t("marketing.f2Title"),
    t("marketing.f3Title"),
    t("marketing.f4Title"),
    t("marketing.f5Title"),
    t("marketing.f6Title"),
  ];

  return (
    <MarketingShell>
      <section className="relative overflow-hidden bg-mesh-surface px-4 py-16 sm:px-6 md:py-24">
        <div className="pointer-events-none absolute -top-24 start-1/2 h-80 w-[42rem] -translate-x-1/2 rounded-full bg-gold-400/10 blur-3xl" aria-hidden="true" />

        <div className="relative mx-auto max-w-2xl text-center">
          <span className="pill-badge border border-gold-300/60 bg-gold-50 text-gold-800">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            {t("marketing.pricingEyebrow")}
          </span>
          <h1 className="mt-5 font-heading text-3xl font-bold text-navy md:text-5xl">
            {t("pricing.title")}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted">
            {t("pricing.subtitle")}
          </p>
        </div>

        <div
          className="relative mx-auto mt-12 grid max-w-5xl gap-8 md:grid-cols-3"
          role="radiogroup"
          aria-label={t("pricing.title")}
        >
          {loading
            ? [1, 2, 3].map((i) => (
                <div key={i} className="h-80 animate-pulse rounded-2xl bg-white/60" />
              ))
            : plans.map((p) => (
                <PlanCard
                  key={p.id}
                  plan={p}
                  selected={p.id === selected}
                  popular={p.id === popularPlanId}
                  baselineMonthly={baselineMonthly}
                  onSelect={(next) => setSelected(next.id)}
                  showCta={false}
                />
              ))}
        </div>

        {/* Selection summary + CTA */}
        {activePlan && (
          <div className="relative mx-auto mt-10 max-w-5xl">
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
                className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gold-cta px-6 text-sm font-semibold text-navy-900 shadow-gold transition-all duration-200 ease-in-out hover:shadow-glow-gold active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 sm:w-auto"
              >
                {t("marketing.choosePlan")}
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
              </Link>
            </div>
          </div>
        )}

        {/* Included features */}
        <div className="relative mx-auto mt-12 max-w-5xl">
          <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-md sm:p-8">
            <h2 className="text-center font-heading text-lg font-bold text-navy">
              {t("pricing.featuresIncluded")}
            </h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {perks.map((p) => (
                <li key={p} className="flex items-center gap-2.5 text-sm text-navy/80">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gold-100 text-gold-700">
                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
            <p className="mt-6 flex items-center justify-center gap-2 border-t border-slate-200/80 pt-5 text-xs text-muted">
              <ShieldCheck className="h-4 w-4 text-gold" aria-hidden="true" />
              {t("marketing.pricingNote")}
            </p>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
