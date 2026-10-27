"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Scale, ArrowRight, Menu, X, Check, Phone } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { useLang } from "@/providers/LangProvider";
import { cn } from "@/lib/utils";
import type { SupportedLang } from "@/i18n/config";
import { SITE, phoneLink } from "@/lib/siteConfig";

interface PublicHeaderProps {
  /** Kept for backwards compatibility — the header is always a dark glass surface. */
  overDark?: boolean;
}

export function PublicHeader({ overDark = false }: PublicHeaderProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { lang, setLang, languages } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const NAV = [
    { href: "/",         label: t("nav.home") },
    { href: "/features", label: t("marketing.navFeatures") },
    { href: "/pricing",  label: t("marketing.navPricing") },
    { href: "/faq",      label: t("marketing.navFaq") },
    { href: "/contact",  label: t("marketing.navContact") },
  ];

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300 ease-in-out",
        "bg-slate-900/90 backdrop-blur-lg supports-[backdrop-filter]:bg-slate-900/75",
        "border-b border-white/10",
        scrolled ? "shadow-xl shadow-slate-950/30" : "shadow-none"
      )}
    >
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 h-16 md:h-[72px] flex items-center justify-between safe-top">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group" aria-label={t("brand.name")}>
          <span className="relative grid h-10 w-10 place-items-center rounded-xl bg-gold-cta shadow-gold ring-1 ring-gold-300/40 transition-all duration-300 group-hover:shadow-glow-gold">
            <Scale className="h-5 w-5 text-navy-900 animate-scale-sway" aria-hidden="true" />
            <span className="pointer-events-none absolute inset-0 rounded-xl bg-white/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" aria-hidden="true" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-heading font-bold text-[17px] text-white tracking-tight">MZM</span>
            <span className="text-[10px] uppercase tracking-[0.18em] text-gold-300/90">&amp; Associates</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1" aria-label={t("common.mainNavigation")}>
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="group relative rounded-lg px-3.5 py-2 text-sm font-medium text-white/75 transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
            >
              {n.label}
              <span className="absolute inset-x-3 bottom-1 h-0.5 origin-center scale-x-0 rounded-full bg-gold-cta transition-transform duration-300 ease-out group-hover:scale-x-100" aria-hidden="true" />
            </Link>
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-3">
          <LangPill />

          <a
            href={phoneLink()}
            className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white/80 transition-all duration-200 hover:border-gold-400/60 hover:bg-gold-400/10 hover:text-gold-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
          >
            <Phone className="h-3.5 w-3.5" aria-hidden="true" />
            {SITE.phone}
          </a>

          {user ? (
            <Link
              href="/"
              className="btn-ghost-gold h-10 px-4 text-xs whitespace-nowrap"
            >
              {t("marketing.goToDashboard")}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          ) : (
            <>
              <Link href="/auth/sign-in" className="btn-ghost-gold h-10 px-4 text-xs whitespace-nowrap">
                {t("marketing.signIn")}
              </Link>
              <Link
                href="/register"
                className="group inline-flex h-10 items-center gap-2 rounded-md bg-gold-cta px-5 text-xs font-semibold text-navy-900 shadow-gold transition-all duration-200 ease-in-out hover:shadow-glow-gold active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
              >
                {t("marketing.signUp")}
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile trigger */}
        <button
          type="button"
          className="md:hidden grid h-10 w-10 place-items-center rounded-lg border border-white/15 text-white transition-colors duration-200 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
          onClick={() => setOpen(true)}
          aria-label={t("marketing.menu")}
          aria-expanded={open}
          aria-controls="public-mobile-menu"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden" id="public-mobile-menu">
          <button
            type="button"
            className="absolute inset-0 h-full w-full cursor-default bg-black animate-fade-in"
            style={{ backgroundColor: '#000000' }}
            onClick={() => setOpen(false)}
            aria-label={t("marketing.close")}
            tabIndex={-1}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={t("marketing.menu")}
            className="drawer-panel absolute inset-y-0 end-0 flex w-[86%] max-w-sm flex-col border-s border-white/10 bg-slate-900 p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-gold-cta shadow-gold">
                  <Scale className="h-5 w-5 text-navy-900" aria-hidden="true" />
                </span>
                <span className="font-heading font-bold text-white">MZM</span>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid h-10 w-10 place-items-center rounded-lg text-white/70 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
                aria-label={t("marketing.close")}
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <nav className="mt-8 flex flex-col gap-1" aria-label={t("common.mainNavigation")}>
              {NAV.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-3 text-base font-medium text-white bg-white/5 transition-colors duration-200 hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
                >
                  {n.label}
                </Link>
              ))}
            </nav>

            <div className="mt-auto space-y-4 border-t border-white/10 pt-6">
              <LangPill className="w-full" />
              <a
                href={phoneLink()}
                className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white/80 transition-all duration-200 hover:border-gold-400/60 hover:bg-gold-400/10 hover:text-gold-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
              >
                <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                {SITE.phone}
              </a>
              {user ? (
                <Link href="/" onClick={() => setOpen(false)} className="btn-ghost-gold w-full">
                  {t("marketing.goToDashboard")}
                </Link>
              ) : (
                <>
                  <Link href="/auth/sign-in" onClick={() => setOpen(false)} className="btn-ghost-gold w-full">
                    {t("marketing.signIn")}
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setOpen(false)}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-gold-cta px-5 py-3 text-sm font-semibold text-navy-900 shadow-gold transition-all duration-200 hover:shadow-glow-gold active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
                  >
                    {t("marketing.signUp")}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

/* ─── Language pill (EN / UR) with sliding active indicator ─────────────────── */
function LangPill({ className }: { className?: string }) {
  const { lang, setLang, languages } = useLang();
  const { t } = useTranslation();
  const index = Math.max(0, languages.findIndex((l) => l.code === lang));

  return (
    <div
      className={cn(
        "relative inline-flex items-center rounded-full border border-white/15 bg-white/5 p-1 backdrop-blur-md",
        className
      )}
      role="group"
      aria-label={t("settings.language")}
    >
      {/* Sliding active indicator (direction-aware) */}
      <span
        className="absolute top-1 bottom-1 rounded-full bg-gold-cta shadow-gold transition-all duration-300 ease-out"
        style={{
          width: `calc((100% - 0.5rem) / ${languages.length})`,
          insetInlineStart: `calc(0.25rem + ${index} * ((100% - 0.5rem) / ${languages.length}))`,
        }}
        aria-hidden="true"
      />
      {languages.map((l) => {
        const active = lang === l.code;
        return (
          <button
            key={l.code}
            type="button"
            onClick={() => setLang(l.code as SupportedLang)}
            aria-pressed={active}
            aria-label={l.label}
            className={cn(
              "relative z-10 min-h-0 min-w-0 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400",
              active ? "text-navy-900" : "text-white/70 hover:text-white"
            )}
          >
            {l.code.toUpperCase()}
            {active && <Check className="ms-1 inline h-3 w-3" aria-hidden="true" />}
          </button>
        );
      })}
    </div>
  );
}
