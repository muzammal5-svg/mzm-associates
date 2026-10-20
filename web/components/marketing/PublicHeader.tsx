"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/providers/AuthProvider";
import { Logo } from "@/components/shared/Logo";
import { LangSwitcher } from "@/components/shared/LangSwitcher";

interface PublicHeaderProps {
  /** Hero sits behind a transparent header with light text (landing page only). */
  overDark?: boolean;
}

export function PublicHeader({ overDark = false }: PublicHeaderProps) {
  const { t }      = useTranslation();
  const { user }   = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const NAV = [
    { href: "/",         label: t("nav.home") },
    { href: "/features", label: t("marketing.navFeatures") },
    { href: "/pricing",  label: t("marketing.navPricing") },
    { href: "/faq",      label: t("marketing.navFaq") },
    { href: "/contact",  label: t("marketing.navContact") },
  ];

  const solid      = scrolled || !overDark;
  const linkColor  = solid ? "text-navy hover:text-gold" : "text-white/90 hover:text-white";
  const wordColor  = solid ? "text-navy" : "text-white";

  return (
    <header className={`sticky top-0 z-50 transition-colors ${solid ? "bg-white/95 shadow-sm backdrop-blur" : "bg-transparent"}`}>
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between safe-top">
        <Link href="/" className="flex items-center gap-2">
          <Logo size="sm" variant="mark" />
          <span className={`font-heading font-bold ${wordColor}`}>MZM</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className={`text-sm font-medium transition-colors relative group ${linkColor}`}>
              {n.label}
              <span className="absolute -bottom-1 start-0 w-0 h-0.5 bg-gold group-hover:w-full transition-all" />
            </Link>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-3">
          <LangSwitcher />
          {user ? (
            <Link href="/" className="btn-primary shrink-0 whitespace-nowrap px-4 py-2 text-xs">{t("marketing.goToDashboard")}</Link>
          ) : (
            <>
              <Link href="/auth/sign-in" className="btn-secondary shrink-0 whitespace-nowrap px-4 py-2 text-xs">{t("marketing.signIn")}</Link>
              <Link href="/register" className="btn-primary shrink-0 whitespace-nowrap px-4 py-2 text-xs">{t("marketing.signUp")}</Link>
            </>
          )}
        </div>
        <button className={`md:hidden p-2 ${wordColor}`} onClick={() => setOpen(true)} aria-label={t("marketing.menu")}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-navy/40" onClick={() => setOpen(false)} />
          <div className="absolute start-0 top-0 h-full w-72 bg-white p-6 shadow-lg">
            <button className="mb-4 text-navy" onClick={() => setOpen(false)}>{t("marketing.close")}</button>
            <nav className="flex flex-col gap-4">
              {NAV.map((n) => <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className="text-navy font-medium">{n.label}</Link>)}
            </nav>
            <div className="mt-6 flex flex-col gap-3">
              <LangSwitcher />
              {user ? <Link href="/" className="btn-primary" onClick={() => setOpen(false)}>{t("marketing.goToDashboard")}</Link> : (
                <>
                  <Link href="/auth/sign-in" className="btn-secondary" onClick={() => setOpen(false)}>{t("marketing.signIn")}</Link>
                  <Link href="/register" className="btn-primary" onClick={() => setOpen(false)}>{t("marketing.signUp")}</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
