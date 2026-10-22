"use client";

import { useTranslation } from "react-i18next";
import { Scale, ShieldCheck, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { LEGAL_DOCS, type LegalDocId } from "@/lib/legalDocs";

const ICONS: Record<LegalDocId, typeof Scale> = {
  terms:   Scale,
  privacy: ShieldCheck,
  refund:  Wallet,
};

/**
 * Full-page rendering of a legal document. Shares the same content model
 * as the slide-over drawer so both stay in sync.
 */
export function LegalDocument({ doc, className }: { doc: LegalDocId; className?: string }) {
  const { t } = useTranslation();
  const definition = LEGAL_DOCS[doc];
  const Icon = ICONS[doc];

  return (
    <article className={cn("space-y-8", className)}>
      <header>
        <div className="flex items-center gap-2.5 text-gold">
          <Icon className="h-6 w-6" aria-hidden="true" />
          <span className="text-xs font-bold uppercase tracking-[0.18em]">MZM &amp; Associates</span>
        </div>
        <h1 className="mt-2 font-heading text-3xl font-bold text-navy md:text-4xl">
          {t(definition.titleKey)}
        </h1>
        <p className="mt-1 text-xs text-muted">{t(definition.lastUpdatedKey)}</p>
      </header>

      <div className="space-y-8">
        {definition.sections.map((s) => (
          <section key={s.id} id={s.id} className="space-y-3">
            <h2 className="font-heading text-base font-bold text-navy md:text-lg">
              {t(s.titleKey)}
            </h2>
            {s.bodyKeys.map((k) => (
              <p key={k} className="text-sm leading-relaxed text-navy/75">{t(k)}</p>
            ))}
          </section>
        ))}
      </div>
    </article>
  );
}
