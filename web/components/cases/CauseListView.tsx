"use client";

import { useEffect, useRef, useState } from "react";
import Link                  from "next/link";
import { useTranslation }    from "react-i18next";
import { Edit2, ChevronRight, Gavel } from "lucide-react";

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
          <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-gold">{row.serial_no ?? "—"}</span>
          </div>
          <div>
            <p className="text-xs font-mono text-gold font-semibold leading-tight">{row.case_ref_no}</p>
            <Badge variant="navy" size="sm">{row.case_type_name}</Badge>
          </div>
        </div>
        <div className="flex gap-1">
          {onQuickEdit && (
            <button onClick={() => onQuickEdit(row)} {...lock}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-navy-300 hover:bg-navy-50 hover:text-gold transition-colors disabled:opacity-40"
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
          <span className="text-navy-300 font-normal mx-1 text-xs">{t("common.vs")}</span>
          {row.defendant_name}
        </p>
      </Link>

      {/* Court / judge */}
      <div className="flex items-center gap-3 text-xs text-navy-400 flex-wrap">
        {row.hearing_court_no && (
          <span className="flex items-center gap-1">
            <Gavel className="w-3 h-3" /> {t("cases.court")} {row.hearing_court_no}
          </span>
        )}
        {row.hearing_judge && <span>{row.hearing_judge}</span>}
        <Badge variant={row.From === "plaintiff" ? "gold" : "info"} size="sm">
          {row.From === "plaintiff" ? t("cases.plaintiff") : t("cases.defendant")}
        </Badge>
      </div>

      {/* Proceedings */}
      {row.current_proceeding && (
        <p className="text-xs text-navy-400 line-clamp-2">{row.current_proceeding}</p>
      )}

      {/* Dates row */}
      <div className="flex items-center justify-between text-xs border-t border-navy-50 pt-2">
        <span className="text-navy-400">
          {t("hearings.previousDate")}: <span className="text-navy font-medium">{row.previous_date ? fmtDate(row.previous_date) : "—"}</span>
        </span>
        <span className="text-navy-400">
          {t("hearings.nextDateLabel")}: <span className={`font-semibold ${row.next_date ? "text-gold" : "text-navy-300"}`}>
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
    <tr className="border-b border-navy-50 hover:bg-navy-50/30 transition-colors">
      <td className="px-3 py-2.5 text-center">
        <span className="text-sm font-bold text-gold">{row.serial_no ?? "—"}</span>
      </td>
      <td className="px-3 py-2.5 text-xs text-navy-400">
        {row.previous_date ? fmtDate(row.previous_date) : "—"}
      </td>
      <td className="px-3 py-2.5">
        <Link href={`/cases/view?id=${row.case_id}`}
          className="hover:text-gold transition-colors">
          <p className="text-sm font-medium text-navy"
            dir={isUrdu(row.plaintiff_name ?? "") || isUrdu(row.defendant_name ?? "") ? "rtl" : "ltr"}>
            {row.plaintiff_name} <span className="text-navy-300 text-xs">{t("common.vs")}</span> {row.defendant_name}
          </p>
          <p className="text-[11px] text-gold font-mono">{row.case_ref_no}</p>
        </Link>
      </td>
      <td className="px-3 py-2.5">
        <Badge variant={row.From === "plaintiff" ? "gold" : "info"} size="sm">
              {row.From === "plaintiff" ? t("cases.plaintiff") : t("cases.defendant")}
        </Badge>
      </td>
      <td className="px-3 py-2.5 text-xs text-navy-400 max-w-[150px]">
        <p className="line-clamp-2">{row.current_proceeding ?? "—"}</p>
      </td>
      <td className="px-3 py-2.5 text-xs text-navy-400 max-w-[150px]">
        <p className="line-clamp-2">{row.next_proceeding ?? "—"}</p>
      </td>
      <td className="px-3 py-2.5">
        <span className={`text-xs font-semibold ${row.next_date ? "text-gold" : "text-navy-300"}`}>
          {row.next_date ? fmtDate(row.next_date) : "—"}
        </span>
      </td>
      <td className="px-3 py-2.5 text-xs text-navy-400">
        {row.hearing_court_no ?? "—"}
        {row.hearing_judge && <p className="text-[10px] truncate max-w-[80px]">{row.hearing_judge}</p>}
      </td>
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-1">
          {onQuickEdit && (
            <button onClick={() => onQuickEdit(row)} {...lock}
              className="w-6 h-6 flex items-center justify-center rounded text-navy-300 hover:text-gold hover:bg-gold-50 transition-colors disabled:opacity-40"
              aria-label={t("common.quickEdit")}
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}
          {onUpdateHearing && (
            <button onClick={() => onUpdateHearing(row)} {...lock}
              className="text-[11px] font-semibold text-gold hover:underline whitespace-nowrap disabled:opacity-40"
            >
              {t("common.update")} →
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
    <div className="flex items-center justify-center gap-2 mt-4">
      <Button size="sm" variant="secondary" disabled={page === 1} onClick={() => onChange(page - 1)}>{t("common.previousPage")} →</Button>
      <span className="text-sm text-navy-400">{page} / {totalPages}</span>
      <Button size="sm" variant="secondary" disabled={page === totalPages} onClick={() => onChange(page + 1)}>← {t("common.nextPage")}</Button>
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
            key={row.hearing_id}
            row={row}
            onQuickEdit={showQuickEdit ? setQuickEditRow : undefined}
            onUpdateHearing={showUpdateHearing ? setUpdateHearingRow : undefined}
          />
        ))}
      </div>

      {/* ── Desktop table ── */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-navy-50">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-navy-50/70 sticky top-0 z-10">
            <tr>
              {[t("hearings.serialNo"), t("hearings.previousDate"), t("common.parties"), t("cases.From"), t("hearings.currentProceeding"), t("hearings.nextProceeding"), t("hearings.nextDateLabel"), `${t("cases.court")}/${t("cases.judge")}`, ""].map((h, i) => (
                <th key={i} className="px-3 py-2.5 text-start text-xs font-semibold text-navy-400 uppercase tracking-wider whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white">
            {data.rows.map(row => (
              <TableRow
                key={row.hearing_id}
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
