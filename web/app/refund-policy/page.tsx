"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { LegalDocument } from "@/components/marketing/LegalDocument";

export default function RefundPolicyPage() {
  const { t } = useTranslation();

  return (
    <MarketingShell>
      <div className="min-h-dvh bg-mesh-surface px-4 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-1.5 text-xs font-medium text-muted transition-colors duration-200 hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{t("legal.backHome")}</span>
          </Link>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm backdrop-blur-md md:p-12">
            <LegalDocument doc="refund" />
          </div>
        </div>
      </div>
    </MarketingShell>
  );
}
