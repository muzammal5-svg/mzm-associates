"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import {
  Scale, Mail, MessageCircle, FileText, ShieldCheck, Wallet, Sparkles, ArrowUpRight,
} from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import { LegalDrawer } from "@/components/marketing/LegalDrawer";
import { SITE, whatsappLink } from "@/lib/siteConfig";
import type { LegalDocId } from "@/lib/legalDocs";

export function PublicFooter() {
  const { t } = useTranslation();
  const [doc, setDoc] = useState<LegalDocId | null>(null);

  const openLegal = (d: LegalDocId) => setDoc(d);

  return (
    <footer className="relative mt-16 overflow-hidden bg-mesh-dark text-white">
      {/* Gold hairline */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-gold-400/60 to-transparent" aria-hidden="true" />

      <div className="mx-auto max-w-[1200px] px-4 py-14 md:px-6 md:py-20">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-gold-cta shadow-gold">
                <Scale className="h-5 w-5 text-navy-900" aria-hidden="true" />
              </span>
              <span className="flex flex-col leading-none">
                <span className="font-heading text-lg font-bold text-white">MZM</span>
                <span className="text-[10px] uppercase tracking-[0.18em] text-gold-300/90">&amp; Associates</span>
              </span>
            </div>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/60">
              {t("marketing.heroSubtitle")}
            </p>

            <div className="mt-6 flex flex-wrap gap-2.5">
              <a
                href={whatsappLink()}
                className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-semibold text-white/80 transition-all duration-200 hover:border-gold-400/60 hover:bg-gold-400/10 hover:text-gold-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
              >
                <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                {t("marketing.footerWhatsapp")}
              </a>
              <a
                href={`mailto:${SITE.email}`}
                className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-semibold text-white/80 transition-all duration-200 hover:border-gold-400/60 hover:bg-gold-400/10 hover:text-gold-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
              >
                <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                {SITE.email}
              </a>
            </div>
          </div>

          {/* Columns */}
          <nav aria-label={t("marketing.footerProduct")}>
            <h4 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-gold-300">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              {t("marketing.footerProduct")}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link className="text-white/65 transition-colors duration-200 hover:text-gold-100" href="/features">{t("marketing.navFeatures")}</Link></li>
              <li><Link className="text-white/65 transition-colors duration-200 hover:text-gold-100" href="/pricing">{t("marketing.navPricing")}</Link></li>
              <li><Link className="text-white/65 transition-colors duration-200 hover:text-gold-100" href="/faq">{t("marketing.navFaq")}</Link></li>
              <li><Link className="text-white/65 transition-colors duration-200 hover:text-gold-100" href="/">{t("nav.home")}</Link></li>
            </ul>
          </nav>

          <nav aria-label={t("marketing.footerCompany")}>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-gold-300">
              {t("marketing.footerCompany")}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link className="text-white/65 transition-colors duration-200 hover:text-gold-100" href="/contact">{t("marketing.navContact")}</Link></li>
              <li><Link className="text-white/65 transition-colors duration-200 hover:text-gold-100" href="/register">{t("marketing.signUp")}</Link></li>
              <li><Link className="text-white/65 transition-colors duration-200 hover:text-gold-100" href="/auth/sign-in">{t("marketing.signIn")}</Link></li>
            </ul>
          </nav>

          <nav aria-label={t("marketing.footerLegal")}>
            <h4 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-gold-300">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              {t("marketing.footerLegal")}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => openLegal("terms")}
                  className="group inline-flex items-center gap-1.5 text-white/65 transition-colors duration-200 hover:text-gold-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900"
                >
                  <FileText className="h-3.5 w-3.5 opacity-60" aria-hidden="true" />
                  {t("marketing.footerTerms")}
                  <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100" aria-hidden="true" />
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openLegal("privacy")}
                  className="group inline-flex items-center gap-1.5 text-white/65 transition-colors duration-200 hover:text-gold-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900"
                >
                  <ShieldCheck className="h-3.5 w-3.5 opacity-60" aria-hidden="true" />
                  {t("marketing.footerPrivacy")}
                  <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100" aria-hidden="true" />
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openLegal("refund")}
                  className="group inline-flex items-center gap-1.5 text-white/65 transition-colors duration-200 hover:text-gold-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900"
                >
                  <Wallet className="h-3.5 w-3.5 opacity-60" aria-hidden="true" />
                  {t("marketing.footerRefund")}
                  <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100" aria-hidden="true" />
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-5 text-center text-xs text-white/45 md:px-6">
        © {new Date().getFullYear()} {SITE.name} ·{" "}
        <a href={whatsappLink()} className="underline decoration-gold-400/40 underline-offset-4 transition-colors hover:text-gold-200">
          {t("marketing.footerWhatsapp")}
        </a>{" "}
        · <span>{SITE.email}</span>
      </div>

      <LegalDrawer
        open={doc !== null}
        doc={doc ?? "terms"}
        onClose={() => setDoc(null)}
      />
    </footer>
  );
}
