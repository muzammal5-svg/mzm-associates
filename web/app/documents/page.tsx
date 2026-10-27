"use client";

import { AppShell } from "@/components/layout/AppShell";
import { DocumentsModule } from "@/components/documents/DocumentsModule";
import { RouteGuard } from "@/components/shared/RouteGuard";

export default function DocumentsPage() {
  return (
    <RouteGuard>
      <AppShell pageTitle="Documents">
        <DocumentsModule className="max-w-5xl" firmWide category="regular" />
      </AppShell>
    </RouteGuard>
  );
}
