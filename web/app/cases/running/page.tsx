"use client";

import { Suspense, useState } from "react";
import { useSearchParams }    from "next/navigation";
import { useTranslation }     from "react-i18next";
import { Search, Filter, X, ChevronDown, ChevronUp } from "lucide-react";

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

// Sort options
const SORT_OPTIONS = [
  { value: "serial_no",    label: "Serial No." },
  { value: "hearing_date", label: "Hearing Date" },
  { value: "next_date",    label: "Next Date" },
  { value: "case_ref_no",  label: "Case Ref" },
];

function RunningCasesPage({ updateCaseId }: { updateCaseId: string | null }) {
  const { t }  = useTranslation();
  const { data: opts, isError: optionsError, refetch: refetchOptions } = useCauseListFilterOptions();

  const [search,       setSearch]       = useState("");
  const [courtNo,      setCourtNo]      = useState("");
  const [judgeFilter,  setJudgeFilter]  = useState("");
  const [caseType,     setCaseType]     = useState("");
  const [representing, setRepresenting] = useState<"plaintiff"|"defendant"|"">("");
  const [nextDateFrom, setNextDateFrom] = useState("");
  const [nextDateTo,   setNextDateTo]   = useState("");
  const [sortBy,       setSortBy]       = useState<CauseListFilter["sortBy"]>("next_date");
  const [sortDir,      setSortDir]      = useState<"asc"|"desc">("asc");
  const [page,         setPage]         = useState(1);
  const [filtersOpen,  setFiltersOpen]  = useState(false);

  const debouncedSearch = useDebounce(search, 350);

  // Count active filters
  const activeFilterCount = [courtNo, judgeFilter, caseType, representing, nextDateFrom, nextDateTo]
    .filter(Boolean).length;

  function resetFilters() {
    setCourtNo(""); setJudgeFilter(""); setCaseType("");
    setRepresenting(""); setNextDateFrom(""); setNextDateTo("");
    setPage(1);
  }

  const filter: CauseListFilter = {
    date:         null,        // null = no date filter (running cases)
    latestOnly:   true,        // one row per case (latest hearing)
    caseId:       updateCaseId ?? undefined,
    search:       debouncedSearch,
    courtNo,
    judgeFilter,
    caseTypeId:   caseType,
    representing,
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
    <AppShell pageTitle="All Running Cases">
      <div className="space-y-4">
        {optionsError && <QueryErrorState onRetry={() => void refetchOptions()} />}

        {/* ── Search + filter toggle ── */}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search party name, case ref, client…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              leftElement={<Search className="w-4 h-4" />}
              rightElement={search ? (
                <button onClick={() => { setSearch(""); setPage(1); }} aria-label="Clear">
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
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="danger" size="sm" className="-mr-1">{activeFilterCount}</Badge>
            )}
          </Button>
        </div>

        {/* ── Filter panel ── */}
        {filtersOpen && (
          <div className="bg-white rounded-xl border border-navy-100 p-4 space-y-4 animate-slide-down">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Select
                label="Court"
                options={courtOptions}
                placeholder="All courts"
                value={courtNo}
                onChange={e => { setCourtNo(e.target.value); setPage(1); }}
              />
              <Select
                label="Judge"
                options={judgeOptions}
                placeholder="All judges"
                value={judgeFilter}
                onChange={e => { setJudgeFilter(e.target.value); setPage(1); }}
              />
              <Select
                label="Case Type"
                options={caseTypeOptions}
                placeholder="All types"
                value={caseType}
                onChange={e => { setCaseType(e.target.value); setPage(1); }}
              />
              <div className="space-y-1.5">
                <label className="label">Representing</label>
                <div className="flex rounded-xl overflow-hidden border border-navy-100">
                  {(["", "plaintiff", "defendant"] as const).map(r => (
                    <button key={r} type="button"
                      onClick={() => { setRepresenting(r); setPage(1); }}
                      className={`flex-1 py-2 text-xs font-semibold transition-colors ${
                        representing === r
                          ? "bg-navy text-white"
                          : "bg-white text-navy-400 hover:bg-navy-50"
                      }`}
                    >
                      {r === "" ? "All" : r === "plaintiff" ? "Plaintiff" : "Defendant"}
                    </button>
                  ))}
                </div>
              </div>
              <DatePicker
                label="Next Date From"
                value={nextDateFrom}
                onChange={e => { setNextDateFrom(e.target.value); setPage(1); }}
              />
              <DatePicker
                label="Next Date To"
                value={nextDateTo}
                onChange={e => { setNextDateTo(e.target.value); setPage(1); }}
              />
            </div>

            {/* Sort + reset */}
            <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-navy-50">
              <div className="flex items-center gap-2">
                <Select
                  label=""
                  options={SORT_OPTIONS}
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as CauseListFilter["sortBy"])}
                  containerClassName="mb-0"
                  className="h-8 text-xs py-1"
                />
                <Button size="sm" variant="secondary"
                  onClick={() => setSortDir(v => v === "asc" ? "desc" : "asc")}
                >
                  {sortDir === "asc" ? "↑ Asc" : "↓ Desc"}
                </Button>
              </div>
              {activeFilterCount > 0 && (
                <Button size="sm" variant="ghost" onClick={resetFilters}
                  leftIcon={<X className="w-3.5 h-3.5" />}
                >
                  Clear Filters
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
          emptyMessage="No running cases match your filters."
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
