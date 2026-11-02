"use client";

import { useTranslation } from "react-i18next";
import { ShieldCheck, Info } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { DocumentsModule } from "@/components/documents/DocumentsModule";
import { RouteGuard } from "@/components/shared/RouteGuard";
import { useRoleGuard } from "@/hooks/useRoleGuard";

export default function ImportantFormsPage() {
  const { t } = useTranslation();
  const { isSuperAdmin } = useRoleGuard();

  return (
    <RouteGuard>
      <AppShell
        pageTitle={t("nav.importantForms") || "Essential Court Forms"}
        pageSubtitle={
          isSuperAdmin
            ? "Super Admin: Upload and manage official court templates for all users."
            : "Official court forms and legal templates. View or download anytime."
        }
      >
        {isSuperAdmin ? (
          <div className="mb-4 flex items-center gap-2.5 px-4 py-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-700">
            <ShieldCheck className="w-4 h-4 flex-shrink-0 text-amber-600" />
            <span className="font-medium">
              Super Admin Mode: You have exclusive permissions to upload and manage Essential Court Forms for all users.
            </span>
          </div>
        ) : (
          <div className="mb-4 flex items-center gap-2.5 px-4 py-2.5 bg-navy-50/70 border border-border rounded-xl text-xs text-navy-600">
            <Info className="w-4 h-4 flex-shrink-0 text-navy-400" />
            <span>
              All authenticated members can view and download official court templates below.
            </span>
          </div>
        )}

        <DocumentsModule
          className="max-w-5xl"
          firmWide
          canUpload={isSuperAdmin}
          canDelete={isSuperAdmin}
          category="important"
        />
      </AppShell>
    </RouteGuard>
  );
}
