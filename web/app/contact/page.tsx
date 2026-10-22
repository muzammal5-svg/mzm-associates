"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { MessageSquare, Mail, MapPin, Phone } from "lucide-react";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { Card } from "@/components/ui/Card";
import { SITE, whatsappLink } from "@/lib/siteConfig";
import { saasDb } from "@/lib/supabase/saas";

export default function ContactPage() {
  const { t } = useTranslation();
  const [phone, setPhone] = useState(SITE.whatsapp);

  useEffect(() => {
    let mounted = true;
    saasDb
      .appSettings()
      .select("value")
      .eq("key", "whatsapp_number")
      .maybeSingle()
      .then((result) => {
        const value = (result.data as unknown as { value?: string } | null)?.value;
        if (mounted && value && typeof value === "string") {
          setPhone(value);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  const num = phone.replace(/[^0-9]/g, "");

  return (
    <MarketingShell>
      <main className="min-h-dvh bg-offwhite px-4 sm:px-6 py-16 md:py-24 max-w-4xl mx-auto">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-heading font-bold text-navy">
            {t("contact.title")}
          </h1>
          <p className="mt-4 text-base text-muted leading-relaxed">
            {t("contact.subtitle")}
          </p>
        </div>

        <div className="mt-12 grid sm:grid-cols-3 gap-6">
          <Card className="p-6 text-center space-y-3 bg-white hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-gold/10 text-gold flex items-center justify-center mx-auto">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-navy text-base">{t("contact.whatsapp")}</h3>
            <p className="font-mono text-xs text-navy font-semibold">{phone}</p>
            <a
              href={`https://wa.me/${num}`}
              target="_blank"
              rel="noreferrer"
              className="btn-primary text-xs h-9 inline-flex items-center justify-center px-4 w-full"
            >
              {t("contact.chatWhatsapp")}
            </a>
          </Card>

          <Card className="p-6 text-center space-y-3 bg-white hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-navy/10 text-navy flex items-center justify-center mx-auto">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-navy text-base">{t("contact.email")}</h3>
            <p className="font-mono text-xs text-navy font-semibold">{SITE.email}</p>
            <a
              href={`mailto:${SITE.email}`}
              className="btn-secondary text-xs h-9 inline-flex items-center justify-center px-4 w-full"
            >
              {SITE.email}
            </a>
          </Card>

          <Card className="p-6 text-center space-y-3 bg-white hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-navy-50 text-navy flex items-center justify-center mx-auto">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-navy text-base">{t("contact.office")}</h3>
            <p className="text-xs text-navy font-medium leading-relaxed">{t("contact.officeAddress")}</p>
          </Card>
        </div>
      </main>
    </MarketingShell>
  );
}
