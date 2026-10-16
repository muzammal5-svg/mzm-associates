"use client";

import { Suspense, useState }   from "react";
import { useSearchParams }      from "next/navigation";
import { useTranslation }       from "react-i18next";
import Link                     from "next/link";
import {
  Edit, Plus, Briefcase, ToggleLeft, ToggleRight, ChevronRight,
} from "lucide-react";

import { AppShell }             from "@/components/layout/AppShell";
import { RouteGuard }           from "@/components/shared/RouteGuard";
import { Card }                 from "@/components/ui/Card";
import { Badge, CaseStatusBadge, OutcomeBadge } from "@/components/ui/Badge";
import { Button }               from "@/components/ui/Button";
import { Tabs, TabList, TabTrigger, TabPanel } from "@/components/ui/Tabs";
import { DocumentsModule }      from "@/components/documents/DocumentsModule";
import { SkeletonCard }         from "@/components/ui/Skeleton";
import { EmptyState }           from "@/components/ui/EmptyState";
import { QueryErrorState }      from "@/components/ui/QueryErrorState";
import { ConfirmDialog }        from "@/components/ui/Modal";
import { PageLoader }           from "@/components/ui/LoadingSpinner";
import { useToast }             from "@/components/ui/Toast";
import {
  useClient, useClientCaseCounts, useToggleClientActive,
} from "@/hooks/useClients";
import { useQuery }             from "@tanstack/react-query";
import { db }                   from "@/lib/supabase/client";
import { formatPhoneDisplay }   from "@/lib/phone";
import { fmtDate, isUrdu, textDir } from "@/lib/utils";
import { useRoleGuard }         from "@/hooks/useRoleGuard";
import type { Case }            from "@/types/supabase";

