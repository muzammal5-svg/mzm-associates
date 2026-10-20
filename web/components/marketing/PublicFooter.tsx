"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Logo } from "@/components/shared/Logo";
import { SITE, whatsappLink } from "@/lib/siteConfig";

export function PublicFooter() {
  const { t } = useTranslation();
  return (
    <footer className="bg-navy text-navy-100 mt-16">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-12 grid gap-8 md:grid-cols-4">
        <div>
          <Logo size="sm" variant="full" />
          <p className="mt-3 text-sm text-navy-200">{t("marketing.heroTitle")}</p>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-3">{t("marketing.footerProduct")}</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/features">{t("marketing.navFeatures")}</Link></li>
            <li><Link href="/pricing">{t("marketing.navPricing")}</Link></li>
            <li><Link href="/faq">{t("marketing.navFaq")}</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-3">{t("marketing.footerCompany")}</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/contact">{t("marketing.navContact")}</Link></li>
            <li><Link href="/">{t("nav.home")}</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-3">{t("marketing.footerLegal")}</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/terms">{t("marketing.footerTerms")}</Link></li>
            <li><Link href="/privacy">{t("marketing.footerPrivacy")}</Link></li>
            <li><Link href="/refund-policy">{t("marketing.footerRefund")}</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 md:px-6 py-4 text-center text-xs text-navy-300">
        © {new Date().getFullYear()} {SITE.name} ·{" "}
        <a href={whatsappLink()} className="underline">{t("marketing.footerWhatsapp")}</a> · {SITE.email}
      </div>
    </footer>
  );
}
