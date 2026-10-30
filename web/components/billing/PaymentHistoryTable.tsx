"use client";

import { useTranslation } from "react-i18next";
import {
  Clock, CheckCircle2, XCircle, Eye, Receipt, Inbox, FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Payment, PaymentStatus } from "@/types/saas";

const STATUS_META: Record<PaymentStatus, {
  labelKey:   string;
  chip:       string;
  icon:       typeof Clock;
}> = {
  pending: {
    labelKey: "billing.statusPending",
    chip:     "bg-amber-50 text-amber-800 border-amber-200",
    icon:     Clock,
  },
  verified: {
    labelKey: "billing.statusVerified",
    chip:     "bg-emerald-50 text-emerald-800 border-emerald-200",
    icon:     CheckCircle2,
  },
  rejected: {
    labelKey: "billing.statusRejected",
    chip:     "bg-rose-50 text-rose-700 border-rose-200",
    icon:     XCircle,
  },
};

interface PaymentHistoryTableProps {
  payments:   Payment[];
  planNames:  Record<string, string>;
  onViewReceipt?: (payment: Payment) => void;
  className?: string;
}

export function PaymentHistoryTable({
  payments,
  planNames,
  onViewReceipt,
  className,
}: PaymentHistoryTableProps) {
  const { t } = useTranslation();

  if (payments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 px-6 py-12 text-center">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-navy-400 shadow-sm">
          <Inbox className="h-6 w-6" aria-hidden="true" />
        </span>
        <p className="text-sm font-semibold text-navy">{t("billing.noPayments")}</p>
        <p className="text-xs text-muted">{t("billing.noPaymentsHint")}</p>
      </div>
    );
  }

  return (
    <div className={cn("overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm", className)}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-start text-xs">
          <caption className="sr-only">{t("billing.history")}</caption>
          <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-[0.12em] text-navy-500">
            <tr>
              <th scope="col" className="px-4 py-3 text-start">{t("billing.date")}</th>
              <th scope="col" className="px-4 py-3 text-start">{t("billing.reference")}</th>
              <th scope="col" className="px-4 py-3 text-start">{t("billing.amount")}</th>
              <th scope="col" className="px-4 py-3 text-start">{t("billing.status")}</th>
              <th scope="col" className="px-4 py-3 text-start">{t("billing.note")}</th>
              <th scope="col" className="px-4 py-3 text-end">
                <span className="sr-only">{t("billing.viewReceipt")}</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {payments.map((p) => {
              const meta = STATUS_META[p.status] ?? STATUS_META.pending;
              const StatusIcon = meta.icon;
              return (
                <tr key={p.id} className="transition-colors duration-200 hover:bg-slate-50/80">
                  <td className="whitespace-nowrap px-4 py-3.5 text-muted">
                    {new Date(p.created_at).toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5">
                    <span className="font-mono text-xs font-semibold text-navy">{p.reference_no}</span>
                    <span className="mt-0.5 block text-[10px] uppercase tracking-wider text-navy-400">
                      {p.method.replace("_", " ")}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5">
                    <span className="font-heading text-sm font-bold text-navy">
                      Rs {Number(p.amount_pkr).toLocaleString()}
                    </span>
                    <span className="mt-0.5 block text-[10px] text-muted">
                      {planNames[p.plan_id] ?? t("billing.plan")}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5">
                    <span className={cn("pill-badge border", meta.chip)}>
                      <StatusIcon className="h-3.5 w-3.5" aria-hidden="true" />
                      {t(meta.labelKey)}
                    </span>
                  </td>
                  <td className="max-w-[16rem] px-4 py-3.5 text-muted">
                    <span className="line-clamp-2">{p.note || "—"}</span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-end">
                    {p.slip_path ? (
                      <button
                        type="button"
                        onClick={() => onViewReceipt?.(p)}
                        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-semibold text-navy transition-all duration-200 hover:border-gold/50 hover:bg-gold-50 hover:text-gold-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold active:scale-[0.98]"
                      >
                        <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                        {t("billing.viewReceipt")}
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-navy-400">
                        <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                        {t("billing.noReceipt")}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-2 border-t border-slate-100 bg-slate-50/60 px-4 py-3 text-[11px] text-muted">
        <Receipt className="h-3.5 w-3.5 text-navy-400" aria-hidden="true" />
        {t("billing.historyFooter")}
      </div>
    </div>
  );
}
