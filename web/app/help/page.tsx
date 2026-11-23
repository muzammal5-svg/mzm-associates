"use client";

import { useTranslation } from "react-i18next";
import { AppShell }   from "@/components/layout/AppShell";
import { RouteGuard } from "@/components/shared/RouteGuard";
import { Card }       from "@/components/ui/Card";
import { HelpCircle, Youtube, Mail, Phone, MessageCircle, MapPin, ExternalLink } from "lucide-react";
import { SITE, whatsappLink, phoneLink } from "@/lib/siteConfig";

export default function HelpPage() {
  const { t } = useTranslation();

  return (
    <RouteGuard>
      <AppShell pageTitle={t("more.help")} showBack>
        <div className="max-w-2xl mx-auto space-y-6">

          {/* ── YouTube Video Tutorials Card ── */}
          <Card className="p-6 md:p-8 bg-gradient-to-br from-red-500/5 via-white to-gold/5 border-red-500/20">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-start">
              <div className="w-16 h-16 rounded-2xl bg-red-600/10 border border-red-600/20 flex items-center justify-center flex-shrink-0 text-red-600">
                <Youtube className="w-9 h-9" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full mb-1">
                  Official Guides &amp; Tutorials
                </span>
                <h2 className="text-xl font-heading font-bold text-navy">
                  {t("more.videoTutorials") || "Video Guides & Tutorials"}
                </h2>
                <p className="text-sm text-navy-600 mt-1.5 leading-relaxed">
                  {t("more.videoTutorialsDesc") || "Watch step-by-step video guides on how to use Daily Diary MZM on YouTube: adding cases, daily cause list, client management, and document workflows."}
                </p>
                <div className="mt-4 flex flex-wrap gap-3 justify-center sm:justify-start">
                  <a
                    href={SITE.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-colors shadow-sm"
                  >
                    <Youtube className="w-4 h-4" />
                    <span>{t("common.watchOnYoutube") || "Watch on YouTube"}</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                  </a>
                  <a
                    href={whatsappLink("Assalam-o-Alaikum, I need help with Daily Diary MZM.")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-medium text-sm transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    <span>WhatsApp Help</span>
                  </a>
                </div>
              </div>
            </div>
          </Card>

          {/* ── Contact & Support Card ── */}
          <Card className="p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-navy-100">
              <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0">
                <HelpCircle className="w-5 h-5 text-gold" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-navy text-lg">{t("more.helpTitle")}</h3>
                <p className="text-xs text-navy-500">{t("more.helpText")}</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <a
                href={`mailto:${SITE.email}`}
                className="flex items-start gap-3 p-4 rounded-xl border border-navy-100 hover:border-gold/50 hover:bg-navy-50/50 transition-all group"
              >
                <Mail className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="font-semibold text-navy text-xs uppercase tracking-wider">{t("contact.email") || "Email Support"}</p>
                  <p className="text-navy-700 font-medium text-xs truncate mt-0.5">{SITE.email}</p>
                </div>
              </a>

              <a
                href={phoneLink()}
                className="flex items-start gap-3 p-4 rounded-xl border border-navy-100 hover:border-gold/50 hover:bg-navy-50/50 transition-all group"
              >
                <Phone className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="font-semibold text-navy text-xs uppercase tracking-wider">{t("contact.phone") || "Phone / Helpline"}</p>
                  <p className="text-navy-700 font-medium text-xs truncate mt-0.5">{SITE.phone}</p>
                </div>
              </a>
            </div>

            {/* Chamber address */}
            <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3 text-xs text-slate-700">
              <MapPin className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-navy">Chamber Office:</span>{" "}
                <span>{SITE.address}</span>
              </div>
            </div>
          </Card>

        </div>
      </AppShell>
    </RouteGuard>
  );
}
