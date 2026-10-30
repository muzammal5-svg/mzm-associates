"use client";

import { useState, useCallback } from "react";
import Link                       from "next/link";
import { useTranslation }         from "react-i18next";
import { Plus, Search, Users, X } from "lucide-react";
import { useRouter }               from "next/navigation";

import { AppShell }        from "@/components/layout/AppShell";
import { RouteGuard }      from "@/components/shared/RouteGuard";
import { Button }          from "@/components/ui/Button";
import { Input }           from "@/components/ui/Input";
import { Badge }           from "@/components/ui/Badge";
import { EmptyState }      from "@/components/ui/EmptyState";
import { QueryErrorState } from "@/components/ui/QueryErrorState";
import { SkeletonCard }    from "@/components/ui/Skeleton";
import { SkeletonTable }   from "@/components/ui/Skeleton";
import { Table }           from "@/components/ui/Table";
import { ClientCard }      from "@/components/clients/ClientCard";
import { useClients, useClientCaseCounts } from "@/hooks/useClients";
import { formatPhoneDisplay } from "@/lib/phone";
import { cn, isUrdu, textDir } from "@/lib/utils";
import type { Client }     from "@/types/supabase";

// ─── Mobile card with case count ─────────────────────────────────────────────
function ClientCardWithCount({ client }: { client: Client }) {
  const { data } = useClientCaseCounts(client.id);
  return <ClientCard client={client} caseCount={data?.running} />;
}

// ─── Filter toggle ────────────────────────────────────────────────────────────
type ActiveFilter = "all" | "active" | "inactive";

function FilterPill({
  value, current, label, count, onClick,
}: {
  value: ActiveFilter; current: ActiveFilter;
  label: string; count?: number;
  onClick: () => void;
}) {
  const active = value === current;
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors",
        active
          ? "bg-navy text-white border-navy shadow-xs"
          : "bg-white text-navy-600 border-border hover:border-navy hover:text-navy"
      )}
    >
      {label}
      {count !== undefined && (
        <span className={cn(
          "text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none",
          active ? "bg-white/20 text-white" : "bg-navy-100 text-navy-600"
        )}>
          {count}
        </span>
      )}
    </button>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────
