"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Check, ArrowRight } from "lucide-react";
import { PublicHeader } from "@/components/marketing/PublicHeader";
import { PublicFooter } from "@/components/marketing/PublicFooter";
import { Reveal } from "@/components/marketing/Reveal";
import { saasDb } from "@/lib/supabase/saas";

const CONTAINER = "max-w-[1200px] mx-auto px-4 md:px-6";
const SECTION = "py-[80px] md:py-[120px]";

interface PlanView {
  id: string;
  code: string;
  name: string;
  price_pkr: string | number;
  duration_months: number;
  max_users: number;
  description?: string;
  is_active: boolean;
  sort_order: number;
}

export default function PricingPage() {
  const { t } = useTranslation();
  const [plans, setPlans] = useState<PlanView[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string>("");

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
          const yearly = rows.find((p) => p.duration_months >= 12) ?? rows[0];
          if (yearly) setSelected(yearly.id);
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

  const activePlan = useMemo(
    () => plans.find((p) => p.id === selected),
    [plans, selected]
  );

  const features = [
    { key: "caseManagement", icon: "📋" },
    { key: "clientPortal", icon: "👥" },
    { key: "smartReminders", icon: "🔔" },
    { key: "documentStorage", icon: "📄" },
    { key: "analytics", icon: "📊" },
    { key: "apiAccess", icon: "⚙️" },
    { key: "support", icon: "💬" },
    { key: "customization", icon: "🎨" },
  ];

  return (
    <div className="min-h-dvh bg-[#0F1117]">
      <PublicHeader overDark />

      {/* ── HERO ── */}
      <section className="relative min-h-[400px] flex items-center justify-center overflow-hidden bg-gradient-to-b from-black to-[#0F1117]">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-10" />
          <div className="absolute top-20 right-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        </div>

        <div className={`${CONTAINER} relative z-20 py-20 md:py-32 text-center`}>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-white leading-tight mb-6">
            Simple, Transparent <span className="text-gold">Pricing</span>
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Choose the plan that works for your law firm. No hidden fees. Cancel anytime.
          </p>
        </div>
      </section>

      {/* ── PRICING PLANS ── */}
      <section className={`${SECTION} bg-[#0F1117]`}>
        <div className={CONTAINER}>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-96 bg-white/5 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {plans.map((plan) => {
                const isSelected = plan.id === selected;
                const isPopular = plan.duration_months >= 12;

                return (
                  <Reveal key={plan.id}>
                    <button
                      onClick={() => setSelected(plan.id)}
                      className="h-full text-left group"
                    >
                      <div
                        className={`relative h-full rounded-2xl border transition-all duration-300 p-8 flex flex-col ${
                          isPopular
                            ? "bg-gradient-to-br from-gold/20 to-blue-500/20 border-gold/50 shadow-lg shadow-gold/20 ring-1 ring-gold/30"
                            : "bg-[#1a1f2e] border-white/5 hover:border-gold/30"
                        }`}
                      >
                        {/* Popular badge */}
                        {isPopular && (
                          <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gold text-black text-xs font-bold rounded-full">
                            {t("pricing.mostPopular") || "Most Popular"}
                          </div>
                        )}

                        {/* Plan name & price */}
                        <div className="mb-6">
                          <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                          <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-heading font-bold text-gold">
                              Rs {Math.round(Number(plan.price_pkr) / Math.max(1, plan.duration_months)).toLocaleString()}
                            </span>
                            <span className="text-white/60">/month</span>
                          </div>
                          <p className="text-sm text-white/50 mt-2">
                            {t("pricing.billedEvery")} {plan.duration_months} {t("pricing.months")}
                          </p>
                        </div>

                        {/* CTA */}
                        <Link
                          href={`/register?plan=${plan.code}`}
                          className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 mb-8 text-center inline-flex items-center justify-center gap-2 ${
                            isPopular
                              ? "bg-gold text-black hover:bg-gold/90"
                              : "border border-white/20 text-white hover:border-gold/50 hover:text-gold"
                          }`}
                        >
                          {t("pricing.getCta") || "Get Started"}
                          <ArrowRight className="w-4 h-4" />
                        </Link>

                        {/* Features list */}
                        <div className="flex-1 space-y-3 mb-6 border-t border-white/5 pt-6">
                          <p className="text-sm text-white/60 font-semibold mb-4">
                            {t("pricing.includes")}:
                          </p>
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <div className="w-5 h-5 rounded bg-gold/20 flex items-center justify-center flex-shrink-0">
                                <Check className="w-3 h-3 text-gold" />
                              </div>
                              <span className="text-sm text-white/80">
                                Up to {plan.max_users} {t("pricing.users")}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-5 h-5 rounded bg-gold/20 flex items-center justify-center flex-shrink-0">
                                <Check className="w-3 h-3 text-gold" />
                              </div>
                              <span className="text-sm text-white/80">
                                {t("pricing.fullAccess")}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-5 h-5 rounded bg-gold/20 flex items-center justify-center flex-shrink-0">
                                <Check className="w-3 h-3 text-gold" />
                              </div>
                              <span className="text-sm text-white/80">
                                24/7 {t("pricing.support")}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-5 h-5 rounded bg-gold/20 flex items-center justify-center flex-shrink-0">
                                <Check className="w-3 h-3 text-gold" />
                              </div>
                              <span className="text-sm text-white/80">
                                {t("pricing.dataBackup")}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>
                  </Reveal>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── FEATURES COMPARISON ── */}
      <section className={`${SECTION} bg-[#1a1f2e]/50 border-y border-white/5`}>
        <div className={CONTAINER}>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
              {t("pricing.featureComparison") || "Feature Comparison"}
            </h2>
            <p className="text-lg text-white/60">
              {t("pricing.compareDescription") || "All plans include everything you need to manage your law practice"}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-max">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-4 px-6 text-white font-semibold">{t("pricing.feature")}</th>
                  {plans.map((plan) => (
                    <th key={plan.id} className="text-center py-4 px-6 text-white/70 font-semibold">
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {features.map((feature, idx) => (
                  <tr key={idx} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                    <td className="py-4 px-6 text-white font-medium">
                      <span className="mr-2">{feature.icon}</span>
                      {t(`pricing.feature_${feature.key}`) || feature.key}
                    </td>
                    {plans.map((plan) => (
                      <td key={plan.id} className="text-center py-4 px-6">
                        <Check className="w-5 h-5 text-gold mx-auto" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── FAQ CTA ── */}
      <section className="py-16 bg-[#0F1117]">
        <div className={CONTAINER}>
          <div className="bg-gradient-to-r from-gold/20 to-blue-500/20 border border-white/10 rounded-2xl p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-white mb-3">
              {t("pricing.questions") || "Have questions about our plans?"}
            </h2>
            <p className="text-white/60 mb-6">
              {t("pricing.questionsDesc") || "Check out our FAQ or contact our sales team"}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/faq"
                className="inline-flex items-center justify-center px-8 py-3 border border-white/30 text-white font-semibold rounded-lg hover:bg-white/5 transition-all duration-200"
              >
                {t("pricing.readFaq") || "Read FAQ"}
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-3 bg-gold text-black font-semibold rounded-lg hover:bg-gold/90 transition-all duration-200"
              >
                {t("pricing.contactSales") || "Contact Sales"}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
