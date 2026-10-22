"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Building2, CreditCard, Wallet, Copy, Check, Info, Landmark,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/Toast";
import type { PaymentAccount, PaymentMethod } from "@/types/saas";

const GATEWAYS: { id: PaymentMethod; icon: typeof Building2; labelKey: string; tone: string }[] = [
  { id: "bank_transfer", icon: Building2,   labelKey: "billing.bankTransfer", tone: "from-sky-500 to-blue-700" },
  { id: "jazzcash",      icon: CreditCard,  labelKey: "billing.jazzcash",      tone: "from-rose-500 to-rose-700" },
  { id: "easypaisa",     icon: Wallet,      labelKey: "billing.easypaisa",     tone: "from-emerald-500 to-teal-700" },
];

interface PaymentGatewayTabsProps {
  accounts:       PaymentAccount[];
  value:          PaymentMethod;
  onChange:       (method: PaymentMethod) => void;
  className?:     string;
}

export function PaymentGatewayTabs({
  accounts,
  value,
  onChange,
  className,
}: PaymentGatewayTabsProps) {
  const { t } = useTranslation();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const active = GATEWAYS.find((g) => g.id === value) ?? GATEWAYS[0];
  const activeAccounts = accounts.filter((a) => a.method === value);

  const handleCopy = async (id: string, text: string, label: string) => {
    let copied = false;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        copied = true;
      }
    } catch {
      copied = false;
    }

    if (!copied) {
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        ta.setSelectionRange(0, text.length);
        copied = document.execCommand("copy");
        document.body.removeChild(ta);
      } catch {
        copied = false;
      }
    }

    if (copied) {
      setCopiedId(id);
      window.setTimeout(() => setCopiedId(null), 2000);
      toast.success(t("billing.copied"), label);
    } else {
      toast.error(t("common.error"), label);
    }
  };

  return (
    <section className={cn("space-y-4", className)} aria-label={t("billing.chooseMethod")}>
      {/* Segmented control */}
      <div
        role="tablist"
        aria-label={t("billing.chooseMethod")}
        className="grid grid-cols-3 gap-1.5 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-1.5 backdrop-blur-md"
      >
        {GATEWAYS.map((g) => {
          const isActive = g.id === value;
          const Icon = g.icon;
          return (
            <button
              key={g.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(g.id)}
              className={cn(
                "group relative flex flex-col items-center gap-1.5 rounded-xl px-2 py-3 transition-all duration-200 ease-in-out",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2",
                "active:scale-[0.98]",
                isActive
                  ? "bg-white shadow-sm ring-1 ring-slate-200/80"
                  : "hover:bg-white/70"
              )}
            >
              <span
                className={cn(
                  "grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br text-white shadow-sm transition-transform duration-200",
                  g.tone,
                  isActive ? "scale-105" : "opacity-70 group-hover:opacity-100"
                )}
                aria-hidden="true"
              >
                <Icon className="h-[18px] w-[18px]" />
              </span>
              <span
                className={cn(
                  "text-[11px] font-semibold transition-colors duration-200",
                  isActive ? "text-navy" : "text-muted group-hover:text-navy"
                )}
              >
                {t(g.labelKey)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Account details */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-200/80 bg-slate-50/70 px-4 py-3">
          <Landmark className="h-4 w-4 text-gold" aria-hidden="true" />
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-navy-600">
            {t("billing.paymentInstructions")}
          </p>
          <span className="ms-auto rounded-full bg-navy-800 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-gold-300">
            {t(active.labelKey)}
          </span>
        </div>

        {activeAccounts.length === 0 ? (
          <p className="px-4 py-6 text-center text-xs text-muted">
            {t("billing.noAccountConfigured")}
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {activeAccounts.map((acc) => (
              <li key={acc.id} className="space-y-3 px-4 py-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  {acc.bank_name && (
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                        {t("billing.bankName")}
                      </p>
                      <p className="mt-0.5 text-sm font-semibold text-navy">{acc.bank_name}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                      {t("billing.accountTitle")}
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-navy">{acc.account_title}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gold-300/50 bg-gold-50/60 px-3.5 py-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gold-800/80">
                      {t("billing.accountNumber")}
                    </p>
                    <p className="mt-0.5 break-all font-mono text-sm font-bold text-navy">
                      {acc.account_number}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(acc.id, acc.account_number, acc.account_number)}
                    className={cn(
                      "inline-flex h-10 shrink-0 items-center gap-2 rounded-lg px-3.5 text-xs font-bold transition-all duration-200 ease-in-out active:scale-[0.98]",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2",
                      copiedId === acc.id
                        ? "bg-success text-white shadow-sm"
                        : "bg-gold-cta text-navy-900 shadow-gold hover:shadow-glow-gold"
                    )}
                  >
                    {copiedId === acc.id
                      ? <Check className="h-3.5 w-3.5" aria-hidden="true" />
                      : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
                    {copiedId === acc.id ? t("billing.copied") : t("billing.copyAccountIban")}
                  </button>
                </div>

                {acc.instructions && (
                  <p className="flex items-start gap-2 rounded-lg bg-slate-50 px-3 py-2 text-[11px] italic leading-relaxed text-navy/70">
                    <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-navy-300" aria-hidden="true" />
                    {acc.instructions}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
