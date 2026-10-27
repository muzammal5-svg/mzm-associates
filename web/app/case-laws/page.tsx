"use client";

import { useTranslation } from "react-i18next";
import { AppShell } from "@/components/layout/AppShell";
import { RouteGuard } from "@/components/shared/RouteGuard";
import { CaseLawsModule } from "@/components/case-laws/CaseLawsModule";
import { BookOpen } from "lucide-react";

export default function CaseLawsPage() {
  const { t } = useTranslation();
  return (
    <RouteGuard>
      <AppShell
        pageTitle={t("caseLaws.title")}
        headerActions={
          <button
            className="ml-2 h-9 px-3 text-sm text-navy-400 hover:text-navy transition-colors"
            aria-label={t("caseLaws.title")}
          >
            <BookOpen className="w-4 h-4" />
          </button>
        }
      >
        <CaseLawsModule />
      </AppShell>
    </RouteGuard>
  );
}
