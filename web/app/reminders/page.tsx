"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Link from "next/link";
import { differenceInCalendarDays, parseISO } from "date-fns";
import { useTranslation } from "react-i18next";
import { Bell, Check, ExternalLink, RotateCcw, X, Plus } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { RouteGuard } from "@/components/shared/RouteGuard";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { QueryErrorState } from "@/components/ui/QueryErrorState";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { useMutationLock } from "@/components/shared/MutatingButton";
import { useToast } from "@/components/ui/Toast";
import { useReminders, useUpdateReminderStatus } from "@/hooks/useReminders";
import { useAuth } from "@/providers/AuthProvider";
import { supabaseRaw } from "@/lib/supabase/client";
import { fmtDate, todayKarachi } from "@/lib/utils";
import type { ReminderStatus } from "@/types/supabase";

type ReminderTab = Extract<ReminderStatus, "upcoming" | "done" | "dismissed">;

function RemindersPage() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const qc = useQueryClient();
  const [tab, setTab] = useState<ReminderTab>("upcoming");
  const { data, isLoading, isError, refetch } = useReminders();
  const updateStatus = useUpdateReminderStatus();
  const toast = useToast();
  const { lock, canMutate } = useMutationLock();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [saving, setSaving] = useState(false);
  const reminders = data ?? [];
  // ... (rest)

  async function addReminder() {
    if (!profile || !title.trim() || !date) return;
    setSaving(true);
    try {
      const { error } = await supabaseRaw.from("reminders").insert({
        firm_id: profile.firm_id,
        user_id: profile.id,
        title: title.trim(),
        remind_date: date,
        status: "upcoming",
        is_custom: true,
      } as any);
      if (error) throw error;
      toast.success("Reminder added");
      setTitle(""); setDate(""); setShowForm(false);
      void refetch();
      qc.invalidateQueries({ queryKey: ["reminders", profile?.id] });
    } catch (e) {
      toast.error("Failed", e instanceof Error ? e.message : "Could not add reminder");
    } finally {
      setSaving(false);
    }
  }
  const counts = {
    upcoming: reminders.filter(item => item.status === "upcoming").length,
    done: reminders.filter(item => item.status === "done").length,
    dismissed: reminders.filter(item => item.status === "dismissed").length,
  };
  const visible = reminders
    .filter(item => item.status === tab)
    .sort((a, b) => ((a.next_date ?? a.remind_date ?? "")).localeCompare((b.next_date ?? b.remind_date ?? "")));

  async function setStatus(id: string, status: ReminderStatus) {
    if (!canMutate) return;
    try {
      await updateStatus.mutateAsync({ id, status });
      toast.success(status === "upcoming" ? t("reminders.restored") : t("reminders.statusUpdated", { status: t(`reminders.${status}`) }));
    } catch (error) {
      toast.error(t("reminders.updateError"), error instanceof Error ? error.message : t("common.retry"));
    }
  }

  return (
    <AppShell pageTitle={t("reminders.title")} showBack>
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="flex gap-2 overflow-x-auto">
          {(["upcoming", "done", "dismissed"] as const).map(status => (
            <button
              key={status}
              role="tab"
              aria-selected={tab === status}
              onClick={() => setTab(status)}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold capitalize ${
                tab === status
                  ? "border-navy bg-navy text-white"
                  : "border-navy-100 bg-white text-navy-400"
              }`}
            >
              {t(`reminders.${status}`)}
              <span className={`rounded-full px-1.5 text-xs ${tab === status ? "bg-white/20" : "bg-navy-50"}`}>
                {counts[status]}
              </span>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="ml-auto px-3 py-1.5 rounded-lg bg-gold/10 border border-gold text-gold text-xs font-medium hover:bg-gold/20 flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" /> Add reminder
        </button>

      {showForm && (
        <Card className="p-4 space-y-3">
          <input
            className="w-full px-3 py-2 rounded-lg border border-navy-100 text-sm"
            placeholder="Reminder title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            type="date"
            className="w-full px-3 py-2 rounded-lg border border-navy-100 text-sm"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <Button onClick={addReminder} loading={saving} fullWidth>
            Save
          </Button>
        </Card>
      )}

        {isLoading ? (
          <div className="space-y-3">{[1, 2, 3].map(i => <SkeletonCard key={i} />)}</div>
        ) : isError ? (
          <QueryErrorState onRetry={() => void refetch()} />
        ) : visible.length === 0 ? (
          <Card>
            <EmptyState
              icon={Bell}
              title={tab === "upcoming" ? t("reminders.noUpcoming") : t("reminders.noStatus", { status: t(`reminders.${tab}`) })}
              message={tab === "upcoming" ? t("reminders.emptyUpcoming") : undefined}
              className="py-10"
            />
          </Card>
        ) : (
          <div className="space-y-3">
            {visible.map(reminder => {
              const nextDate = reminder.next_date ?? reminder.hearing?.next_date ?? reminder.remind_date;
              const daysLeft = nextDate
                ? differenceInCalendarDays(parseISO(nextDate), parseISO(todayKarachi()))
                : null;
              const urgent = daysLeft === 0
                ? "border-danger/30 bg-red-50"
                : daysLeft !== null && daysLeft <= 3
                  ? "border-gold/30 bg-gold-50/50"
                  : "border-navy-50 bg-white";
              const timing = daysLeft === null
                ? "Date unavailable"
                : daysLeft < 0
                  ? t("reminders.overdue")
                  : daysLeft === 0
                      ? t("reminders.today")
                    : daysLeft === 1
                        ? t("reminders.tomorrow")
                        : t("reminders.inDays", { count: daysLeft });
              const caseUrl = reminder.case?.id
                ? `/cases/view?id=${encodeURIComponent(reminder.case.id)}`
                : "/cases";

              return (
                <Card key={reminder.id} className={`border ${urgent}`}>
                  {(reminder as any).title && (
                    <p className="mb-2 font-semibold text-navy">{(reminder as any).title}</p>
                  )}
                  <div className="flex items-start gap-4">
                    <div className={`w-[76px] shrink-0 rounded-xl p-2 text-center ${
                      daysLeft === 0 ? "bg-danger text-white" : daysLeft !== null && daysLeft <= 3 ? "bg-gold text-white" : "bg-navy-50 text-navy"
                    }`}>
                      <p className="text-sm font-bold leading-tight">
                        {nextDate ? fmtDate(nextDate) : t("reminders.dateUnavailable")}
                      </p>
                      <p className="mt-1 text-[10px] leading-tight">{timing}</p>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-navy">
                        {reminder.case?.plaintiff_name ?? t("reminders.unknownParty")} {t("cases.vs")} {reminder.case?.defendant_name ?? t("reminders.unknownParty")}
                      </p>
                      <p className="mt-1 text-xs text-navy-400">
                        {reminder.case?.case_ref_no ?? (reminder as any).title ?? t("reminders.reminder")}
                      </p>
                      <p className="mt-1 text-xs text-navy-400">
                        {nextDate ? fmtDate(nextDate) : t("reminders.hearingDateUnavailable")}
                        {(reminder.hearing?.court_no ?? reminder.case?.court_no) &&
                          ` · ${t("reminders.court")} ${reminder.hearing?.court_no ?? reminder.case?.court_no}`}
                      </p>
                      {reminder.case?.client?.full_name && (
                        <p className="mt-1 text-xs text-navy-300">{t("reminders.client")}: {reminder.case.client.full_name}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-navy-100/70 pt-3">
                    {tab === "upcoming" ? (
                      <>
                        <Button
                          size="sm"
                          leftIcon={<Check className="h-3.5 w-3.5" />}
                          loading={updateStatus.isPending}
                          {...lock}
                          onClick={() => void setStatus(reminder.id, "done")}
                        >{t("reminders.markDone")}</Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          leftIcon={<X className="h-3.5 w-3.5" />}
                          disabled={updateStatus.isPending}
                          {...lock}
                          onClick={() => void setStatus(reminder.id, "dismissed")}
                        >{t("reminders.dismiss")}</Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        variant="secondary"
                        leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
                        loading={updateStatus.isPending}
                        {...lock}
                        onClick={() => void setStatus(reminder.id, "upcoming")}
                      >{t("reminders.undo")}</Button>
                    )}
                    <Link href={caseUrl} className="ms-auto">
                      <Button size="sm" variant="ghost" rightIcon={<ExternalLink className="h-3.5 w-3.5" />}>
                        {t("reminders.viewCase")}
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}

export default function RemindersPageRoute() {
  return <RouteGuard><RemindersPage /></RouteGuard>;
}
