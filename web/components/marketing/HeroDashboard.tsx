"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Scale, LayoutDashboard, Gavel, Users, Bell, Settings,
  CalendarClock, CheckCircle2, Wallet, Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Interactive product mockup used inside the landing-page hero.
 * Renders a live-feeling dashboard window with switchable panels and
 * floating feature cards that react to hover.
 */
export function HeroDashboard() {
  const { t } = useTranslation();
  const [panel, setPanel] = useState<"cause" | "cases">("cause");

  const stats = [
    { label: t("dashboard.todayCases"),  value: "12",  icon: CalendarClock, tone: "text-gold-300" },
    { label: t("dashboard.runningCases"), value: "48",  icon: Gavel,         tone: "text-sky-300" },
    { label: t("dashboard.totalClients"), value: "156", icon: Users,         tone: "text-emerald-300" },
  ];

  return (
    <div className="relative">
      {/* Window chrome */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 shadow-2xl shadow-slate-950/50 backdrop-blur-xl transition-transform duration-500 ease-out hover:scale-[1.01]">
        <div className="flex items-center gap-3 border-b border-white/10 bg-white/5 px-4 py-3">
          <span className="flex gap-1.5" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
          </span>
          <span className="flex items-center gap-1.5 rounded-md bg-white/5 px-2.5 py-1 font-mono text-[10px] text-white/50">
            <Activity className="h-3 w-3 text-gold-300" aria-hidden="true" />
            mzm.app/dashboard
          </span>
          <span className="ms-auto inline-flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-300">
            <span className="pulse-dot" aria-hidden="true" />
            {t("marketing.floatLive")}
          </span>
        </div>

        <div className="flex">
          {/* Side rail */}
          <div className="hidden w-14 shrink-0 flex-col items-center gap-3 border-e border-white/10 bg-white/[0.03] py-4 sm:flex" aria-hidden="true">
            {[LayoutDashboard, Gavel, Users, Bell, Scale].map((Icon, i) => (
              <span
                key={i}
                className={cn(
                  "grid h-9 w-9 place-items-center rounded-lg transition-colors",
                  i === 0 ? "bg-gold-cta text-navy-900" : "text-white/35"
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
            ))}
            <span className="mt-auto grid h-9 w-9 place-items-center rounded-lg text-white/25">
              <Settings className="h-4 w-4" />
            </span>
          </div>

          {/* Main panel */}
          <div className="min-w-0 flex-1 p-4 sm:p-5">
            {/* Stat chips */}
            <div className="grid grid-cols-3 gap-2.5">
              {stats.map((s) => (
                <div key={s.label} className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5">
                  <span className={cn("inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider", s.tone)}>
                    <s.icon className="h-3.5 w-3.5" aria-hidden="true" />
                    {s.label}
                  </span>
                  <p className="mt-1 font-heading text-xl font-bold text-white">{s.value}</p>
                </div>
              ))}
            </div>

            {/* Panel switcher */}
            <div
              className="mt-4 inline-flex rounded-lg border border-white/10 bg-white/5 p-1"
              role="tablist"
              aria-label={t("marketing.floatPreviewTabs")}
            >
              {(["cause", "cases"] as const).map((key) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={panel === key}
                  onClick={() => setPanel(key)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-[11px] font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400",
                    panel === key
                      ? "bg-gold-cta text-navy-900 shadow-gold"
                      : "text-white/60 hover:text-white"
                  )}
                >
                  {key === "cause" ? t("dashboard.todayPreview") : t("cases.running")}
                </button>
              ))}
            </div>

            {/* Mock rows */}
            <div className="mt-3 space-y-2" aria-hidden="true">
              {panel === "cause" ? (
                <>
                  <MockRow time="10:00" refNo="PLD/2214/2024" party="M/s Ahmed & Sons" court="Court 12" />
                  <MockRow time="11:30" refNo="CRR/0918/2024" party="Imtiaz vs State" court="Court 04" />
                  <MockRow time="01:15" refNo="CYB/3342/2024" party="Malik Traders" court="Court 07" />
                </>
              ) : (
                <>
                  <MockRow time="D-03" refNo="PLD/2214/2024" party="M/s Ahmed & Sons" court="Running" />
                  <MockRow time="D-11" refNo="CRR/0918/2024" party="Imtiaz vs State" court="Running" />
                  <MockRow time="D-19" refNo="CYB/3342/2024" party="Malik Traders" court="Running" />
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Floating feature cards */}
      <div className="pointer-events-none absolute -top-5 -start-3 hidden animate-float-slow rounded-xl border border-white/15 bg-[#0F172A]/90 px-3.5 py-2.5 shadow-2xl backdrop-blur-md sm:block lg:-start-8 z-20">
        <p className="flex items-center gap-2 text-[11px] font-semibold text-white">
          <CalendarClock className="h-3.5 w-3.5 text-gold-400" aria-hidden="true" />
          {t("marketing.floatCard1")}
        </p>
      </div>

      <div className="pointer-events-none absolute -bottom-5 -end-3 hidden animate-float-slow rounded-xl border border-white/15 bg-[#0F172A]/90 px-3.5 py-2.5 shadow-2xl backdrop-blur-md sm:block lg:-end-8 z-20" style={{ animationDelay: "1.4s" }}>
        <p className="flex items-center gap-2 text-[11px] font-semibold text-white">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
          {t("marketing.floatCard2")}
        </p>
      </div>

      <div className="pointer-events-none absolute -bottom-3 start-1/4 hidden animate-float-slow rounded-xl border border-white/15 bg-[#0F172A]/90 px-3.5 py-2.5 shadow-2xl backdrop-blur-md lg:block z-20" style={{ animationDelay: ".7s" }}>
        <p className="flex items-center gap-2 text-[11px] font-semibold text-white">
          <Wallet className="h-3.5 w-3.5 text-gold-400" aria-hidden="true" />
          {t("marketing.floatCard3")}
        </p>
      </div>
    </div>
  );
}

function MockRow({ time, refNo, party, court }: { time: string; refNo: string; party: string; court: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 transition-colors duration-300 hover:bg-white/[0.07]">
      <span className="w-12 shrink-0 rounded-md bg-gold-cta/15 px-1.5 py-1 text-center font-mono text-[10px] font-bold text-gold-300">
        {time}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[11px] font-semibold text-white/90">{party}</span>
        <span className="block truncate font-mono text-[10px] text-white/40">{refNo}</span>
      </span>
      <span className="hidden shrink-0 rounded-md border border-white/10 px-2 py-1 text-[10px] font-medium text-white/50 sm:block">
        {court}
      </span>
    </div>
  );
}
