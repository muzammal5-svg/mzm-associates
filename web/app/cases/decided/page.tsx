"use client";

import { useState }           from "react";
import Link                   from "next/link";
import { useRouter }          from "next/navigation";
import { useTranslation }     from "react-i18next";
import { Search, Filter, X, ChevronRight, CheckSquare } from "lucide-react";

import { AppShell }           from "@/components/layout/AppShell";
import { RouteGuard }         from "@/components/shared/RouteGuard";
import { Input }              from "@/components/ui/Input";
import { Select }             from "@/components/ui/Select";
import { Button }             from "@/components/ui/Button";
import { Card }               from "@/components/ui/Card";
import { Badge, OutcomeBadge } from "@/components/ui/Badge";
import { Table }              from "@/components/ui/Table";
import { EmptyState }         from "@/components/ui/EmptyState";
import { QueryErrorState }    from "@/components/ui/QueryErrorState";
import { SkeletonCard, SkeletonTable } from "@/components/ui/Skeleton";
import { useCases }           from "@/hooks/useCases";
import { useCaseTypes }       from "@/hooks/useCaseTypes";
import { useCourts }          from "@/hooks/useCourts";
import { useDebounce }        from "@/hooks/useDebounce";
import { fmtDate, isUrdu, textDir } from "@/lib/utils";
import type { Case, CaseOutcome } from "@/types/supabase";

const OUTCOME_OPTIONS = [
  { value: "",          label: "All Outcomes" },
  { value: "won",       label: "Won" },
  { value: "lost",      label: "Lost" },
  { value: "dismissed", label: "Dismissed" },
  { value: "settled",   label: "Settled" },
  { value: "withdrawn", label: "Withdrawn" },
];

const YEAR_OPTIONS = Array.from({ length: 10 }, (_, i) => {
  const y = new Date().getFullYear() - i;
  return { value: String(y), label: String(y) };
});

function Pagination({ page, total, pageSize, onChange }: {
  page: number; total: number; pageSize: number; onChange: (p: number) => void;
}) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <Button size="sm" variant="secondary" disabled={page === 1} onClick={() => onChange(page - 1)}>← Prev</Button>
      <span className="text-sm text-navy-400">{page} / {totalPages}</span>
      <Button size="sm" variant="secondary" disabled={page === totalPages} onClick={() => onChange(page + 1)}>Next →</Button>
    </div>
  );
}

