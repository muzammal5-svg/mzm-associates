"use client";
import { useTranslation } from "react-i18next";
import { AppShell }   from "@/components/layout/AppShell";
import { RouteGuard } from "@/components/shared/RouteGuard";
import { Card }       from "@/components/ui/Card";
import { HelpCircle } from "lucide-react";
export default function HelpPage() {
  const { t } = useTranslation();
  return (
    <RouteGuard>
      <AppShell pageTitle={t("more.help")} showBack>
        <div className="max-w-xl mx-auto">
          <Card className="flex flex-col items-center gap-4 py-10 text-center">
            <HelpCircle className="w-12 h-12 text-navy-300" />
            <div>
              <p className="font-semibold text-navy text-lg">{t("more.helpTitle")}</p>
              <p className="text-sm text-navy-400 mt-1">{t("more.helpText")}</p>
            </div>
            <a href="mailto:support@mzm.pk" className="btn-primary px-6">
              {t("more.emailSupport")}
            </a>
          </Card>
        </div>
      </AppShell>
    </RouteGuard>
  );
}
