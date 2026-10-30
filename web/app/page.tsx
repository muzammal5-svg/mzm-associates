"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import {
  UserPlus, Briefcase, Calendar, List, Bell,
  CheckSquare, Users, BellRing, Settings,
  FolderOpen, ChevronRight, Plus, CalendarCheck, Scale, Gavel, Clock,
} from "lucide-react";

import { AppShell }          from "@/components/layout/AppShell";
import { RouteGuard }        from "@/components/shared/RouteGuard";
import { Logo }              from "@/components/shared/Logo";
import { Card }              from "@/components/ui/Card";
import { Badge }             from "@/components/ui/Badge";
import { Skeleton }          from "@/components/ui/Skeleton";
import { EmptyState }        from "@/components/ui/EmptyState";
import { QueryErrorState } from "@/components/ui/QueryErrorState";
import { useAuth }           from "@/providers/AuthProvider";
import { cn }                from "@/lib/utils";
import { useStoredSession }   from "@/hooks/useStoredSession";
import { Landing }           from "@/components/marketing/Landing";
import { useDashboardCounts } from "@/hooks/useDashboardCounts";
import { useTodayHearings }  from "@/hooks/useTodayHearings";
import { fmtDate, todayKarachi } from "@/lib/utils";
import { toZonedTime }       from "date-fns-tz";
import { BRAND }             from "@/lib/brand";

// ── Greeting helper ──────────────────────────────────────────────────────────
function getTimeOfDay(t: (k: string) => string): string {
  const hour = toZonedTime(new Date(), BRAND.timezone).getHours();
  if (hour < 12) return t("dashboard.morning");
  if (hour < 17) return t("dashboard.afternoon");
  return t("dashboard.evening");
}

// ── Service grid config ──────────────────────────────────────────────────────
function useServices(counts: ReturnType<typeof useDashboardCounts>["data"]) {
  const { t } = useTranslation();
  return [
    {
      key:   "addClient",
      label: t("services.addClient"),
      href:  "/clients/new",
      icon:  UserPlus,
      color: "bg-gold-50 text-gold",
      badge: 0,
    },
    {
      key:   "newCase",
      label: t("services.newCase"),
      href:  "/cases/new",
      icon:  Briefcase,
      color: "bg-navy-50 text-navy",
      badge: 0,
    },
    {
      key:   "causeList",
      label: t("services.causeList"),
      href:  "/cause-list",
      icon:  Calendar,
      color: "bg-blue-50 text-blue-700",
      badge: counts?.todayHearings ?? 0,
    },
    {
      key:   "runningCases",
      label: t("services.runningCases"),
      href:  "/cases",
      icon:  List,
      color: "bg-indigo-50 text-indigo-700",
      badge: counts?.runningCases ?? 0,
    },
    {
      key:   "reminders",
      label: t("services.reminders"),
      href:  "/reminders",
      icon:  Bell,
      color: "bg-yellow-50 text-yellow-700",
      badge: counts?.upcomingReminders ?? 0,
    },
    {
      key:   "decidedCases",
      label: t("services.decidedCases"),
      href:  "/cases/decided",
      icon:  CheckSquare,
      color: "bg-green-50 text-success",
      badge: counts?.decidedCases ?? 0,
    },
    {
      key:   "clients",
      label: t("services.clients"),
      href:  "/clients",
      icon:  Users,
      color: "bg-purple-50 text-purple-700",
      badge: counts?.totalClients ?? 0,
    },
    {
      key:   "notifications",
      label: t("services.notifications"),
      href:  "/notifications",
      icon:  BellRing,
      color: "bg-red-50 text-danger",
      badge: counts?.unreadNotifications ?? 0,
    },
    {
      key:   "documents",
      label: t("services.documents"),
      href:  "/documents",
      icon:  FolderOpen,
      color: "bg-orange-50 text-orange-700",
      badge: 0,
    },
    {
      key:   "settings",
      label: t("services.settings"),
      href:  "/settings",
      icon:  Settings,
      color: "bg-gray-50 text-gray-600",
      badge: 0,
    },
  ];
}

