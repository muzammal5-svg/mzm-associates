"use client";

import { useTranslation }  from "react-i18next";
import Link                from "next/link";
import { AppShell }        from "@/components/layout/AppShell";
import { RouteGuard }      from "@/components/shared/RouteGuard";
import { CasesList }       from "@/components/cases/CasesList";
import { Button }          from "@/components/ui/Button";
import { List }            from "lucide-react";

export default function CasesPage() {
  const { t } = useTranslation();
  return (
    <RouteGuard>
      <AppShell
        pageTitle={t("cases.running")}
        headerActions={
          <Link href="/cases/running">
            <Button size="sm" variant="secondary" leftIcon={<List className="w-4 h-4" />}>
              Cause List View
            </Button>
          </Link>
        }
      >
        <CasesList status="running" />
      </AppShell>
    </RouteGuard>
  );
}
