"use client";

import { useState, useCallback } from "react";
import { useTranslation }        from "react-i18next";
import {
  ChevronLeft, ChevronRight, Download,
  Share2, Printer, Calendar,
} from "lucide-react";
import { addDays, parseISO, format } from "date-fns";

import { AppShell }       from "@/components/layout/AppShell";
import { RouteGuard }     from "@/components/shared/RouteGuard";
import { Button }         from "@/components/ui/Button";
import { QueryErrorState } from "@/components/ui/QueryErrorState";
import { CauseListView }  from "@/components/cases/CauseListView";
import { useCauseList }   from "@/hooks/useHearings";
import { useAuth }        from "@/providers/AuthProvider";
import { useToast }       from "@/components/ui/Toast";
import { fmtDate, todayKarachi } from "@/lib/utils";
import { exportCauseListPdf, shareCauseList } from "@/lib/exportPdf";
import type { CauseListFilter } from "@/hooks/useHearings";

// ─── Print CSS injected into head ─────────────────────────────────────────────
const PRINT_STYLE = `
@media print {
  body * { visibility: hidden !important; }
  #cause-list-print, #cause-list-print * { visibility: visible !important; }
  #cause-list-print { position: fixed; top: 0; left: 0; width: 100%; }
  .no-print { display: none !important; }
}
`;

function injectPrintStyle() {
  if (typeof document === "undefined") return;
  const id = "mzm-print-style";
  if (document.getElementById(id)) return;
  const style   = document.createElement("style");
  style.id      = id;
  style.textContent = PRINT_STYLE;
  document.head.appendChild(style);
}

// ─── Page ─────────────────────────────────────────────────────────────────────
function CauseListPage() {
  const { t }   = useTranslation();
  const { firm } = useAuth();
  const toast   = useToast();

  const [date, setDate]   = useState(todayKarachi());
  const [page, setPage]   = useState(1);
  const [exporting, setExporting] = useState(false);
  const [sharing,   setSharing]   = useState(false);

  const isToday = date === todayKarachi();

  const filter: CauseListFilter = { date, page, pageSize: 50, sortBy: "serial_no", sortDir: "asc" };

  // Fetch all rows for PDF (no pagination)
  const { data: allData, isError: exportDataError, refetch: refetchExportData } = useCauseList({ ...filter, page: 1, pageSize: 500 });

  function navigate(delta: number) {
    const next = format(addDays(parseISO(date), delta), "yyyy-MM-dd");
    setDate(next);
    setPage(1);
  }

  async function handleExportPdf() {
    if (!allData?.rows.length) { toast.info("No hearings to export."); return; }
    setExporting(true);
    try {
      await exportCauseListPdf({
        rows:     allData.rows,
        date,
        firmName: firm?.name,
      });
      toast.success("PDF downloaded!");
    } catch (err: unknown) {
      toast.error("Export failed", err instanceof Error ? err.message : "");
    } finally { setExporting(false); }
  }

  async function handleShare() {
    if (!allData?.rows.length) { toast.info("No hearings to share."); return; }
    setSharing(true);
    try {
      await shareCauseList(allData.rows, date, firm?.name ?? undefined);
      toast.success("Copied to clipboard / shared!");
    } catch { toast.error("Share failed."); }
    finally  { setSharing(false); }
  }

  function handlePrint() {
    injectPrintStyle();
    window.print();
  }

  return (
    <AppShell
      pageTitle={t("nav.causeList")}
      headerActions={
        <div className="flex items-center gap-2 no-print">
          <Button size="sm" variant="secondary"
            onClick={handlePrint}
            leftIcon={<Printer className="w-4 h-4" />}
            className="hidden md:inline-flex"
          >
            Print
          </Button>
          <Button size="sm" variant="secondary"
            loading={sharing}
            onClick={handleShare}
            leftIcon={<Share2 className="w-4 h-4" />}
          >
            Share
          </Button>
          <Button size="sm"
            loading={exporting}
            onClick={handleExportPdf}
            leftIcon={<Download className="w-4 h-4" />}
          >
            PDF
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {exportDataError && <QueryErrorState onRetry={() => void refetchExportData()} />}

        {/* ── Date navigation ── */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1 bg-white rounded-xl border border-navy-100 p-1">
            <button
              onClick={() => navigate(-1)}
              aria-label="Previous day"
              className="w-8 h-8 flex items-center justify-center rounded-lg text-navy hover:bg-navy-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="px-3 text-center min-w-[130px]">
              <p className="text-sm font-semibold text-navy">{fmtDate(date)}</p>
              {isToday && <p className="text-[10px] text-gold font-semibold uppercase tracking-wider">Today</p>}
            </div>
            <button
              onClick={() => navigate(1)}
              aria-label="Next day"
              className="w-8 h-8 flex items-center justify-center rounded-lg text-navy hover:bg-navy-50 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {!isToday && (
            <button
              onClick={() => { setDate(todayKarachi()); setPage(1); }}
              className="text-xs text-gold hover:underline font-medium flex items-center gap-1"
            >
              <Calendar className="w-3.5 h-3.5" /> Back to Today
            </button>
          )}

          {/* Count badge */}
          {allData && (
            <span className="text-xs bg-navy-50 text-navy-400 px-2.5 py-1 rounded-full font-medium">
              {allData.total} hearing{allData.total !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* ── Cause list (printable region) ── */}
        <div id="cause-list-print">
          {/* Print header (hidden on screen) */}
          <div className="hidden print:block mb-4 text-center">
            <h1 className="text-lg font-bold">{firm?.name ?? "MZM & Associates"}</h1>
            <p className="text-sm">Cause List — {fmtDate(date)}</p>
          </div>

          <CauseListView
            filter={filter}
            onPageChange={setPage}
            showQuickEdit
            showUpdateHearing
            emptyMessage={isToday ? t("dashboard.noHearingsToday") : `No hearings on ${fmtDate(date)}`}
          />
        </div>

      </div>
    </AppShell>
  );
}

export default function CauseListRoute() {
  return <RouteGuard><CauseListPage /></RouteGuard>;
}
