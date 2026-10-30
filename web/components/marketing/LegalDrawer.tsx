"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  X, Search, Scale, ShieldCheck, Wallet, FileText, List, ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LEGAL_DOCS, type LegalDocId } from "@/lib/legalDocs";

const DOC_ICONS: Record<LegalDocId, typeof Scale> = {
  terms:   Scale,
  privacy: ShieldCheck,
  refund:  Wallet,
};

interface LegalDrawerProps {
  open:    boolean;
  onClose: () => void;
  doc:     LegalDocId;
}

export function LegalDrawer({ open, onClose, doc }: LegalDrawerProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState<string>("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const closeRef   = useRef<HTMLButtonElement>(null);

  const definition = LEGAL_DOCS[doc];
  const Icon = DOC_ICONS[doc];

  const sections = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return definition.sections;
    return definition.sections.filter((s) => {
      const title = t(s.titleKey).toLowerCase();
      const body  = s.bodyKeys.map((k) => t(k).toLowerCase()).join(" ");
      return title.includes(q) || body.includes(q);
    });
  }, [definition.sections, query, t]);

  // Reset state + lock scroll when the drawer opens
  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActiveId(definition.sections[0]?.id ?? "");
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    const t = window.setTimeout(() => closeRef.current?.focus(), 60);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
      window.clearTimeout(t);
    };
  }, [open, onClose, definition.sections]);

  // Track the section currently in view
  useEffect(() => {
    if (!open) return;
    const root = scrollRef.current;
    if (!root) return;
    const onScroll = () => {
      const candidates = definition.sections
        .map((s) => root.querySelector<HTMLElement>(`#${s.id}`))
        .filter((el): el is HTMLElement => Boolean(el));
      let current = candidates[0]?.id ?? "";
      for (const el of candidates) {
        if (el.offsetTop - root.scrollTop <= 96) current = el.id;
      }
      setActiveId(current);
    };
    root.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => root.removeEventListener("scroll", onScroll);
  }, [open, definition.sections]);

  const jumpTo = (id: string) => {
    const root = scrollRef.current;
    const el = root?.querySelector<HTMLElement>(`#${id}`);
    if (!root || !el) return;
    root.scrollTo({ top: el.offsetTop - 24, behavior: "smooth" });
    setActiveId(id);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        className="absolute inset-0 h-full w-full cursor-default bg-slate-950/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-label={t("common.close")}
        tabIndex={-1}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="legal-drawer-title"
        className="drawer-panel absolute inset-y-0 end-0 flex w-full max-w-2xl flex-col bg-white shadow-2xl"
      >
        {/* Header */}
        <header className="flex items-start gap-4 border-b border-slate-200/80 bg-gradient-to-r from-slate-900 to-navy-800 px-5 py-5 sm:px-7">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gold-cta shadow-gold">
            <Icon className="h-5 w-5 text-navy-900" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold-300">MZM &amp; Associates</p>
            <h2 id="legal-drawer-title" className="mt-1 font-heading text-xl font-bold text-white sm:text-2xl">
              {t(definition.titleKey)}
            </h2>
            <p className="mt-0.5 text-[11px] text-white/55">{t(definition.lastUpdatedKey)}</p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={t("common.close")}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-white/15 text-white/70 transition-colors duration-200 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </header>

        {/* Search */}
        <div className="border-b border-slate-200/80 px-5 py-4 sm:px-7">
          <label htmlFor="legal-search" className="sr-only">{t("legal.searchPlaceholder")}</label>
          <div className="relative">
            <Search className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" aria-hidden="true" />
            <input
              id="legal-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("legal.searchPlaceholder")}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2.5 ps-10 pe-10 text-sm text-navy transition-all duration-200 placeholder:text-navy-400 focus:border-gold-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-gold-400/15"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label={t("common.clearSearch")}
                className="absolute end-3 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full text-navy-400 transition-colors hover:bg-slate-200 hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="flex min-h-0 flex-1">
          {/* Table of contents */}
          <nav
            className="hidden w-56 shrink-0 overflow-y-auto border-e border-slate-200/80 bg-slate-50/60 p-4 md:block"
            aria-label={t("legal.tableOfContents")}
          >
            <p className="mb-3 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
              <List className="h-3.5 w-3.5" aria-hidden="true" />
              {t("legal.tableOfContents")}
            </p>
            <ul className="space-y-1">
              {sections.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => jumpTo(s.id)}
                    className={cn(
                      "w-full rounded-lg px-3 py-2 text-start text-xs font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold",
                      activeId === s.id
                        ? "bg-white text-gold-800 shadow-sm ring-1 ring-gold-300/50"
                        : "text-navy-600 hover:bg-white hover:text-navy"
                    )}
                  >
                    {t(s.titleKey)}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Document */}
          <div ref={scrollRef} className="min-w-0 flex-1 overflow-y-auto px-5 py-6 sm:px-7">
            {sections.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                <FileText className="h-10 w-10 text-navy-400" aria-hidden="true" />
                <p className="text-sm font-semibold text-navy">{t("legal.noResults")}</p>
                <p className="text-xs text-muted">{t("legal.noResultsHint")}</p>
              </div>
            ) : (
              <div className="space-y-8">
                {sections.map((s) => (
                  <section key={s.id} id={s.id} className="scroll-mt-4 space-y-3">
                    <h3 className="font-heading text-base font-bold text-navy sm:text-lg">{t(s.titleKey)}</h3>
                    {s.bodyKeys.map((k) => (
                      <p key={k} className="text-sm leading-relaxed text-navy/75">{t(k)}</p>
                    ))}
                  </section>
                ))}
              </div>
            )}

            <div className="mt-10 flex items-center justify-between gap-3 rounded-xl border border-gold-300/50 bg-gold-50/70 px-4 py-3.5">
              <p className="text-xs font-medium text-gold-800">{t("legal.drawerCta")}</p>
              <a
                href="/contact"
                onClick={onClose}
                className="group inline-flex items-center gap-1.5 rounded-lg bg-gold-cta px-3.5 py-2 text-xs font-semibold text-navy-900 shadow-gold transition-all duration-200 hover:shadow-glow-gold active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              >
                {t("marketing.navContact")}
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
