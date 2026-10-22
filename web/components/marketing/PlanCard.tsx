"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Check, Sparkles, Users, CalendarDays, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PlanView {
  id: string;
  code: string;
  name: string;
  price_pkr: number;
  duration_months: number;
  max_users: number;
}

/** Human cycle label for a plan duration. */
export function cycleKeyFor(months: number): "monthly" | "sixMonth" | "yearly" {
  if (months >= 12) return "yearly";
  if (months >= 6) return "sixMonth";
  return "monthly";
}

interface PlanCardProps {
  plan:        PlanView;
  selected?:   boolean;
  popular?:    boolean;
  /** Per-month price of the cheapest plan — used to compute the saving badge. */
  baselineMonthly?: number;
  onSelect?:   (plan: PlanView) => void;
  className?:  string;
  /** Hide the CTA when the card is used as a selector (billing portal). */
  showCta?:    boolean;
  ctaHref?:    string;
  ctaLabel?:   string;
}

export function PlanCard({
  plan,
  selected   = false,
  popular    = false,
  baselineMonthly,
  onSelect,
  className,
  showCta    = true,
  ctaHref,
  ctaLabel,
}: PlanCardProps) {
  const { t } = useTranslation();

  const price        = Number(plan.price_pkr) || 0;
  const months       = Math.max(1, plan.duration_months);
  const perMonth     = Math.round(price / months);
  const baseline     = baselineMonthly ?? perMonth;
  const saving       = baseline > 0 ? Math.round(((baseline - perMonth) / baseline) * 100) : 0;
  const cycleKey     = cycleKeyFor(months);

  const cycleLabel =
    cycleKey === "yearly"   ? t("marketing.planYearly")
    : cycleKey === "sixMonth" ? t("marketing.plan6Month")
    : t("marketing.planMonthly");

  const interactive = typeof onSelect === "function";

  const body = (
    <>
      {/* Badges */}
      <div className="flex items-start justify-between gap-2">
        <span className="pill-badge bg-navy-50 text-navy-600 border border-slate-200/80">
          <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
          {cycleLabel}
        </span>

        <span className="flex items-center gap-2">
          {saving > 0 && (
            <span className="pill-badge bg-gold-100 text-gold-800 border border-gold-300/60">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              {t("marketing.planSave", { percent: saving })}
            </span>
          )}
          {/* Selection ring / check badge */}
          {interactive && (
            <span
              className={cn(
                "grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 transition-all duration-300",
                selected
                  ? "border-gold bg-gold-cta text-navy-900 shadow-gold"
                  : "border-slate-300 bg-white text-transparent group-hover:border-gold/60"
              )}
              aria-hidden="true"
            >
              <Check className="h-4 w-4" />
            </span>
          )}
        </span>
      </div>

      {popular && (
        <span className="absolute inset-x-0 -top-3 flex justify-center">
          <span className="rounded-full bg-gold-cta px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-navy-900 shadow-gold">
            {t("marketing.planMostPopular")}
          </span>
        </span>
      )}

      {/* Name + price */}
      <div className="mt-4">
        <h3 className="font-heading text-lg font-bold text-navy">{plan.name}</h3>
        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="font-heading text-[32px] font-bold leading-none text-navy">
            Rs {price.toLocaleString()}
          </span>
          <span className="text-xs font-medium text-muted">
            {t("marketing.planFor", { months })}
          </span>
        </div>
        <p className="mt-1.5 text-xs font-semibold text-gold-700">
          {t("marketing.planPerMonth", { price: perMonth.toLocaleString() })}
        </p>
      </div>

      {/* Price breakdown */}
      <dl className="mt-5 space-y-2 border-t border-slate-200/80 pt-4 text-xs">
        <div className="flex items-center justify-between gap-2">
          <dt className="text-muted">{t("marketing.planMonthlyEquivalent")}</dt>
          <dd className="font-semibold text-navy">Rs {perMonth.toLocaleString()}</dd>
        </div>
        <div className="flex items-center justify-between gap-2">
          <dt className="text-muted">{t("marketing.planDuration")}</dt>
          <dd className="font-semibold text-navy">
            {months} {t("pricing.duration", { months })}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-2">
          <dt className="text-muted">{t("marketing.planSeats")}</dt>
          <dd className="inline-flex items-center gap-1.5 font-semibold text-navy">
            <Users className="h-3.5 w-3.5 text-gold" aria-hidden="true" />
            {t("pricing.users", { count: plan.max_users })}
          </dd>
        </div>
        {saving > 0 && (
          <div className="flex items-center justify-between gap-2">
            <dt className="text-muted">{t("marketing.planYouSave")}</dt>
            <dd className="font-bold text-success">
              Rs {Math.max(0, baseline * months - price).toLocaleString()}
            </dd>
          </div>
        )}
      </dl>

      {showCta && ctaHref && !interactive && (
        <Link
          href={ctaHref}
          className={cn(
            "group mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all duration-200 ease-in-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2",
            selected
              ? "bg-navy text-white shadow-md hover:shadow-lg"
              : "bg-gold-cta text-navy-900 shadow-gold hover:shadow-glow-gold"
          )}
        >
          {ctaLabel ?? t("pricing.choosePlan")}
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
      )}
    </>
  );

  if (!interactive) {
    return (
      <div
        className={cn(
          "group relative flex h-full flex-col rounded-2xl border bg-white p-6",
          "border-slate-200/80 shadow-sm transition-all duration-300 ease-in-out hover:shadow-md",
          popular && "border-gold-400/70 shadow-glow-gold-lg",
          className
        )}
      >
        {body}
      </div>
    );
  }

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={() => onSelect?.(plan)}
      className={cn(
        "group relative flex h-full w-full flex-col rounded-2xl border p-6 text-start",
        "transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2",
        "active:scale-[0.99]",
        selected
          ? "border-gold-400 bg-gradient-to-b from-gold-50/80 to-white shadow-glow-gold-lg"
          : "border-slate-200/80 bg-white shadow-sm hover:border-slate-300/90 hover:shadow-md",
        popular && !selected && "border-gold-400/60",
        className
      )}
    >
      {body}
    </button>
  );
}
