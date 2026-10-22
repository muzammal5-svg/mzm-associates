"use client";

import { AppShell } from "@/components/layout/AppShell";
import { DocumentsModule } from "@/components/documents/DocumentsModule";
import { RouteGuard } from "@/components/shared/RouteGuard";

export default function ImportantFormsPage() {
  return (
    <RouteGuard>
      <AppShell pageTitle="Important Forms">
        <DocumentsModule className="max-w-5xl" firmWide />
      </AppShell>
    </RouteGuard>
  );
}
