"use client";

import Image from "next/image";
import { useState }        from "react";
import { useTranslation }  from "react-i18next";
import {
  FileText, Download, Trash2, Eye,
  File as FileIcon, Image as ImageIcon,
} from "lucide-react";
import { useDocuments, useDeleteDocument, getDocumentUrl } from "@/hooks/useDocuments";
import { SkeletonCard }    from "@/components/ui/Skeleton";
import { EmptyState }      from "@/components/ui/EmptyState";
import { QueryErrorState } from "@/components/ui/QueryErrorState";
import { ConfirmDialog }   from "@/components/ui/Modal";
import { useToast }        from "@/components/ui/Toast";
import { useRoleGuard }    from "@/hooks/useRoleGuard";
import { useMutationLock } from "@/components/shared/MutatingButton";
import { fmtDate }         from "@/lib/utils";
import { formatFileSize }  from "@/lib/imageCompress";
import { cn }              from "@/lib/utils";
import type { Document }   from "@/types/supabase";

interface DocumentListProps {
  clientId?: string | null;
  caseId?:   string | null;
  filterClientId?: string | null;
  filterCaseId?: string | null;
  search?: string;
  documentType?: string;
  className?: string;
}

function DocIcon({ mime }: { mime: string | null }) {
  if (!mime) return <FileIcon className="w-5 h-5 text-navy-300" />;
  if (mime.startsWith("image/"))       return <ImageIcon className="w-5 h-5 text-blue-500" />;
  if (mime === "application/pdf")      return <FileText  className="w-5 h-5 text-red-500" />;
  return <FileIcon className="w-5 h-5 text-navy-300" />;
}

function DocPreviewModal({ url, mime, onClose }: { url: string; mime: string | null; onClose: () => void }) {
  const { t } = useTranslation();
  return (
    <div
      className="fixed inset-0 z-[80] bg-navy/80 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-label={t("common.view")}
    >
      <div
        className="max-w-3xl max-h-[90dvh] w-full bg-white rounded-2xl overflow-hidden shadow-modal"
        onClick={e => e.stopPropagation()}
      >
        {mime?.startsWith("image/") ? (
          <Image
            src={url}
            alt={t("documents.pdfPreview")}
            width={1200}
            height={900}
            unoptimized
            className="w-full h-full object-contain"
          />
        ) : mime === "application/pdf" ? (
          <iframe src={url} title={t("documents.pdfPreview")} className="w-full h-[80dvh]" />
        ) : (
          <div className="p-8 text-center">
            <p className="text-navy-400 text-sm mb-4">{t("common.noPreview")}</p>
            <a href={url} download className="btn-primary">{t("common.download")}</a>
          </div>
        )}
      </div>
    </div>
  );
}

export function DocumentList({
  clientId, caseId, filterClientId, filterCaseId, search, documentType, className,
}: DocumentListProps) {
  const { t }         = useTranslation();
  const toast         = useToast();
  const { canDeleteDocuments } = useRoleGuard();
  const { lock } = useMutationLock();

  const { data: docs, isLoading, isError, refetch } = useDocuments({
    clientId, caseId, filterClientId, filterCaseId, search, documentType,
  });
  const deleteMut                 = useDeleteDocument();

  const [confirmDoc, setConfirmDoc] = useState<Document | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewMime, setPreviewMime] = useState<string | null>(null);

  async function handleDownload(doc: Document) {
    const url = await getDocumentUrl(doc.file_path);
    if (!url) { toast.error(t("common.error"), t("common.downloadLinkError")); return; }
    const a = document.createElement("a");
    a.href     = url;
    a.download = doc.name;
    a.click();
  }

  async function handlePreview(doc: Document) {
    const url = await getDocumentUrl(doc.file_path);
    if (!url) { toast.error(t("common.error"), t("common.previewLoadError")); return; }
    setPreviewUrl(url);
    setPreviewMime(doc.mime);
  }

  async function handleDelete() {
    if (!confirmDoc) return;
    try {
      await deleteMut.mutateAsync({ doc: confirmDoc });
      toast.success(t("common.documentDeleted"));
    } catch {
      toast.error(t("common.error"), t("common.couldNotDelete"));
    } finally {
      setConfirmDoc(null);
    }
  }

  if (isLoading) {
    return (
      <div className={cn("space-y-2", className)}>
        {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (isError) {
    return <QueryErrorState onRetry={() => void refetch()} className={className} />;
  }

  if (!docs || docs.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title={t("common.noDocuments")}
        message={t("common.uploadDocsHint")}
        className={className}
      />
    );
  }

  return (
    <>
      <div className={cn("space-y-2", className)}>
        {docs.map(doc => (
          <div
            key={doc.id}
            className="flex items-center gap-3 p-3 bg-white rounded-xl border border-navy-50 shadow-card"
          >
            {/* Icon */}
            <div className="w-9 h-9 rounded-lg bg-navy-50 flex items-center justify-center flex-shrink-0">
              <DocIcon mime={doc.mime} />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-navy truncate">{doc.name}</p>
              <p className="text-[11px] text-navy-400">
                {fmtDate(doc.created_at)}
                {doc.size ? ` · ${formatFileSize(doc.size)}` : ""}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {/* Preview — images + PDFs */}
              {(doc.mime?.startsWith("image/") || doc.mime === "application/pdf") && (
                <button
                  onClick={() => handlePreview(doc)}
                  aria-label={t("common.view")}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-navy-300 hover:bg-navy-50 hover:text-navy transition-colors"
                >
                  <Eye className="w-4 h-4" />
                </button>
              )}
              {/* Download */}
              <button
                onClick={() => handleDownload(doc)}
                aria-label={t("documents.download")}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-navy-300 hover:bg-navy-50 hover:text-navy transition-colors"
              >
                <Download className="w-4 h-4" />
              </button>
              {/* Delete */}
              {canDeleteDocuments && (
                <button
                  onClick={() => setConfirmDoc(doc)}
                  {...lock}
                  aria-label={t("documents.delete")}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-navy-300 hover:bg-red-50 hover:text-danger transition-colors disabled:opacity-40"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!confirmDoc}
        onClose={() => setConfirmDoc(null)}
        onConfirm={handleDelete}
        title={t("documents.delete")}
        message={`Delete "${confirmDoc?.name}"? This cannot be undone.`}
        confirmLabel={t("documents.delete")}
        confirmVariant="danger"
        loading={deleteMut.isPending}
      />

      {/* Preview modal */}
      {previewUrl && (
        <DocPreviewModal
          url={previewUrl}
          mime={previewMime}
          onClose={() => { setPreviewUrl(null); setPreviewMime(null); }}
        />
      )}
    </>
  );
}
