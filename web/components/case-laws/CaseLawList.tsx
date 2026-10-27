"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useCaseLaws, useDeleteCaseLaw, LAW_REPORT_OPTIONS } from "@/hooks/useCaseLaws";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { ResponsiveList } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { type CaseLaw } from "@/types/supabase";
import { Plus, Trash2, Edit, Search, ChevronLeft, ChevronRight } from "lucide-react";

interface CaseLawListProps {
  onEdit?: (caseLaw: CaseLaw | null) => void;
}

export function CaseLawList({ onEdit }: CaseLawListProps = {}) {
  const { t } = useTranslation();
  const { isSuperAdmin } = useRoleGuard();

  const [search, setSearch] = useState("");
  const [lawReportFilter, setLawReportFilter] = useState<string>("all");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useCaseLaws({
    search,
    lawReport: lawReportFilter === "all" ? undefined : lawReportFilter,
    page,
    pageSize: 10,
  });

  const caseLaws = data?.caseLaws ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 0;
  const deleteCaseLaw = useDeleteCaseLaw();

  const handleDelete = async (id: string) => {
    if (!window.confirm(t("caseLaws.confirmDelete"))) return;
    await deleteCaseLaw.mutateAsync(id);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar: search + filter + add */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Input
            label={t("caseLaws.search")}
            placeholder={t("caseLaws.searchPlaceholder")}
            value={search}
            onChange={e => setSearch(e.target.value)}
            leftElement={<Search className="w-4 h-4" />}
          />
          <Select
            label={t("caseLaws.filterByLawReport")}
            options={[
              { value: "all", label: t("common.all") },
              ...LAW_REPORT_OPTIONS,
            ]}
            value={lawReportFilter}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setLawReportFilter(e.target.value)}
            placeholder={t("common.all")}
          />
        </div>
        {isSuperAdmin && (
          <Button
            size="sm"
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => onEdit?.(null)}
          >
            {t("caseLaws.addCaseLaw")}
          </Button>
        )}
      </div>

      {/* Empty state */}
      {isLoading ? (
        <SkeletonTable rows={5} />
      ) : caseLaws.length === 0 ? (
        <EmptyState
          title={t("caseLaws.noCaseLaws")}
          message={t("caseLaws.noCaseLawsMessage")}
        />
      ) : (
        <ResponsiveList
          columns={[
            {
              key: "citation",
              header: t("caseLaws.citation"),
              render: (row) => (
                <span className="font-medium text-navy">{`${row.law_report} ${row.year} ${row.page_no}`}</span>
              ),
              className: "font-mono",
            },
            {
              key: "title",
              header: t("caseLaws.caseTitle"),
              render: (row) => (
                <p className="text-navy-400 truncate max-w-[200px]">{row.case_title}</p>
              ),
            },
            {
              key: "badge",
              header: t("caseLaws.type"),
              render: (row) => (
                <Badge variant="navy" size="sm">{row.law_report}</Badge>
              ),
            },
            {
              key: "actions",
              header: "",
              render: (row, index) => (
                <div className="flex items-center gap-2">
                  {isSuperAdmin && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit?.(row);
                      }}
                      title={t("common.edit")}
                      className="w-8 h-8 flex items-center justify-center rounded text-navy-300 hover:bg-navy-50 hover:text-navy transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}
                  {isSuperAdmin && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(row.id);
                      }}
                      title={t("common.delete")}
                      className="w-8 h-8 flex items-center justify-center rounded text-navy-300 hover:bg-danger/10 hover:text-danger transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ),
              className: "text-center",
              headerClass: "text-center",
            },
          ]}
          data={caseLaws}
          keyExtractor={(row) => row.id}
          renderMobile={(row, index) => (
            <div className="rounded-xl border border-navy-50 p-3 bg-white">
              <div className="flex justify-between items-start mb-2">
                <span className="font-medium text-navy font-mono">{`${row.law_report} ${row.year} ${row.page_no}`}</span>
                <Badge variant="navy" size="sm">{row.law_report}</Badge>
              </div>
              <p className="text-navy-400 text-sm">{row.case_title}</p>
              <div className="mt-3 flex items-center gap-2">
                {isSuperAdmin && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onEdit?.(row); }}
                    className="text-xs text-navy-300 hover:text-navy underline underline-offset-2"
                  >
                    {t("common.edit")}
                  </button>
                )}
                {isSuperAdmin && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(row.id); }}
                    className="text-xs text-danger hover:text-red-700 underline underline-offset-2"
                  >
                    {t("common.delete")}
                  </button>
                )}
              </div>
            </div>
          )}
          emptyMessage={t("caseLaws.noCaseLaws")}
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="ghost"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-xs text-navy-400">
            {t("common.page", { current: page, total: totalPages })}
          </span>
          <Button
            variant="ghost"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
