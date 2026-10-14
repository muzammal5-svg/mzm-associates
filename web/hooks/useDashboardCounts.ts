"use client";

import { useQuery } from "@tanstack/react-query";
import { db }       from "@/lib/supabase/client";
import { todayKarachi } from "@/lib/utils";

interface DashboardCounts {
  todayHearings:   number;
  runningCases:    number;
  decidedCases:    number;
  totalClients:    number;
  upcomingReminders: number;
  unreadNotifications: number;
}

async function fetchCounts(): Promise<DashboardCounts> {
  const today = todayKarachi();

  const [today_, running, decided, clients, reminders, notifs] = await Promise.all([
    db.hearings().select("id", { count: "exact", head: true }).eq("hearing_date", today),
    db.cases().select("id",    { count: "exact", head: true }).eq("status", "running"),
    db.cases().select("id",    { count: "exact", head: true }).eq("status", "decided"),
    db.clients().select("id",  { count: "exact", head: true }).eq("is_active", true),
    db.reminders().select("id",{ count: "exact", head: true }).eq("status", "upcoming"),
    db.notifications().select("id", { count: "exact", head: true }).eq("is_read", false),
  ]);

  const failed = [today_, running, decided, clients, reminders, notifs].find(result => result.error);
  if (failed?.error) throw failed.error;

  return {
    todayHearings:       today_.count   ?? 0,
    runningCases:        running.count  ?? 0,
    decidedCases:        decided.count  ?? 0,
    totalClients:        clients.count  ?? 0,
    upcomingReminders:   reminders.count ?? 0,
    unreadNotifications: notifs.count   ?? 0,
  };
}

export function useDashboardCounts() {
  return useQuery({
    queryKey: ["dashboard-counts"],
    queryFn:  fetchCounts,
    staleTime: 1000 * 60 * 2,  // 2 min
    retry: 1,
  });
}
