"use client";

import { useState, useCallback } from "react";
import Link                       from "next/link";
import { useRouter }              from "next/navigation";
import { useTranslation }         from "react-i18next";
import { Plus, Search, X, Briefcase, ChevronLeft, ChevronRight } from "lucide-react";

import { Input }        from "@/components/ui/Input";
import { Button }       from "@/components/ui/Button";
import { Table }        from "@/components/ui/Table";
import { EmptyState }   from "@/components/ui/EmptyState";
import { QueryErrorState } from "@/components/ui/QueryErrorState";
import { SkeletonTable, SkeletonCard } from "@/components/ui/Skeleton";
import { CaseStatusBadge, Badge, OutcomeBadge } from "@/components/ui/Badge";
import { CaseCard }     from "./CaseCard";
import { useCases }     from "@/hooks/useCases";
import { fmtDate, isUrdu, textDir } from "@/lib/utils";
import type { CaseStatus, Case } from "@/types/supabase";

interface CasesListProps {
  status:  CaseStatus | "all";
  title?:  string;
}

function Pagination({ page, totalPages, onChange }: {
  page: number; totalPages: number; onChange: (p: number) => void;
}) {
  const { t } = useTranslation();
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-3 mt-6">
      <Button
        size="sm"
        variant="secondary"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        leftIcon={<ChevronLeft className="w-3.5 h-3.5 rtl:rotate-180" />}
      >
        {t("common.previousPage")}
      </Button>
      <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
        {page} / {totalPages}
      </span>
      <Button
        size="sm"
        variant="secondary"
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
        rightIcon={<ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />}
      >
        {t("common.nextPage")}
      </Button>
    </div>
  );
}

export function CasesList({ status, title }: CasesListProps) {
  const { t }   = useTranslation();
  const router  = useRouter();

  const [search, setSearch] = useState("");
  const [page,   setPage]   = useState(1);

  const { data, isLoading, isError, refetch } = useCases({
    status, search, page, pageSize: 20,
  });

  const handleSearch = useCallback((v: string) => { setSearch(v); setPage(1); }, []);

  const isDecided = status === "decided";

  return (
    <div className="space-y-4">
      {/* Search + Add */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <Input
            placeholder={t("common.search")}
            value={search}
            onChange={e => handleSearch(e.target.value)}
            leftElement={<Search className="w-4 h-4" />}
            rightElement={search ? (
              <button onClick={() => handleSearch("")} aria-label={t("common.clear")}>
                <X className="w-4 h-4" />
              </button>
            ) : undefined}
          />
        </div>
        {!isDecided && (
          <Link href="/cases/new" className="flex-shrink-0">
            <Button leftIcon={<Plus className="w-4 h-4" />}>{t("cases.new")}</Button>
          </Link>
        )}
      </div>

      {/* Count */}
      {!isLoading && data && (
        <p className="text-xs text-navy-400">
          {data.total} {data.total === 1 ? "case" : "cases"}
          {search && ` matching "${search}"`}
        </p>
      )}

      {isError && <QueryErrorState onRetry={() => void refetch()} />}

      {/* Mobile cards */}
      <div className="md:hidden">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
          : data?.cases.length === 0
          ? <EmptyState icon={Briefcase} title={t("common.noData")}
              action={!isDecided ? <Link href="/cases/new"><Button leftIcon={<Plus className="w-4 h-4"/>}>{t("cases.new")}</Button></Link> : undefined}
            />
          : <div className="space-y-2">
              {data?.cases.map(c => <CaseCard key={c.id} case_={c} />)}
            </div>
        }
      </div>

      {/* Desktop table */}
      <div className="hidden md:block">
        {isLoading
          ? <SkeletonTable rows={8} />
          : data?.cases.length === 0
          ? <EmptyState icon={Briefcase} title={t("common.noData")}
              action={!isDecided ? <Link href="/cases/new"><Button leftIcon={<Plus className="w-4 h-4"/>}>{t("cases.new")}</Button></Link> : undefined}
            />
          : <Table
              columns={[
                {
                  key: "ref",
                  header: t("cases.caseNo"),
                  render: c => <span className="font-mono text-xs font-semibold text-gold">{c.case_ref_no || "—"}</span>,
                  width: "140px",
                },
                {
                  key: "parties",
                  header: t("common.parties"),
                  render: c => (
                    <span className="text-sm font-medium text-navy"
                      dir={isUrdu(c.plaintiff_name) ? "rtl" : "ltr"}>
                      {c.plaintiff_name} <span className="text-navy-400 font-medium mx-1 text-xs">{t("cases.vs")}</span> {c.defendant_name}
                    </span>
                  ),
                },
                {
                  key: "type",
                  header: t("cases.caseType"),
                  render: c => <Badge variant="neutral" size="sm">{c.case_type?.name ?? "—"}</Badge>,
                  width: "120px",
                },
                {
                  key: "client",
                  header: t("clients.title"),
                  render: c => (
                    <span className="text-xs text-navy-600 font-medium"
                      dir={textDir(c.client?.full_name ?? "")}>
                      {c.client?.full_name ?? "—"}
                    </span>
                  ),
                },
                isDecided
                  ? {
                      key: "outcome",
                      header: t("cases.outcome"),
                      render: c => c.outcome ? <OutcomeBadge outcome={c.outcome} /> : <span className="text-navy-400 text-xs">—</span>,
                      width: "110px",
                    }
                  : {
                      key: "status",
                      header: t("cases.status"),
                      render: c => <CaseStatusBadge status={c.status} />,
                      width: "100px",
                    },
                {
                  key: "actions",
                  header: "",
                  render: c => (
                    <Button size="xs" variant="ghost"
                      onClick={() => router.push(`/cases/view?id=${c.id}`)}>
                      {t("common.view")}
                    </Button>
                  ),
                  width: "80px",
                },
              ]}
              data={data?.cases ?? []}
              keyExtractor={c => c.id}
              onRowClick={c => router.push(`/cases/view?id=${c.id}`)}
            />
        }
      </div>

      <Pagination page={page} totalPages={data?.totalPages ?? 1} onChange={setPage} />
    </div>
  );
}
