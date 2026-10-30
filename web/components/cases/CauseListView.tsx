"use client";

import { useEffect, useRef, useState } from "react";
import Link                  from "next/link";
import { useTranslation }    from "react-i18next";
import { Edit2, ChevronRight, ChevronLeft, Gavel, CalendarPlus, Calendar } from "lucide-react";

import { Card }              from "@/components/ui/Card";
import { Badge }             from "@/components/ui/Badge";
import { EmptyState }        from "@/components/ui/EmptyState";
import { QueryErrorState }   from "@/components/ui/QueryErrorState";
import { SkeletonCard }      from "@/components/ui/Skeleton";
import { Button }            from "@/components/ui/Button";
import { useMutationLock }   from "@/components/shared/MutatingButton";
import { UpdateHearingSheet } from "./UpdateHearingSheet";
import { QuickEditSheet }    from "./QuickEditSheet";
import { useCauseList, type CauseListFilter } from "@/hooks/useHearings";
import { fmtDate, isUrdu }   from "@/lib/utils";
import type { CauseListRow } from "@/types/supabase";

// ─── Mobile card ──────────────────────────────────────────────────────────────
function CauseCard({
  row, onQuickEdit, onUpdateHearing,
}: {
  row: CauseListRow;
  onQuickEdit?: (r: CauseListRow) => void;
  onUpdateHearing?: (r: CauseListRow) => void;
}) {
  const { t } = useTranslation();
  const { lock } = useMutationLock();
  return (
    <Card className="space-y-2.5">
      {/* Top row: serial + ref + status */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="min-w-[32px] max-w-[48px] h-8 px-1 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
            <span className="text-xs font-bold text-gold font-mono truncate whitespace-nowrap">{row.serial_no ?? "—"}</span>
          </div>
          <div>
            <p className="text-xs font-mono text-gold font-semibold leading-tight">{row.case_ref_no || "—"}</p>
            <Badge variant="navy" size="sm">{row.case_type_name}</Badge>
          </div>
        </div>
        <div className="flex gap-1">
          {onQuickEdit && (
            <button onClick={() => onQuickEdit(row)} {...lock}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-navy-400 hover:bg-navy-50 hover:text-gold transition-colors disabled:opacity-40"
              aria-label={t("common.quickEdit")}
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}
          {onUpdateHearing && (
            <button onClick={() => onUpdateHearing(row)} {...lock}
              className="btn-secondary text-xs px-2 py-1 min-h-0 h-7 disabled:opacity-40"
              aria-label={t("hearings.updateHearing")}
            >
              {t("common.update")}
            </button>
          )}
        </div>
      </div>

      {/* Parties */}
      <Link href={`/cases/view?id=${row.case_id}`}>
        <p
          className="text-sm font-semibold text-navy leading-snug hover:text-gold transition-colors"
          dir={isUrdu(row.plaintiff_name ?? "") || isUrdu(row.defendant_name ?? "") ? "rtl" : "ltr"}
        >
          {row.plaintiff_name}
          <span className="text-navy-400 font-medium mx-1 text-xs">{t("common.vs")}</span>
          {row.defendant_name}
        </p>
      </Link>

      {/* Court / judge */}
      <div className="flex items-center gap-3 text-xs text-navy-500 flex-wrap font-medium">
        {row.hearing_court_no && (
          <span className="flex items-center gap-1">
            <Gavel className="w-3 h-3 text-navy-400" /> {t("cases.court")} {row.hearing_court_no}
          </span>
        )}
        {row.hearing_judge && <span>{row.hearing_judge}</span>}
        {(() => {
          const rep = row.From ?? (row as any).representing;
          return rep ? (
            <Badge variant={rep === "plaintiff" ? "gold" : "info"} size="sm">
              {rep === "plaintiff" ? t("cases.plaintiff") : t("cases.defendant")}
            </Badge>
          ) : null;
        })()}
      </div>

      {/* Proceedings */}
      {row.current_proceeding && (
        <p className="text-xs text-navy-600 line-clamp-2 leading-relaxed">{row.current_proceeding}</p>
      )}

      {/* Dates row */}
      <div className="flex items-center justify-between text-xs border-t border-slate-100 pt-2.5">
        <span className="text-slate-500">
          {t("hearings.previousDate")}: <span className="text-navy font-semibold">{row.previous_date ? fmtDate(row.previous_date) : "—"}</span>
        </span>
        <span className="text-slate-500 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-gold-600" />
          <span className={`font-semibold ${row.next_date ? "text-gold-700 font-bold" : "text-slate-400"}`}>
            {row.next_date ? fmtDate(row.next_date) : "—"}
          </span>
        </span>
      </div>
    </Card>
  );
}

// ─── Desktop table row ────────────────────────────────────────────────────────
function TableRow({
  row, onQuickEdit, onUpdateHearing,
}: {
  row: CauseListRow;
  onQuickEdit?: (r: CauseListRow) => void;
  onUpdateHearing?: (r: CauseListRow) => void;
}) {
  const { t } = useTranslation();
  const { lock } = useMutationLock();
  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50/75 transition-colors">
      <td className="px-3.5 py-3.5 text-center">
        <span className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-lg text-xs font-bold font-mono bg-gold/10 text-gold-700 border border-gold/25">
          {row.serial_no ?? "—"}
        </span>
      </td>
      <td className="px-3.5 py-3.5 text-xs text-slate-500 font-medium">
        {row.previous_date ? fmtDate(row.previous_date) : "—"}
      </td>
      <td className="px-3.5 py-3.5">
        <Link href={`/cases/view?id=${row.case_id}`}
          className="group block hover:text-gold transition-colors">
          <p className="text-sm font-semibold text-navy leading-snug group-hover:text-gold transition-colors"
            dir={isUrdu(row.plaintiff_name ?? "") || isUrdu(row.defendant_name ?? "") ? "rtl" : "ltr"}>
            {row.plaintiff_name} <span className="text-slate-400 font-normal mx-1 text-xs">{t("common.vs")}</span> {row.defendant_name}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[11px] text-gold-700 font-mono font-medium">{row.case_ref_no || "—"}</span>
            {row.case_type_name && <span className="text-[10px] text-slate-400">• {row.case_type_name}</span>}
          </div>
        </Link>
      </td>
      <td className="px-3.5 py-3.5">
        {(() => {
          const rep = row.From ?? (row as any).representing;
          return rep ? (
            <Badge variant={rep === "plaintiff" ? "gold" : "info"} size="sm" dot>
              {rep === "plaintiff" ? t("cases.plaintiff") : t("cases.defendant")}
            </Badge>
          ) : <span className="text-slate-400 text-xs">—</span>;
        })()}
      </td>
      <td className="px-3.5 py-3.5 text-xs text-slate-600 max-w-[150px]">
        <p className="line-clamp-2 leading-relaxed">{row.current_proceeding ?? "—"}</p>
      </td>
      <td className="px-3.5 py-3.5 text-xs text-slate-600 max-w-[150px]">
        <p className="line-clamp-2 leading-relaxed">{row.next_proceeding ?? "—"}</p>
      </td>
      <td className="px-3.5 py-3.5">
        <span className={`inline-flex items-center gap-1 text-xs font-semibold ${row.next_date ? "text-gold-700 font-bold" : "text-slate-400"}`}>
          {row.next_date ? (
            <>
              <Calendar className="w-3.5 h-3.5 text-gold-600" />
              {fmtDate(row.next_date)}
            </>
          ) : "—"}
        </span>
      </td>
      <td className="px-3.5 py-3.5 text-xs text-slate-600">
        <span className="font-semibold text-navy">{row.hearing_court_no ?? "—"}</span>
        {row.hearing_judge && <p className="text-[11px] text-slate-400 truncate max-w-[110px] mt-0.5">{row.hearing_judge}</p>}
      </td>
      <td className="px-3.5 py-3.5">
        <div className="flex items-center gap-1.5 justify-end">
          {onQuickEdit && (
            <button onClick={() => onQuickEdit(row)} {...lock}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-gold hover:bg-gold/10 transition-colors disabled:opacity-40"
              aria-label={t("common.quickEdit")}
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}
          {onUpdateHearing && (
            <button
              onClick={() => onUpdateHearing(row)}
              {...lock}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gold-700 bg-gold/10 hover:bg-gold/20 border border-gold/30 hover:border-gold/50 transition-all duration-150 whitespace-nowrap disabled:opacity-40"
              aria-label={t("hearings.updateHearing")}
            >
              <CalendarPlus className="w-3.5 h-3.5 text-gold-600" />
              <span>{t("common.update")}</span>
              <ChevronRight className="w-3 h-3 text-gold-500 rtl:rotate-180" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────
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

// ─── Main component ───────────────────────────────────────────────────────────

export interface CauseListViewProps {
  filter:          CauseListFilter;
  onPageChange?:   (p: number) => void;
  showQuickEdit?:  boolean;   // inline serial/proceeding edit
  showUpdateHearing?: boolean; // full update hearing flow
  emptyMessage?:   string;
  autoOpenUpdateCaseId?: string | null;
  className?:      string;
}

export function CauseListView({
  filter,
  onPageChange,
  showQuickEdit    = false,
  showUpdateHearing = true,
  emptyMessage,
  autoOpenUpdateCaseId,
  className,
}: CauseListViewProps) {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch } = useCauseList(filter);

  const [quickEditRow,   setQuickEditRow]   = useState<CauseListRow | null>(null);
  const [updateHearingRow, setUpdateHearingRow] = useState<CauseListRow | null>(null);
  const autoOpenedCaseId = useRef<string | null>(null);

  useEffect(() => {
    if (!autoOpenUpdateCaseId) {
      autoOpenedCaseId.current = null;
      return;
    }
    if (autoOpenedCaseId.current === autoOpenUpdateCaseId) return;
    const row = data?.rows.find(item => item.case_id === autoOpenUpdateCaseId);
    if (row) {
      autoOpenedCaseId.current = autoOpenUpdateCaseId;
      setUpdateHearingRow(row);
    }
  }, [autoOpenUpdateCaseId, data]);

  if (isLoading) return (
    <div className="space-y-2">
      {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  );

  if (isError) return <QueryErrorState onRetry={() => void refetch()} className={className} />;

  if (!data?.rows.length) return (
    <EmptyState
      icon={Gavel}
      title={emptyMessage ?? t("common.noData")}
      className="py-12"
    />
  );

  const page       = filter.page  ?? 1;
  const totalPages = data.totalPages;

  return (
    <div className={className}>
      {/* ── Mobile card list ── */}
      <div className="md:hidden space-y-2">
        {data.rows.map(row => (
          <CauseCard
            key={row.hearing_id ?? row.case_id}
            row={row}
            onQuickEdit={showQuickEdit ? setQuickEditRow : undefined}
            onUpdateHearing={showUpdateHearing ? setUpdateHearingRow : undefined}
          />
        ))}
      </div>

      {/* ── Desktop table ── */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-200/80 shadow-xs bg-white">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-slate-50/90 border-b border-slate-200/80 sticky top-0 z-10">
            <tr>
              {[t("hearings.serialNo"), t("hearings.previousDate"), t("common.parties"), t("cases.From"), t("hearings.currentProceeding"), t("hearings.nextProceeding"), t("hearings.nextDateLabel"), `${t("cases.court")}/${t("cases.judge")}`, ""].map((h, i) => (
                <th key={i} className="px-3.5 py-3.5 text-start text-[11px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {data.rows.map(row => (
              <TableRow
                key={row.hearing_id ?? row.case_id}
                row={row}
                onQuickEdit={showQuickEdit ? setQuickEditRow : undefined}
                onUpdateHearing={showUpdateHearing ? setUpdateHearingRow : undefined}
              />
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} onChange={p => onPageChange?.(p)} />

      {/* Sheets */}
      <QuickEditSheet
        row={quickEditRow}
        onClose={() => setQuickEditRow(null)}
      />
      <UpdateHearingSheet
        row={updateHearingRow}
        onClose={() => setUpdateHearingRow(null)}
      />
    </div>
  );
}
