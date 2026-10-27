"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import {
  UserPlus, Briefcase, Calendar, List, Bell,
  CheckSquare, Users, BellRing, Settings,
  FolderOpen, ChevronRight,
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
      <div className="space-y-6">
        {/* ── Header ── */}
        <div className="bg-navy-header rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Logo size="sm" variant="mark" />
              <div>
                <p className="text-xs text-white/70 font-medium">{todayLabel}</p>
                <h1 className="text-xl md:text-2xl font-heading font-bold text-white">
                  {t("dashboard.greeting", { time: timeOfDay, name: firstName })}
                </h1>
              </div>
            </div>
            <Link href="/notifications" className="relative w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-white" />
              {(counts.data?.unreadNotifications ?? 0) > 0 && (
                <span className="absolute -top-1 -end-1 min-w-[16px] h-4 px-0.5 rounded-full bg-danger text-white text-[10px] font-bold flex items-center justify-center">
                  {counts.data?.unreadNotifications}
                </span>
              )}
            </Link>
          </div>
          <p className="text-sm text-white/70 mt-2">{profile?.email ?? ""}</p>
        </div>

        {/* ── Stat chips (4 key numbers) ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {counts.isError ? (
            <div className="col-span-full"><QueryErrorState onRetry={() => void counts.refetch()} /></div>
          ) : counts.isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="card flex flex-col gap-1">
                  <div className="h-7 w-1/3 bg-navy-50 rounded animate-shimmer" />
                  <div className="h-3 w-2/3 bg-navy-50 rounded animate-shimmer" />
                </div>
              ))
            : [
                { label: t("dashboard.todayCases"),   value: counts.data?.todayHearings,   color: "text-blue-600" },
                { label: t("dashboard.runningCases"),  value: counts.data?.runningCases,    color: "text-gold" },
                { label: t("dashboard.totalClients"),  value: counts.data?.totalClients,    color: "text-purple-600" },
                { label: t("dashboard.upcoming"),      value: counts.data?.upcomingReminders, color: "text-yellow-600" },
              ].map(stat => (
                <div key={stat.label} className="card flex flex-col gap-0.5">
                  <span className={`text-2xl font-heading font-bold ${stat.color}`}>
                    {stat.value ?? "—"}
                  </span>
                  <span className="text-xs text-navy-400 leading-tight">{stat.label}</span>
                </div>
              ))
          }
        </div>

        {/* ── Services grid ── */}
        <div>
          <h2 className="text-sm font-semibold text-navy-400 uppercase tracking-wider mb-3">
            {t("dashboard.services")}
          </h2>
          <div className="grid grid-cols-2 xs:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 stagger-children">
            {services.map(svc => (
              <Link
                key={svc.key}
                href={svc.href}
                className="group flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-white to-navy-50 rounded-xl border border-border shadow-sm hover:shadow-md hover:border-gold/30 transition-all duration-150 active:scale-[.98] focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${svc.color} relative shadow-xs bg-gradient-to-br`}>
                  <svc.icon className="w-5 h-5" />
                  {svc.badge > 0 && (
                    <Badge
                      variant={svc.key === "notifications" ? "danger" : "gold"}
                      size="sm"
                      className="absolute -top-1.5 -end-1.5 min-w-[18px] h-[18px] flex items-center justify-center px-1"
                    >
                      {svc.badge > 99 ? "99+" : svc.badge}
                    </Badge>
                  )}
                </div>
                <span className="text-xs font-medium text-navy text-center leading-tight group-hover:text-gold transition-colors">
                  {svc.label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Today's hearings preview ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-navy-400 uppercase tracking-wider">
              {t("dashboard.todayPreview")}
            </h2>
            <Link href="/cause-list" className="text-xs text-gold hover:underline font-medium flex items-center gap-0.5">
              {t("dashboard.viewAll")} <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {hearings.isError ? (
            <QueryErrorState onRetry={() => void hearings.refetch()} />
          ) : hearings.isLoading ? (
            <div className="space-y-2">
              {[1,2,3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}
            </div>
          ) : hearings.data?.length === 0 ? (
            <Card>
              <EmptyState
                icon={Calendar}
                title={t("dashboard.noHearingsToday")}
                className="py-8"
              />
            </Card>
          ) : (
            <div className="space-y-2">
              {hearings.data?.map(h => (
                <Link
                  key={h.hearing_id}
                  href={`/cases/view?id=${h.case_id}`}
                  className="block"
                >
                  <Card hover className="flex items-center gap-3">
                    {/* Serial */}
                    <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-gold">{h.serial_no ?? "—"}</span>
                    </div>
                    {/* Case info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-navy truncate">
                        {h.plaintiff_name} {t("cases.vs")} {h.defendant_name}
                      </p>
                      <p className="text-xs text-navy-400 truncate">{h.case_ref_no} · {h.case_type_name}</p>
                    </div>
                    {/* Court info */}
                    <div className="text-end flex-shrink-0">
                      <p className="text-xs font-medium text-navy-400">{h.hearing_court_no ?? h.case_court_no ?? ""}</p>
                      {h.next_date && (
                        <p className="text-[10px] text-navy-300">{fmtDate(h.next_date)}</p>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-navy-300 flex-shrink-0" />
                  </Card>
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