function Pagination({
  page, totalPages, onChange,
}: {
  page: number; totalPages: number; onChange: (p: number) => void;
}) {
  const { t } = useTranslation();
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <Button
        size="sm" variant="secondary"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
      >
        ← {t("common.previousPage")}
      </Button>
      <span className="text-sm text-navy-400">
        {page} / {totalPages}
      </span>
      <Button
        size="sm" variant="secondary"
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
      >
        {t("common.nextPage")} →
      </Button>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
function ClientsPage() {
  const { t }    = useTranslation();
  const router   = useRouter();

  const [search,       setSearch]       = useState("");
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("all");
  const [page,         setPage]         = useState(1);

  const isActiveVal = activeFilter === "all" ? null : activeFilter === "active";

  const { data, isLoading, isError, refetch } = useClients({
    search, isActive: isActiveVal, page, pageSize: 20,
  });

  // Also fetch counts for filters
  const { data: allData, isError: allCountError, refetch: refetchAll } = useClients({ isActive: null, pageSize: 1 });
  const { data: activeData, isError: activeCountError, refetch: refetchActive } = useClients({ isActive: true, pageSize: 1 });

  const handleSearch = useCallback((v: string) => {
    setSearch(v);
    setPage(1);
  }, []);

  const handleFilter = useCallback((f: ActiveFilter) => {
    setActiveFilter(f);
    setPage(1);
  }, []);

  return (
    <AppShell
      pageTitle={t("clients.title")}
      headerActions={
        <Link href="/clients/new">
          <Button size="sm" leftIcon={<Plus className="w-4 h-4" />}>
            {t("clients.new")}
          </Button>
        </Link>
      }
    >
      <div className="space-y-4">

        {/* ── Search + Add ── */}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <Input
              placeholder={t("common.search")}
              value={search}
              onChange={e => handleSearch(e.target.value)}
              leftElement={<Search className="w-4 h-4" />}
              rightElement={search ? (
                <button onClick={() => handleSearch("")} aria-label={t("common.clearSearch")}>
                  <X className="w-4 h-4" />
                </button>
              ) : undefined}
            />
          </div>
          {/* Desktop add button already in header; show on mobile too */}
          <Link href="/clients/new" className="md:hidden">
            <Button size="md" leftIcon={<Plus className="w-4 h-4" />}>
              {t("common.addNew")}
            </Button>
          </Link>
        </div>

        {/* ── Filter pills ── */}
        <div className="flex gap-2 flex-wrap">
          <FilterPill value="all"      current={activeFilter} label={t("common.all")}      count={allData?.total}    onClick={() => handleFilter("all")} />
          <FilterPill value="active"   current={activeFilter} label={t("common.active")}   count={activeData?.total} onClick={() => handleFilter("active")} />
          <FilterPill value="inactive" current={activeFilter} label={t("common.deactivate")}                           onClick={() => handleFilter("inactive")} />
        </div>

        {/* ── Result count ── */}
        {!isLoading && data && (
          <p className="text-xs text-navy-400">
            {data.total} {data.total === 1 ? t("common.client") : t("common.clients")} {t("common.found")}
            {search && ` for "${search}"`}
          </p>
        )}

        {/* ── Error ── */}
        {(isError || allCountError || activeCountError) && (
          <QueryErrorState onRetry={() => void Promise.all([refetch(), refetchAll(), refetchActive()])} />
        )}

        {/* ── MOBILE: card list ── */}
        <div className="md:hidden">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : data?.clients.length === 0 ? (
            <EmptyState
              icon={Users}
              title={t("common.noData")}
              message={search ? t("common.noClientsMatch", { search }) : t("common.getStarted")}
              action={
                <Link href="/clients/new">
                  <Button leftIcon={<Plus className="w-4 h-4" />}>{t("clients.new")}</Button>
                </Link>
              }
            />
          ) : (
            <div className="space-y-2">
              {data?.clients.map(c => (
                <ClientCardWithCount key={c.id} client={c} />
              ))}
            </div>
          )}
        </div>

        {/* ── DESKTOP: data table ── */}
        <div className="hidden md:block">
          {isLoading ? (
            <SkeletonTable rows={8} />
          ) : data?.clients.length === 0 ? (
            <EmptyState
              icon={Users}
              title={t("common.noData")}
              message={search ? t("common.noClientsMatch", { search }) : t("common.getStarted")}
              action={
                <Link href="/clients/new">
                  <Button leftIcon={<Plus className="w-4 h-4" />}>{t("clients.new")}</Button>
                </Link>
              }
            />
          ) : (
            <Table
              columns={[
                {
                  key: "name",
                  header: t("clients.name"),
                  render: (c) => (
                    <span
                      className="font-medium text-navy"
                      dir={textDir(c.full_name)}
                      lang={isUrdu(c.full_name) ? "ur" : undefined}
                    >
                      {c.full_name}
                    </span>
                  ),
                },
                {
                  key: "cnic",
                  header: t("clients.cnic"),
                  render: (c) => (
                    <span className="font-mono text-xs text-navy-400">
                      {c.cnic ?? "—"}
                    </span>
                  ),
                },
                {
                  key: "phone",
                  header: t("clients.phone"),
                  render: (c) => (
                    <span className="text-sm text-navy-400">
                      {c.phone ? formatPhoneDisplay(c.phone) : "—"}
                    </span>
                  ),
                },
                {
                  key: "city",
                  header: t("clients.city"),
                  render: (c) => <span className="text-sm text-navy-400">{c.city ?? "—"}</span>,
                },
                {
                  key: "cases",
                  header: t("cases.cases"),
                  render: (c) => <CaseCountCell clientId={c.id} />,
                },
                {
                  key: "status",
                  header: t("cases.status"),
                  render: (c) => c.is_active
                    ? <Badge variant="success" dot>{t("common.active")}</Badge>
                    : <Badge variant="neutral">{t("common.deactivate")}</Badge>,
                },
                {
                  key: "actions",
                  header: "",
                  render: (c) => (
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => router.push(`/clients/view?id=${c.id}`)}
                    >
                      {t("common.view")}
                    </Button>
                  ),
                },
              ]}
              data={data?.clients ?? []}
              keyExtractor={(c) => c.id}
              onRowClick={(c) => router.push(`/clients/view?id=${c.id}`)}
            />
          )}
        </div>

        {/* ── Pagination ── */}
        <Pagination
          page={page}
          totalPages={data?.totalPages ?? 1}
          onChange={setPage}
        />

      </div>
    </AppShell>
  );
}

// Inline case count cell for the table (avoids prop drilling)
function CaseCountCell({ clientId }: { clientId: string }) {
  const { t } = useTranslation();
  const { data } = useClientCaseCounts(clientId);
  if (!data) return <span className="text-navy-400 text-xs">—</span>;
  return (
    <div className="flex items-center gap-1.5">
      {data.running > 0 && (
        <Badge variant="info" size="sm">{data.running} {t("cases.running")}</Badge>
      )}
      {data.decided > 0 && (
        <Badge variant="neutral" size="sm">{data.decided} {t("cases.decided")}</Badge>
      )}
      {data.total === 0 && <span className="text-navy-400 text-xs">{t("common.noData")}</span>}
    </div>
  );
}

export default function ClientsPageRoute() {
  return <RouteGuard><ClientsPage /></RouteGuard>;
}