// ─── Cases tab with Running / Decided sub-tabs ────────────────────────────────
function CasesTab({ clientId }: { clientId: string }) {
  const { t }    = useTranslation();
  const [sub, setSub] = useState<"running" | "decided">("running");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["client-cases", clientId, sub],
    queryFn: async () => {
      const { data, error } = await db.cases()
        .select("*, case_type:case_types(name)")
        .eq("client_id", clientId)
        .eq("status", sub)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as (Case & { case_type: { name: string } | null })[]) ?? [];
    },
    staleTime: 1000 * 60,
  });

  if (isError) return <QueryErrorState onRetry={() => void refetch()} />;

  return (
    <div className="space-y-3">
      {/* Sub-tab toggle */}
      <div className="flex rounded-xl overflow-hidden border border-navy-100">
        {(["running", "decided"] as const).map(s => (
          <button
            key={s}
            onClick={() => setSub(s)}
            className={`flex-1 py-2 text-xs font-semibold transition-colors ${
              sub === s ? "bg-navy text-white" : "bg-white text-navy-400 hover:bg-navy-50"
            }`}
          >
            {s === "running" ? t("cases.running") : t("cases.decided")}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-2">{[1, 2, 3].map(i => <SkeletonCard key={i} />)}</div>
      ) : !data?.length ? (
        <EmptyState
          icon={Briefcase}
          title={`${t(sub === "running" ? "cases.running" : "cases.decided")} cases`}
          action={
            sub === "running" ? (
              <Link href={`/cases/new?clientId=${clientId}`}>
                <Button leftIcon={<Plus className="w-4 h-4" />} size="sm">
                  {t("cases.new")}
                </Button>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-2">
          {data.map(c => (
            <Link key={c.id} href={`/cases/view?id=${c.id}`}>
              <Card hover className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono text-gold font-semibold">{c.case_ref_no}</p>
                  <p
                    className="text-sm font-medium text-navy truncate mt-0.5"
                    dir={textDir(c.plaintiff_name)}
                  >
                    {c.plaintiff_name}{" "}
                    <span className="text-navy-300 text-xs">{t("cases.vs")}</span>{" "}
                    {c.defendant_name}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    <Badge variant="neutral" size="sm">{c.case_type?.name ?? "—"}</Badge>
                    {c.status === "decided" && c.outcome && (
                      <OutcomeBadge outcome={c.outcome} />
                    )}
                    {c.decision_date && (
                      <span className="text-[11px] text-navy-300">{fmtDate(c.decision_date)}</span>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-navy-200 flex-shrink-0" />
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Details row ──────────────────────────────────────────────────────────────
function DetailRow({ label, value, isUrduText = false }: {
  label: string; value: string | null; isUrduText?: boolean;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-navy-50 last:border-0">
      <span className="text-sm text-navy-400 flex-shrink-0 w-32">{label}</span>
      <span
        className={`text-sm text-navy text-end flex-1 ${isUrduText && isUrdu(value) ? "font-urdu" : ""}`}
        dir={isUrduText ? textDir(value) : "ltr"}
      >
        {value}
      </span>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
function ClientViewPage() {
  const { t }           = useTranslation();
  const toast           = useToast();
  const params          = useSearchParams();
  const id              = params.get("id");
  const { canWrite, canDelete } = useRoleGuard();

  const { data: client, isLoading, isError, refetch } = useClient(id);
  const { data: counts, isError: countsError, refetch: refetchCounts } = useClientCaseCounts(id);
  const toggleActive                 = useToggleClientActive(id ?? "");
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);

  async function handleToggleActive() {
    if (!client) return;
    if (client.is_active && (counts?.total ?? 0) > 0 && !confirmDeactivate) {
      setConfirmDeactivate(true);
      return;
    }
    try {
      await toggleActive.mutateAsync(!client.is_active);
      toast.success(client.is_active ? t("common.deactivate") : t("common.activate"));
    } catch {
      toast.error(t("common.error"));
    }
    setConfirmDeactivate(false);
  }

  if (isLoading) return <AppShell showBack><PageLoader /></AppShell>;
  if (isError) return <AppShell showBack><QueryErrorState onRetry={() => void refetch()} /></AppShell>;
  if (countsError) return <AppShell showBack><QueryErrorState onRetry={() => void refetchCounts()} /></AppShell>;
if (!client) return <AppShell showBack><EmptyState title={t("common.clientNotFound")} /></AppShell>;

  return (
    <AppShell
      pageTitle={client.full_name}
      showBack
      headerActions={
        canWrite ? (
          <Link href={`/clients/edit?id=${client.id}`}>
            <Button size="sm" variant="secondary" leftIcon={<Edit className="w-4 h-4" />}>
              {t("common.edit")}
            </Button>
          </Link>
        ) : undefined
      }
    >
      <div className="max-w-2xl mx-auto space-y-5">

        {/* Profile header */}
        <Card className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gold/10 border-2 border-gold/20 flex items-center justify-center flex-shrink-0">
            <span className={`text-2xl font-bold text-gold leading-none ${isUrdu(client.full_name) ? "font-urdu" : ""}`}>
              {client.full_name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p
              className="text-lg font-heading font-semibold text-navy"
              dir={textDir(client.full_name)}
              lang={isUrdu(client.full_name) ? "ur" : "en"}
            >
              {client.full_name}
            </p>
            {client.city && <p className="text-sm text-navy-400">{client.city}</p>}
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {client.is_active
                ? <Badge variant="success" dot>{t("common.active")}</Badge>
                : <Badge variant="neutral">{t("common.deactivate")}</Badge>
              }
              {counts && counts.running > 0 && (
                <Badge variant="info">{counts.running} {t("cases.running")}</Badge>
              )}
              {counts && counts.decided > 0 && (
                <Badge variant="neutral">{counts.decided} {t("cases.decided")}</Badge>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <Link href={`/cases/new?clientId=${client.id}`}>
              <Button size="xs" leftIcon={<Plus className="w-3.5 h-3.5" />}>{t("common.case")}</Button>
            </Link>
            {canDelete && (
              <button
                onClick={handleToggleActive}
                aria-label={client.is_active ? t("common.deactivate") : t("common.activate")}
                className="text-navy-300 hover:text-navy transition-colors"
              >
                {client.is_active
                  ? <ToggleRight className="w-6 h-6 text-success" />
                  : <ToggleLeft  className="w-6 h-6" />
                }
              </button>
            )}
          </div>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="details">
          <TabList>
            <TabTrigger value="details">{t("settings.about")}</TabTrigger>
            <TabTrigger value="cases" count={counts?.total}>{t("common.tabCases")}</TabTrigger>
            <TabTrigger value="documents">{t("common.tabDocuments")}</TabTrigger>
          </TabList>

          <TabPanel value="details">
            <Card padding="sm">
              <DetailRow label={t("clients.name")}              value={client.full_name}           isUrduText />
              <DetailRow label={t("clients.fatherHusbandName")} value={client.father_husband_name} isUrduText />
              <DetailRow label={t("clients.cnic")}              value={client.cnic} />
              <DetailRow label={t("clients.phone")}             value={client.phone ? formatPhoneDisplay(client.phone) : null} />
              <DetailRow label={t("clients.whatsapp")}
                value={client.whatsapp && client.whatsapp !== client.phone ? formatPhoneDisplay(client.whatsapp) : null}
              />
              <DetailRow label={t("clients.email")}   value={client.email} />
              <DetailRow label={t("clients.city")}    value={client.city} />
              <DetailRow label={t("clients.address")} value={client.address} />
              {canWrite && (
                <div className="pt-3">
                  <Link href={`/clients/edit?id=${client.id}`} className="w-full">
                    <Button variant="secondary" fullWidth leftIcon={<Edit className="w-4 h-4" />}>
                      {t("common.edit")}
                    </Button>
                  </Link>
                </div>
              )}
            </Card>
          </TabPanel>

          <TabPanel value="cases">
            <CasesTab clientId={client.id} />
          </TabPanel>

          <TabPanel value="documents">
            <DocumentsModule clientId={client.id} />
          </TabPanel>
        </Tabs>

        <ConfirmDialog
          open={confirmDeactivate}
          onClose={() => setConfirmDeactivate(false)}
          onConfirm={handleToggleActive}
          title={t("common.deactivate")}
          message={t("common.deactivateConfirm", { count: counts?.total })}
          confirmLabel={t("common.deactivate")}
          confirmVariant="danger"
          loading={toggleActive.isPending}
        />
      </div>
    </AppShell>
  );
}

export default function ClientViewRoute() {
  return (
    <RouteGuard>
      <Suspense><ClientViewPage /></Suspense>
    </RouteGuard>
  );
}
