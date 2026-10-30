"use client";

import { Suspense, useState } from "react";
import { useSearchParams }    from "next/navigation";
import Link                   from "next/link";
import { useTranslation }     from "react-i18next";
import { Search, Filter, X, ChevronDown, ChevronUp, Plus } from "lucide-react";

import { AppShell }           from "@/components/layout/AppShell";
import { RouteGuard }         from "@/components/shared/RouteGuard";
import { Input }              from "@/components/ui/Input";
import { Select }             from "@/components/ui/Select";
import { DatePicker }         from "@/components/ui/DatePicker";
import { Button }             from "@/components/ui/Button";
import { QueryErrorState }    from "@/components/ui/QueryErrorState";
import { Badge }              from "@/components/ui/Badge";
import { CauseListView }      from "@/components/cases/CauseListView";
import { useCauseListFilterOptions } from "@/hooks/useHearings";
import { useDebounce }        from "@/hooks/useDebounce";
import type { CauseListFilter } from "@/hooks/useHearings";

function RunningCasesPage({ updateCaseId }: { updateCaseId: string | null }) {
  const { t }  = useTranslation();
  const sortOptions = [
    { value: "serial_no", label: t("hearings.serialNo") },
    { value: "hearing_date", label: t("cases.hearingDate") },
    { value: "next_date", label: t("hearings.nextDate") },
    { value: "case_ref_no", label: t("cases.caseReference") },
  ];
  const { data: opts, isError: optionsError, refetch: refetchOptions } = useCauseListFilterOptions();

  const [search,       setSearch]       = useState("");
  const [courtNo,      setCourtNo]      = useState("");
  const [judgeFilter,  setJudgeFilter]  = useState("");
  const [caseType,     setCaseType]     = useState("");
  const [From, setFrom] = useState<"plaintiff"|"defendant"|"">("");
  const [nextDateFrom, setNextDateFrom] = useState("");
  const [nextDateTo,   setNextDateTo]   = useState("");
  const [sortBy,       setSortBy]       = useState<CauseListFilter["sortBy"]>("next_date");
  const [sortDir,      setSortDir]      = useState<"asc"|"desc">("asc");
  const [page,         setPage]         = useState(1);
  const [filtersOpen,  setFiltersOpen]  = useState(false);

  const debouncedSearch = useDebounce(search, 350);

  // Count active filters
  const activeFilterCount = [courtNo, judgeFilter, caseType, From, nextDateFrom, nextDateTo]
    .filter(Boolean).length;

  function resetFilters() {
    setCourtNo(""); setJudgeFilter(""); setCaseType("");
    setFrom(""); setNextDateFrom(""); setNextDateTo("");
    setPage(1);
  }

  const filter: CauseListFilter = {
    status:       "running",
    date:         null,        // null = no date filter (running cases)
    latestOnly:   true,        // one row per case (latest hearing)
    caseId:       updateCaseId ?? undefined,
    search:       debouncedSearch,
    courtNo,
    judgeFilter,
    caseTypeId:   caseType,
    From,
    nextDateFrom,
    nextDateTo,
    page,
    pageSize:     20,
    sortBy,
    sortDir,
  };

  const courtOptions    = (opts?.courts    ?? []).map(c => ({ value: c, label: c }));
  const judgeOptions    = (opts?.judges    ?? []).map(j => ({ value: j, label: j }));
  const caseTypeOptions = (opts?.caseTypes ?? []).map(t => ({ value: t.id, label: t.name }));

  return (
    <AppShell pageTitle={t("cases.running")}>
      <div className="space-y-4">
        {optionsError && <QueryErrorState onRetry={() => void refetchOptions()} />}

        {/* ── Search + filter toggle + New Case ── */}
        <div className="flex items-center gap-2.5">
          <div className="flex-1">
            <Input
              placeholder={t("cases.searchRunningPlaceholder")}
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              leftElement={<Search className="w-4 h-4" />}
              rightElement={search ? (
                <button onClick={() => { setSearch(""); setPage(1); }} aria-label={t("common.clear")}>
                  <X className="w-4 h-4" />
                </button>
              ) : undefined}
            />
          </div>
          <Button
            size="md"
            variant={filtersOpen ? "primary" : "secondary"}
            onClick={() => setFiltersOpen(v => !v)}
            leftIcon={<Filter className="w-4 h-4" />}
            rightIcon={filtersOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          >
            {t("common.filters")}
            {activeFilterCount > 0 && (
              <Badge variant="danger" size="sm" className="-me-1">{activeFilterCount}</Badge>
            )}
          </Button>
          <Link href="/cases/new" className="flex-shrink-0">
            <Button size="md" variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
              <span className="hidden sm:inline">{t("cases.newCase") || "New Case"}</span>
              <span className="sm:hidden">{t("cases.new")}</span>
            </Button>
          </Link>
        </div>

        {/* ── Filter panel ── */}
        {filtersOpen && (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4 animate-slide-down">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Select
                label="Court"
                options={courtOptions}
                placeholder={t("common.allCourts")}
                value={courtNo}
                onChange={e => { setCourtNo(e.target.value); setPage(1); }}
              />
              <Select
                label="Judge"
                options={judgeOptions}
                placeholder={t("common.allJudges")}
                value={judgeFilter}
                onChange={e => { setJudgeFilter(e.target.value); setPage(1); }}
              />
              <Select
                label="Case Type"
                options={caseTypeOptions}
                placeholder={t("common.allTypes")}
                value={caseType}
                onChange={e => { setCaseType(e.target.value); setPage(1); }}
              />
              <div className="space-y-1.5">
                <label className="label">{t("cases.From")}</label>
                <div className="flex rounded-xl overflow-hidden border border-border">
                  {(["", "plaintiff", "defendant"] as const).map(r => (
                    <button key={r} type="button"
                      onClick={() => { setFrom(r); setPage(1); }}
                      className={`flex-1 py-2 text-xs font-semibold transition-colors ${
                        From === r
                          ? "bg-navy text-white shadow-xs"
                          : "bg-white text-navy-600 hover:bg-navy-50"
                      }`}
                    >
                      {r === "" ? t("common.all") : r === "plaintiff" ? t("cases.plaintiff") : t("cases.defendant")}
                    </button>
                  ))}
                </div>
              </div>
              <DatePicker
                label={t("common.nextDateFrom")}
                value={nextDateFrom}
                onChange={e => { setNextDateFrom(e.target.value); setPage(1); }}
              />
              <DatePicker
                label={t("common.nextDateTo")}
                value={nextDateTo}
                onChange={e => { setNextDateTo(e.target.value); setPage(1); }}
              />
            </div>

            {/* Sort + reset */}
            <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-navy-50">
              <div className="flex items-center gap-2">
                <Select
                  label=""
                  options={sortOptions}
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as CauseListFilter["sortBy"])}
                  containerClassName="mb-0"
                  className="h-8 text-xs py-1"
                />
                <Button size="sm" variant="secondary"
                  onClick={() => setSortDir(v => v === "asc" ? "desc" : "asc")}
                >
                  {sortDir === "asc" ? `↑ ${t("common.ascending")}` : `↓ ${t("common.descending")}`}
                </Button>
              </div>
              {activeFilterCount > 0 && (
                <Button size="sm" variant="ghost" onClick={resetFilters}
                  leftIcon={<X className="w-3.5 h-3.5" />}
                >
                  {t("common.clearFilters")}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* ── Cause list view ── */}
        <CauseListView
          filter={filter}
          onPageChange={setPage}
          showQuickEdit={false}
          showUpdateHearing
          autoOpenUpdateCaseId={updateCaseId}
          emptyMessage={t("cases.emptyRunningResults")}
        />

      </div>
    </AppShell>
  );
}

function RunningCasesRouteContent() {
  const params = useSearchParams();
  return <RouteGuard><RunningCasesPage updateCaseId={params.get("updateCaseId")} /></RouteGuard>;
}

export default function RunningCasesRoute() {
  return <Suspense><RunningCasesRouteContent /></Suspense>;
}
