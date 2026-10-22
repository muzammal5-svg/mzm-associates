"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { BellRing, Check, Smartphone } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { RouteGuard } from "@/components/shared/RouteGuard";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { QueryErrorState } from "@/components/ui/QueryErrorState";
import { useMutationLock } from "@/components/shared/MutatingButton";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/providers/AuthProvider";
import { canUseWebPush, disableWebPush, enableWebPush, getWebPushSubscriptionEndpoint, sendTestPush } from "@/lib/push";
import { supabaseRaw } from "@/lib/supabase/client";
import type { NotificationPreference } from "@/types/supabase";

interface PreferenceData {
  preference: NotificationPreference | null;
  firmDefault: number;
}

function NotificationSettingsPage() {
  const { t } = useTranslation();
  const { user, profile, firm } = useAuth();
  const queryClient = useQueryClient();
  const toast = useToast();
  const { lock, canMutate } = useMutationLock();
  const [reminders, setReminders] = useState(true);
  const [dailySummary, setDailySummary] = useState(true);
  const [caseUpdates, setCaseUpdates] = useState(true);
  const [systemAlerts, setSystemAlerts] = useState(true);
  const [remindDays, setRemindDays] = useState(10);
  const [useFirmDefault, setUseFirmDefault] = useState(true);
  const [firmDefault, setFirmDefault] = useState(10);
  const [saving, setSaving] = useState(false);
  const [pushBusy, setPushBusy] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const isAdmin = profile?.role === "admin" || profile?.role === "super_admin";

  const { data, isLoading, isError, refetch } = useQuery<PreferenceData>({
    queryKey: ["notification-preferences", user?.id, profile?.firm_id],
    queryFn: async () => {
      const [{ data: preference, error: preferenceError }, { data: firmRow, error: firmError }] = await Promise.all([
        supabaseRaw.from("notification_preferences").select("*").eq("user_id", user!.id).maybeSingle(),
        supabaseRaw.from("firms").select("default_remind_days_before").eq("id", profile!.firm_id).single(),
      ]);
      if (preferenceError) throw preferenceError;
      if (firmError) throw firmError;
      return {
        preference: preference as NotificationPreference | null,
        firmDefault: firmRow.default_remind_days_before as number,
      };
    },
    enabled: !!user && !!profile,
  });

  useEffect(() => {
    if (!data) return;
    const preference = data.preference;
    setReminders(preference?.notify_reminders ?? true);
    setDailySummary(preference?.notify_daily_summary ?? true);
    setCaseUpdates(preference?.notify_case_updates ?? true);
    setSystemAlerts(preference?.notify_system ?? true);
    setRemindDays(preference?.remind_days_before ?? data.firmDefault);
    setUseFirmDefault(preference?.remind_days_before == null);
    setFirmDefault(data.firmDefault);
  }, [data]);

  useEffect(() => {
    if (!user || !canUseWebPush()) return;
    void getWebPushSubscriptionEndpoint()
      .then(endpoint => setPushEnabled(!!endpoint))
      .catch(error => console.error("[push] subscription lookup:", error));
  }, [user]);

  async function savePreferences(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || !profile || !canMutate) return;
    setSaving(true);
    try {
      const { error } = await supabaseRaw.from("notification_preferences").upsert({
        user_id: user.id,
        firm_id: profile.firm_id,
        remind_days_before: useFirmDefault ? null : remindDays,
        notify_reminders: reminders,
        notify_daily_summary: dailySummary,
        notify_case_updates: caseUpdates,
        notify_system: systemAlerts,
      }, { onConflict: "user_id" });
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ["notification-preferences", user.id] });
      toast.success(t("settings.preferencesSaved"));
    } catch (error) {
      toast.error(t("settings.preferencesSaveError"), error instanceof Error ? error.message : t("common.retry"));
    } finally {
      setSaving(false);
    }
  }

  async function saveFirmDefault(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!profile || !isAdmin || !canMutate) return;
    setSaving(true);
    try {
      const { error } = await supabaseRaw.rpc("set_firm_reminder_default", { p_days: firmDefault });
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ["notification-preferences"] });
      toast.success(t("settings.firmDefaultSaved"), t("settings.firmDefaultSavedDescription"));
    } catch (error) {
      toast.error(t("settings.firmDefaultSaveError"), error instanceof Error ? error.message : t("common.retry"));
    } finally {
      setSaving(false);
    }
  }

  async function togglePush() {
    if (!user || !canMutate) return;
    setPushBusy(true);
    try {
      if (pushEnabled) {
        await disableWebPush(user.id);
        setPushEnabled(false);
        toast.success(t("settings.browserPushDisabled"));
      } else {
        await enableWebPush(user.id);
        setPushEnabled(true);
        toast.success(t("settings.browserPushEnabled"));
      }
    } catch (error) {
      toast.error(t("settings.browserPushError"), error instanceof Error ? error.message : t("common.retry"));
    } finally {
      setPushBusy(false);
    }
  }

  async function testPush() {
    setPushBusy(true);
    try {
      await sendTestPush();
      toast.success(t("settings.testPushSent"));
    } catch (error) {
      toast.error(t("settings.testPushError"), error instanceof Error ? error.message : t("common.retry"));
    } finally {
      setPushBusy(false);
    }
  }

  if (isLoading) return <AppShell pageTitle={t("settings.notificationPreferences")} showBack><p className="text-sm text-navy-400">{t("common.loading")}</p></AppShell>;
  if (isError || !data) return <AppShell pageTitle={t("settings.notificationPreferences")} showBack><QueryErrorState onRetry={() => void refetch()} /></AppShell>;

  return (
    <AppShell pageTitle={t("settings.notificationPreferences")} showBack>
      <div className="mx-auto max-w-xl space-y-5">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BellRing className="h-5 w-5 text-gold" /> {t("settings.inAppNotifications")}</CardTitle>
          </CardHeader>
          <form onSubmit={savePreferences} className="space-y-4">
            <Toggle label={t("settings.hearingReminders")} description={t("settings.hearingRemindersDescription")} checked={reminders} onChange={setReminders} />
            <Toggle label={t("settings.dailySummary")} description={t("settings.dailySummaryDescription")} checked={dailySummary} onChange={setDailySummary} />
            <Toggle label={t("settings.caseUpdates")} description={t("settings.caseUpdatesDescription")} checked={caseUpdates} onChange={setCaseUpdates} />
            <Toggle label={t("settings.systemAlerts")} description={t("settings.systemAlertsDescription")} checked={systemAlerts} onChange={setSystemAlerts} />
            <Toggle
              label={t("settings.useFirmDefault", { count: data.firmDefault })}
              description={t("settings.firmDefaultDescription")}
              checked={useFirmDefault}
              onChange={setUseFirmDefault}
            />
            <Input
              label={t("settings.remindDays")}
              type="number"
              min={1}
              max={30}
              required
              disabled={useFirmDefault}
              value={remindDays}
              onChange={event => setRemindDays(Math.min(30, Math.max(1, Number(event.target.value) || 1)))}
              hint={useFirmDefault ? t("settings.usingFirmDefault") : t("settings.personalReminderWindow")}
            />
            <Button type="submit" {...lock} loading={saving} leftIcon={<Check className="h-4 w-4" />}>{t("settings.savePreferences")}</Button>
          </form>
        </Card>

        {isAdmin && (
          <Card>
            <CardHeader><CardTitle>{t("settings.firmDefault")}</CardTitle></CardHeader>
            <p className="mb-3 text-xs text-navy-400">{t("settings.firmDefaultDescriptionLong")}</p>
            <form onSubmit={saveFirmDefault} className="space-y-3">
              <Input
                label={t("settings.firmReminderWindow")}
                type="number"
                min={1}
                max={30}
                required
                value={firmDefault}
                onChange={event => setFirmDefault(Math.min(30, Math.max(1, Number(event.target.value) || 1)))}
              />
              <Button type="submit" {...lock} variant="secondary" loading={saving}>{t("settings.saveFirmDefault")}</Button>
            </form>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Smartphone className="h-5 w-5 text-gold" /> {t("settings.browserPush")}</CardTitle>
          </CardHeader>
          <p className="mb-4 text-xs text-navy-400">
            {t("settings.browserPushDescription")}
          </p>
          {!canUseWebPush() ? (
            <p className="text-sm text-navy-400">{t("settings.browserPushUnsupported")}</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              <Button variant={pushEnabled ? "secondary" : "primary"} {...lock} onClick={() => void togglePush()} loading={pushBusy}>
                {pushEnabled ? t("settings.disableBrowserPush") : t("settings.enableBrowserPush")}
              </Button>
              {pushEnabled && (
                <Button variant="secondary" {...lock} onClick={() => void testPush()} loading={pushBusy}>{t("settings.sendTest")}</Button>
              )}
            </div>
          )}
          {!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && (
            <p className="mt-3 text-xs text-danger">{t("settings.vapidMissing")}</p>
          )}
        </Card>
        <p className="text-xs text-navy-300">{t("settings.signedInFirm", { firm: firm?.name ?? "your firm" })}</p>
      </div>
    </AppShell>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={event => onChange(event.target.checked)}
        className="mt-1 h-4 w-4 accent-gold"
      />
      <span>
        <span className="block text-sm font-medium text-navy">{label}</span>
        <span className="block text-xs text-navy-400">{description}</span>
      </span>
    </label>
  );
}

export default function NotificationSettingsRoute() {
  return <RouteGuard><NotificationSettingsPage /></RouteGuard>;
}
