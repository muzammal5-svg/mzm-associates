"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { DocumentUploader } from "./DocumentUploader";
import { DocumentList }     from "./DocumentList";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { QueryErrorState } from "@/components/ui/QueryErrorState";
import { useDocumentFilterOptions } from "@/hooks/useDocuments";

interface DocumentsModuleProps {
  clientId?: string | null;
  caseId?:   string | null;
  className?: string;
  firmWide?: boolean;
  canUpload?: boolean;
  canDelete?: boolean;
  category?: string;
}

/**
 * Reusable Documents module.
 * Accepts {clientId?, caseId?} — same component used for:
 *   - Client profile → pass clientId
 *   - Case detail    → pass caseId
 *   - Decided cases  → pass caseId
 */
export function DocumentsModule({ clientId, caseId, className, firmWide = false, canUpload = true, canDelete = true, category }: DocumentsModuleProps) {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [filterClientId, setFilterClientId] = useState("");
  const [filterCaseId, setFilterCaseId] = useState("");
  const [documentType, setDocumentType] = useState("");
  const isImportantForms = category === "important";
  const filters = useDocumentFilterOptions(firmWide && !isImportantForms);

  return (
    <div className={className}>
      {firmWide && (
        <div className="mb-4 space-y-3 rounded-xl border border-border bg-white p-4 shadow-xs">
          <div className={cn("grid gap-3", isImportantForms ? "sm:grid-cols-3" : "grid-cols-1")}>
            <div className={isImportantForms ? "sm:col-span-2" : ""}>
              <Input
                label={isImportantForms ? (t("documents.searchForms") || "Search Court Forms") : t("common.searchDocuments")}
                placeholder={isImportantForms ? "Search form name (e.g. Vakalatnama, Bail, Stay Order)..." : t("common.documentName")}
                value={search}
                onChange={event => setSearch(event.target.value)}
              />
            </div>
            {isImportantForms && (
              <Select
                label={t("cases.caseType") || "Format"}
                value={documentType}
                onChange={event => setDocumentType(event.target.value)}
                placeholder={t("common.allTypes")}
                options={[
                  { value: "pdf", label: t("common.pdf") || "PDF" },
                  { value: "image", label: "Images" },
                  { value: "other", label: "Word / Other" },
                ]}
              />
            )}
          </div>
          {!isImportantForms && (
            filters.isError ? (
              <QueryErrorState onRetry={() => void filters.refetch()} className="py-5" />
            ) : (
              <div className="grid gap-3 sm:grid-cols-3">
                <Select
                  label={t("clients.title")}
                  value={filterClientId}
                  onChange={event => setFilterClientId(event.target.value)}
                  placeholder={t("common.allClients")}
                  options={(filters.data?.clients ?? []).map(client => ({
                    value: client.id, label: client.full_name,
                  }))}
                />
                <Select
                  label={t("cases.caseReference")}
                  value={filterCaseId}
                  onChange={event => setFilterCaseId(event.target.value)}
                  placeholder={t("common.allCases")}
                  options={(filters.data?.cases ?? []).map(case_ => ({
                    value: case_.id, label: case_.case_ref_no,
                  }))}
                />
                <Select
                  label={t("cases.caseType")}
                  value={documentType}
                  onChange={event => setDocumentType(event.target.value)}
                  placeholder={t("common.allTypes")}
                  options={[
                    { value: "pdf", label: t("common.pdf") },
                    { value: "image", label: "Images" },
                    { value: "other", label: "Other" },
                  ]}
                />
              </div>
            )
          )}
        </div>
      )}
      {canUpload && (
        <DocumentUploader
          clientId={clientId}
          caseId={caseId}
          category={category}
          className="mb-4"
        />
      )}
      <DocumentList
        clientId={clientId}
        caseId={caseId}
        filterClientId={firmWide ? filterClientId || null : null}
        filterCaseId={firmWide ? filterCaseId || null : null}
        search={firmWide ? search : undefined}
        documentType={firmWide ? documentType : undefined}
        canDelete={canDelete}
        category={category}
      />
    </div>
  );
}
