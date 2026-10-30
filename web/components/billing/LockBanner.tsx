"use client";

import { useTranslation } from "react-i18next";
import { Lock, ShieldAlert, CheckCircle2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type LockSeverity = "locked" | "grace" | "active";

interface LockBannerProps {
  severity: LockSeverity;
  status:    string;
  message?:  string;
}

const SEVERITY: Record<LockSeverity, {
  wrap:    string;
  iconWrap:string;
  icon:    string;
  pill:    string;
  dot:     string;
  titleKey: string;
}> = {
  locked: {
    wrap:     "border-rose-300/60 bg-gradient-to-r from-rose-50/90 via-white to-rose-50/60",
    iconWrap: "bg-rose-100 text-rose-600 ring-rose-200/70",
    icon:     "text-rose-600",
    pill:     "bg-rose-100 text-rose-700 border-rose-200",
    dot:      "text-rose-500",
    titleKey: "billing.lockedTitle",
  },
  grace: {
    wrap:     "border-amber-300/60 bg-gradient-to-r from-amber-50/90 via-white to-amber-50/60",
    iconWrap: "bg-amber-100 text-amber-600 ring-amber-200/70",
    icon:     "text-amber-600",
    pill:     "bg-amber-100 text-amber-800 border-amber-200",
    dot:      "text-amber-500",
    titleKey: "billing.graceTitle",
  },
  active: {
    wrap:     "border-emerald-300/60 bg-gradient-to-r from-emerald-50/90 via-white to-emerald-50/60",
    iconWrap: "bg-emerald-100 text-emerald-600 ring-emerald-200/70",
    icon:     "text-emerald-600",
    pill:     "bg-emerald-100 text-emerald-800 border-emerald-200",
    dot:      "text-emerald-500",
    titleKey: "billing.activeTitle",
  },
};

export function LockBanner({ severity, status, message }: LockBannerProps) {
  const { t } = useTranslation();
  const s = SEVERITY[severity];

  /** Friendly status label: every locked state reads as INACTIVE. */
  const displayStatus =
    status === "active"    ? "ACTIVE"
    : status === "trialing" ? "TRIALING"
    : status === "grace"    ? "GRACE"
    : "INACTIVE";

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-2xl border p-5 shadow-sm backdrop-blur-md",
        s.wrap
      )}
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        {/* Animated lock icon */}
        <span
          className={cn(
            "relative grid h-12 w-12 shrink-0 place-items-center rounded-2xl ring-4",
            s.iconWrap
          )}
          aria-hidden="true"
        >
          <span className={cn("absolute inset-0 rounded-2xl opacity-40 animate-glow-pulse", s.iconWrap.replace("bg-", "bg-"))} />
          {severity === "active"
            ? <CheckCircle2 className="h-6 w-6" />
            : <Lock className={cn("h-6 w-6", s.icon)} />}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="font-heading text-base font-bold text-navy sm:text-lg">
              {t(s.titleKey)}
            </h2>
            <span className={cn("pill-badge border", s.pill)} title={status.toUpperCase()}>
              <span className={cn("pulse-dot", s.dot)} aria-hidden="true" />
              {t("billing.statusLabel")}: {displayStatus}
            </span>
          </div>

          <p className="mt-2 text-sm leading-relaxed text-navy/70">
            {message ?? t("billing.lockedDesc")}
          </p>

          <ol className="mt-4 grid gap-2 sm:grid-cols-3">
            {[
              t("billing.lockStep1"),
              t("billing.lockStep2"),
              t("billing.lockStep3"),
            ].map((step, i) => (
              <li
                key={step}
                className="flex items-start gap-2 rounded-xl border border-white/70 bg-white/70 px-3 py-2.5 text-xs font-medium text-navy/80 backdrop-blur-sm"
              >
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-navy-800 text-[10px] font-bold text-gold-300">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>

          {severity !== "active" && (
            <a
              href="#plans"
              className="group mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-navy-800 underline-offset-4 transition-colors duration-200 hover:text-gold-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              {t("billing.lockJumpToPlans")}
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
            </a>
          )}
        </div>

        <ShieldAlert className="hidden h-5 w-5 shrink-0 text-navy-400 sm:block" aria-hidden="true" />
      </div>
    </section>
  );
}
