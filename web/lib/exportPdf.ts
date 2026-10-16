/**
 * Client-side PDF export for the Cause List using jsPDF + jspdf-autotable.
 * Loaded lazily (dynamic import) so it never lands in the SSR bundle.
 *
 * Urdu text note: jsPDF does not natively support Noto Nastaliq (Arabic script).
 * For Urdu party names we render them as-is (Latin fallback in PDF) and note
 * in the footer that Urdu text may not render correctly in the PDF.
 * A full solution requires embedding the Urdu font as a base64 string (Phase 8+).
 */

import type { CauseListRow } from "@/types/supabase";
import { fmtDate }           from "@/lib/utils";
import { BRAND }             from "@/lib/brand";

export interface PdfExportOptions {
  rows:      CauseListRow[];
  date:      string;
  firmName?: string;
  firmLogoUrl?: string | null;
  title?:    string;
}

export async function exportCauseListPdf(opts: PdfExportOptions): Promise<void> {
  // Lazy-load to avoid SSR bundle inclusion
  const { default: jsPDF }     = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const {
    rows,
    date,
    firmName = BRAND.name as string,
    firmLogoUrl,
    title    = "Cause List",
  } = opts;

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();

  // Use the firm upload when present and the real brand mark as the fallback.
  try {
    const response = await fetch(firmLogoUrl || "/logo/logoadv.jpeg");
    if (response.ok) {
      const logo = await response.blob();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = reject;
        reader.readAsDataURL(logo);
      });
      doc.addImage(dataUrl, dataUrl.startsWith("data:image/png") ? "PNG" : "JPEG", 14, 7, 30, 19);
    }
  } catch { /* The text header remains available if the image cannot be loaded. */ }

  // ── Header ─────────────────────────────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(11, 27, 58);     // navy
  doc.text(firmName, pageW / 2, 14, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(138, 100, 20);   // gold
  doc.text(BRAND.tagline, pageW / 2, 20, { align: "center" });

  doc.setTextColor(100, 100, 100);
  doc.setFontSize(11);
  doc.text(`${title} — ${fmtDate(date)}`, pageW / 2, 27, { align: "center" });

  doc.setDrawColor(138, 100, 20);
  doc.setLineWidth(0.5);
  doc.line(14, 30, pageW - 14, 30);

  // ── Table ──────────────────────────────────────────────────────────────────
  const head = [[
    "Sr.", "Case Ref", "Parties (A vs B)", "Type",
    "Court", "Current Proceeding", "Next Proceeding", "Next Date", "Prev. Date",
  ]];

  const body = rows.map(r => [
    r.serial_no         ?? "—",
    r.case_ref_no,
    `${r.plaintiff_name} vs ${r.defendant_name}`,
    r.case_type_name,
    r.hearing_court_no  ?? "—",
    r.current_proceeding ?? "—",
    r.next_proceeding   ?? "—",
    r.next_date         ? fmtDate(r.next_date)     : "—",
    r.previous_date     ? fmtDate(r.previous_date) : "—",
  ]);

  autoTable(doc, {
    startY:    33,
    head,
    body,
    styles: {
      font:      "helvetica",
      fontSize:  8,
      cellPadding: 2.5,
      overflow:  "linebreak",
      valign:    "middle",
      textColor: [11, 27, 58],
    },
    headStyles: {
      fillColor:  [11, 27, 58],
      textColor:  [255, 255, 255],
      fontStyle:  "bold",
      fontSize:   8.5,
    },
    alternateRowStyles: { fillColor: [247, 247, 244] },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 24 },
      2: { cellWidth: 52 },
      3: { cellWidth: 18 },
      4: { cellWidth: 16 },
      5: { cellWidth: 40 },
      6: { cellWidth: 40 },
      7: { cellWidth: 20 },
      8: { cellWidth: 20 },
    },
    didDrawPage: (data) => {
      // Footer on every page
      const pageCount = doc.internal.pages.length - 1;
      doc.setFontSize(7);
      doc.setTextColor(160, 160, 160);
      doc.text(
        `Page ${data.pageNumber} of ${pageCount}  •  Generated ${new Date().toLocaleString("en-PK")}  •  Note: Urdu text may not render in PDF`,
        14,
        doc.internal.pageSize.getHeight() - 6
      );
    },
    margin: { top: 33, left: 14, right: 14, bottom: 12 },
  });

  // ── Save ───────────────────────────────────────────────────────────────────
  const fileName = `cause-list-${date}.pdf`;
  doc.save(fileName);
}

/** Web Share API — share the cause list summary text */
export async function shareCauseList(
  rows: CauseListRow[],
  date: string,
  firmName?: string
): Promise<void> {
  const name = firmName ?? (BRAND.name as string);
  const text = [
    `${name}`,
    `Cause List — ${fmtDate(date)}`,
    `${rows.length} hearing(s) scheduled`,
    "",
    ...rows.map(r =>
      `${r.serial_no ?? "—"}. ${r.case_ref_no} | ${r.plaintiff_name} vs ${r.defendant_name} | Court: ${r.hearing_court_no ?? "—"}`
    ),
  ].join("\n");

  if (typeof navigator !== "undefined" && navigator.share) {
    await navigator.share({ title: `Cause List ${fmtDate(date)}`, text });
  } else {
    await navigator.clipboard.writeText(text);
  }
}