// ── Page ─────────────────────────────────────────────────────────────────────
function DashboardPage() {
  const { t }      = useTranslation();
  const { profile, user, loading, configured } = useAuth();
  const counts     = useDashboardCounts();
  const hearings   = useTodayHearings();
  const services   = useServices(counts.data);
  const timeOfDay  = getTimeOfDay(t);
  const todayLabel = fmtDate(todayKarachi());

  const firstName  = profile?.full_name?.split(" ")[0] ?? t("nav.home");

  return (
    <AppShell hideTopBar>
      <div className="space-y-7">
        {/* ── Executive Command Header ── */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-navy-800 to-navy-950 border border-slate-700/60 rounded-3xl p-6 md:p-8 text-white shadow-lg">
          <div className="absolute top-0 end-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-gold/15 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gold/20 text-gold-200 border border-gold/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                  {profile?.role === "super_admin" ? "Platform Super Admin" : "Active Firm Practice"}
                </span>
                <span className="text-white/70 text-xs flex items-center gap-1.5 font-medium">
                  <Clock className="w-3.5 h-3.5 text-white/50" />
                  {todayLabel}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold text-white tracking-tight">
                {t("dashboard.greeting", { time: timeOfDay, name: firstName })}
              </h1>
              <p className="text-white/70 text-sm max-w-xl leading-relaxed">
                {t("dashboard.subtitle") || "Real-time overview of active litigation, scheduled court cause lists, and client matters."}
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2.5 flex-wrap flex-shrink-0">
              <Link
                href="/cases/new"
                className="btn-primary text-xs md:text-sm font-semibold shadow-gold hover:shadow-gold-lg flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>{t("cases.newCase") || "New Case"}</span>
              </Link>
              <Link
                href="/cause-list"
                className="inline-flex items-center gap-2 px-4 py-3 rounded-md bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs md:text-sm font-semibold backdrop-blur-sm transition-all duration-150"
              >
                <CalendarCheck className="w-4 h-4 text-gold-300" />
                <span>{t("nav.causeList") || "Cause List"}</span>
              </Link>
              <Link
                href="/cases/running"
                className="inline-flex items-center gap-2 px-4 py-3 rounded-md bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs md:text-sm font-semibold backdrop-blur-sm transition-all duration-150"
              >
                <Scale className="w-4 h-4 text-sky-300" />
                <span>{t("nav.runningCases") || "Running"}</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ── Stats Grid (4 KPI Cards) ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base md:text-lg font-heading font-bold text-navy flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gold" />
              {t("dashboard.stats") || "Key Practice Metrics"}
            </h2>
            <span className="text-xs text-navy-400 font-medium">{t("common.realTime") || "Live database sync"}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {counts.isError ? (
              <div className="col-span-full"><QueryErrorState onRetry={() => void counts.refetch()} /></div>
            ) : counts.isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs animate-pulse">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100" />
                    <div className="w-16 h-5 rounded-full bg-slate-100" />
                  </div>
                  <div className="h-4 w-24 bg-slate-100 rounded mb-2" />
                  <div className="h-8 w-16 bg-slate-100 rounded" />
                </div>
              ))
            ) : (
              [
                {
                  id: "running",
                  icon: Briefcase,
                  iconBox: "bg-blue-50 text-blue-700 border-blue-200/80",
                  label: t("dashboard.runningCases"),
                  value: counts.data?.runningCases ?? 0,
                  trend: t("dashboard.active") || "Active Litigation",
                  trendVariant: "info" as const,
                  href: "/cases/running",
                },
                {
                  id: "today",
                  icon: CalendarCheck,
                  iconBox: "bg-amber-50 text-amber-700 border-amber-200/80",
                  label: t("dashboard.todayCases"),
                  value: counts.data?.todayHearings ?? 0,
                  trend: (counts.data?.todayHearings ?? 0) > 0 ? "Scheduled Today" : "None Today",
                  trendVariant: (counts.data?.todayHearings ?? 0) > 0 ? ("gold" as const) : ("neutral" as const),
                  href: "/cause-list",
                },
                {
                  id: "clients",
                  icon: Users,
                  iconBox: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
                  label: t("dashboard.totalClients"),
                  value: counts.data?.totalClients ?? 0,
                  trend: t("dashboard.registered") || "Retained Clients",
                  trendVariant: "success" as const,
                  href: "/clients",
                },
                {
                  id: "reminders",
                  icon: BellRing,
                  iconBox: "bg-indigo-50 text-indigo-700 border-indigo-200/80",
                  label: t("dashboard.upcoming"),
                  value: counts.data?.upcomingReminders ?? 0,
                  trend: (counts.data?.upcomingReminders ?? 0) > 0 ? "Pending Actions" : "Up to Date",
                  trendVariant: (counts.data?.upcomingReminders ?? 0) > 0 ? ("warning" as const) : ("neutral" as const),
                  href: "/reminders",
                },
              ].map(stat => {
                const Icon = stat.icon;
                return (
                  <Link
                    key={stat.id}
                    href={stat.href}
                    className="group bg-white border border-slate-200/80 hover:border-gold/50 rounded-2xl p-5 transition-all duration-200 hover:shadow-md shadow-xs active:scale-[0.99] block"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className={cn("w-10 h-10 rounded-xl border flex items-center justify-center transition-transform group-hover:scale-105", stat.iconBox)}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <Badge variant={stat.trendVariant} size="sm" dot>
                        {stat.trend}
                      </Badge>
                    </div>
                    <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
                      {stat.label}
                    </p>
                    <div className="flex items-baseline justify-between">
                      <span className="text-3xl font-heading font-bold text-navy tracking-tight">
                        {stat.value}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-gold group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-all" />
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* ── Services Grid ── */}
        <div>
          <h2 className="text-base md:text-lg font-heading font-bold text-navy mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gold" />
            {t("dashboard.services")}
          </h2>
          <div className="grid grid-cols-2 xs:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
            {services.map(svc => {
              const Icon = svc.icon;
              return (
                <Link
                  key={svc.key}
                  href={svc.href}
                  className="group flex flex-col items-center gap-3 p-4 bg-white border border-slate-200/80 hover:border-gold/60 rounded-2xl transition-all duration-200 hover:shadow-md shadow-xs active:scale-[0.98]"
                >
                  <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center group-hover:bg-gold/20 group-hover:scale-105 transition-all duration-200">
                    <Icon className="w-6 h-6 text-gold transition-transform duration-200" />
                  </div>
                  <span className="text-xs font-semibold text-navy text-center leading-tight group-hover:text-gold transition-colors">
                    {t(`services.${svc.key}`)}
                  </span>
                  {svc.badge > 0 && (
                    <span className="text-[10px] font-bold bg-danger text-white rounded-full px-2 py-0.5">
                      {svc.badge > 99 ? "99+" : svc.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* ── Today's Hearings Preview ── */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base md:text-lg font-heading font-bold text-navy flex items-center gap-2">
                <Gavel className="w-4.5 h-4.5 text-gold" />
                {t("dashboard.todayPreview")}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {hearings.data?.length ?? 0} {t("hearings.scheduledToday") || "cases listed for today"}
              </p>
            </div>
            <Link
              href="/cause-list"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold-700 hover:text-gold-800 bg-gold/10 hover:bg-gold/15 px-3 py-1.5 rounded-lg transition-colors"
            >
              <span>{t("dashboard.viewAll")}</span>
              <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
            </Link>
          </div>

          {hearings.isError ? (
            <QueryErrorState onRetry={() => void hearings.refetch()} />
          ) : hearings.isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}
            </div>
          ) : hearings.data?.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title={t("dashboard.noHearingsToday")}
              description={t("dashboard.noHearingsSub") || "No court appearances scheduled on your calendar for today."}
              className="py-6"
            />
          ) : (
            <div className="space-y-2.5">
              {hearings.data?.map(h => (
                <Link
                  key={h.hearing_id}
                  href={`/cases/view?id=${h.case_id}`}
                  className="group block"
                >
                  <div className="bg-slate-50/70 hover:bg-white border border-slate-200/70 hover:border-gold/50 rounded-xl p-3.5 transition-all duration-200 flex items-center gap-3.5 shadow-2xs hover:shadow-xs">
                    {/* Serial badge */}
                    <div className="min-w-[42px] max-w-[56px] h-10 px-2 rounded-xl bg-gold/10 border border-gold/25 flex items-center justify-center flex-shrink-0 group-hover:bg-gold/20 transition-colors overflow-hidden">
                      <span className="text-xs font-bold text-gold font-mono truncate whitespace-nowrap">
                        {h.serial_no ? (h.serial_no.startsWith("#") ? h.serial_no : `#${h.serial_no.trim()}`) : "—"}
                      </span>
                    </div>

                    {/* Case parties */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-navy truncate group-hover:text-gold transition-colors">
                        {h.plaintiff_name} <span className="text-slate-400 font-normal text-xs mx-1">{t("cases.vs")}</span> {h.defendant_name}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-500 truncate mt-0.5">
                        {h.case_ref_no && <span className="font-mono text-gold-700 font-medium">{h.case_ref_no}</span>}
                        {h.case_type_name && <span>• {h.case_type_name}</span>}
                      </div>
                    </div>

                    {/* Court & Judge */}
                    <div className="text-end flex-shrink-0 hidden sm:block">
                      {h.hearing_court_no && (
                        <p className="text-xs font-semibold text-navy">
                          {t("cases.court")} {h.hearing_court_no}
                        </p>
                      )}
                      {h.hearing_judge && (
                        <p className="text-[11px] text-slate-400 truncate max-w-[140px] mt-0.5">
                          {h.hearing_judge}
                        </p>
                      )}
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-gold transition-colors flex-shrink-0 rtl:rotate-180" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

      </div>
    </AppShell>
  );
}

export default function HomePage() {
  const { user, loading, configured } = useAuth();
  const stored = useStoredSession();

  // Session resolved (or impossible) with no user → landing for everyone,
  // including stale/revoked stored tokens.
  const loggedOut = !configured || (!loading && !user);
  if (!stored || loggedOut) return <Landing />;

  // Visitor has a stored session: show a neutral skeleton while the session
  // resolves, then hand over to the dashboard.
  if (!user) {
    return (
      <div className="min-h-dvh bg-offwhite flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-navy-header flex items-center justify-center">
            <span className="text-white font-heading font-bold">M</span>
          </div>
          <div className="h-2 w-32 bg-navy-50 rounded animate-shimmer" />
        </div>
      </div>
    );
  }

  return (
    <RouteGuard>
      <DashboardPage />
    </RouteGuard>
  );
}