function DecidedCasesPage() {
  const { t }   = useTranslation();
  const router  = useRouter();

  const [search,   setSearch]   = useState("");
  const [outcome,  setOutcome]  = useState<CaseOutcome | "">("");
  const [year,     setYear]     = useState("");
  const [caseType, setCaseType] = useState("");
  const [courtNo,  setCourtNo]  = useState("");
  const [page,     setPage]     = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const debouncedSearch = useDebounce(search, 350);

  const { data: caseTypes = [], isError: caseTypesError, refetch: refetchCaseTypes } = useCaseTypes();

  // Build year filter from decision_date
  const { data, isLoading, isError, refetch } = useCases({
    status:   "decided",
    search:   debouncedSearch,
    outcome,
    decisionYear: year,
    caseTypeId: caseType,
    courtNo,
    page,
    pageSize: 20,
  });

  const filtered = data?.cases ?? [];

  const activeCount = [outcome, year, caseType, courtNo].filter(Boolean).length;

  const caseTypeOptions = [
    { value: "", label: "All Types" },
    ...caseTypes.map(ct => ({ value: ct.id, label: ct.name })),
  ];

  return (
    <AppShell pageTitle={t("cases.decided")} showBack>
      <div className="space-y-4">

        {/* Search + filter toggle */}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search parties, case ref…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              leftElement={<Search className="w-4 h-4" />}
              rightElement={search ? (
                <button onClick={() => { setSearch(""); setPage(1); }}><X className="w-4 h-4" /></button>
              ) : undefined}
            />
          </div>
          <Button size="md" variant={showFilters ? "primary" : "secondary"}
            onClick={() => setShowFilters(v => !v)}
            leftIcon={<Filter className="w-4 h-4" />}>
            Filters {activeCount > 0 && <Badge variant="danger" size="sm">{activeCount}</Badge>}
          </Button>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="bg-white rounded-xl border border-navy-100 p-4 animate-slide-down">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Select label="Outcome" options={OUTCOME_OPTIONS}
                value={outcome} onChange={e => { setOutcome(e.target.value as CaseOutcome | ""); setPage(1); }} />
              <Select label="Year" options={[{ value: "", label: "All Years" }, ...YEAR_OPTIONS]}
                value={year} onChange={e => { setYear(e.target.value); setPage(1); }} />
              <Select label="Case Type" options={caseTypeOptions}
                value={caseType} onChange={e => { setCaseType(e.target.value); setPage(1); }} />
              <Input label="Court / No." placeholder="Filter by court"
                value={courtNo} onChange={e => { setCourtNo(e.target.value); setPage(1); }} />
            </div>
            {activeCount > 0 && (
              <div className="mt-3 flex justify-end">
                <Button size="sm" variant="ghost" leftIcon={<X className="w-3.5 h-3.5" />}
                  onClick={() => { setOutcome(""); setYear(""); setCaseType(""); setCourtNo(""); setPage(1); }}>
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Count */}
        {!isLoading && data && (
          <p className="text-xs text-navy-400">
            {data.total} decided {data.total === 1 ? "case" : "cases"}
            {debouncedSearch && ` matching "${debouncedSearch}"`}
          </p>
        )}

        {isError && <QueryErrorState onRetry={() => void refetch()} />}
        {caseTypesError && <QueryErrorState onRetry={() => void refetchCaseTypes()} />}

        {/* Mobile cards */}
        <div className="md:hidden">
          {isLoading
            ? Array.from({length:5}).map((_,i)=><SkeletonCard key={i}/>)
            : filtered.length === 0
            ? <EmptyState icon={CheckSquare} title="No decided cases" message="Cases marked as decided will appear here." />
            : <div className="space-y-2">
                {filtered.map(c => (
                  <Link key={c.id} href={`/cases/view?id=${c.id}`}>
                    <Card hover className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-mono text-gold font-semibold">{c.case_ref_no}</p>
                        <p className="text-sm font-medium text-navy mt-0.5 line-clamp-2"
                          dir={isUrdu(c.plaintiff_name) ? "rtl" : "ltr"}>
                          {c.plaintiff_name} <span className="text-navy-300 text-xs">vs</span> {c.defendant_name}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          {c.outcome && <OutcomeBadge outcome={c.outcome} />}
                          {c.decision_date && (
                            <span className="text-xs text-navy-400">{fmtDate(c.decision_date)}</span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-navy-200 flex-shrink-0 mt-1" />
                    </Card>
                  </Link>
                ))}
              </div>
          }
        </div>

        {/* Desktop table */}
        <div className="hidden md:block">
          {isLoading
            ? <SkeletonTable rows={8} />
            : filtered.length === 0
            ? <EmptyState icon={CheckSquare} title="No decided cases" />
            : <Table
                columns={[
                  {
                    key: "ref",
                    header: t("cases.caseNo"),
                    render: c => <span className="font-mono text-xs font-semibold text-gold">{c.case_ref_no}</span>,
                    width: "130px",
                  },
                  {
                    key: "parties",
                    header: "Parties",
                    render: c => (
                      <span className="text-sm font-medium text-navy"
                        dir={isUrdu(c.plaintiff_name) ? "rtl" : "ltr"}>
                        {c.plaintiff_name} <span className="text-navy-300 text-xs">vs</span> {c.defendant_name}
                      </span>
                    ),
                  },
                  {
                    key: "type",
                    header: t("cases.caseType"),
                    render: c => <Badge variant="neutral" size="sm">{c.case_type?.name ?? "—"}</Badge>,
                    width: "110px",
                  },
                  {
                    key: "outcome",
                    header: t("cases.outcome"),
                    render: c => c.outcome ? <OutcomeBadge outcome={c.outcome} /> : <span className="text-navy-300 text-xs">—</span>,
                    width: "110px",
                  },
                  {
                    key: "decided",
                    header: t("cases.decidedDate"),
                    render: c => <span className="text-xs text-navy-400">{c.decision_date ? fmtDate(c.decision_date) : "—"}</span>,
                    width: "110px",
                  },
                  {
                    key: "client",
                    header: t("clients.title"),
                    render: c => (
                      <span className="text-xs text-navy-400" dir={textDir(c.client?.full_name ?? "")}>
                        {c.client?.full_name ?? "—"}
                      </span>
                    ),
                  },
                  {
                    key: "actions",
                    header: "",
                    render: c => (
                      <Button size="xs" variant="ghost" onClick={() => router.push(`/cases/view?id=${c.id}`)}>
                        {t("common.view")}
                      </Button>
                    ),
                    width: "70px",
                  },
                ]}
                data={filtered}
                keyExtractor={c => c.id}
                onRowClick={c => router.push(`/cases/view?id=${c.id}`)}
              />
          }
        </div>

        <Pagination page={page} total={data?.total ?? 0} pageSize={20} onChange={setPage} />
      </div>
    </AppShell>
  );
}

export default function DecidedCasesRoute() {
  return <RouteGuard><DecidedCasesPage /></RouteGuard>;
}
