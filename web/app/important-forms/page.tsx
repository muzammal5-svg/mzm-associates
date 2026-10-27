"use client";

import { AppShell } from "@/components/layout/AppShell";
import { DocumentsModule } from "@/components/documents/DocumentsModule";
import { RouteGuard } from "@/components/shared/RouteGuard";
import { useRoleGuard } from "@/hooks/useRoleGuard";

export default function ImportantFormsPage() {
  const { isSuperAdmin } = useRoleGuard();
  return (
    <RouteGuard>
      <AppShell pageTitle="Important Forms">
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
