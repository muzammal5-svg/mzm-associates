"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { useTranslation }                from "react-i18next";
import { Upload, Camera, X, File as FileIcon, CheckCircle, AlertCircle } from "lucide-react";
import { supabase, uploadDocument } from "@/lib/supabase/client";
import { insert }          from "@/lib/supabase/client";
import { useAuth }         from "@/providers/AuthProvider";
import { useMutationLock } from "@/components/shared/MutatingButton";
import { useQueryClient }  from "@tanstack/react-query";
import {
  compressImage, formatFileSize,
  ALLOWED_MIME_ACCEPT, ALLOWED_MIME_TYPES, MAX_FILE_SIZE,
} from "@/lib/imageCompress";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

export interface UploadedFile {
  name:      string;
  file_path: string;
  mime:      string;
  size:      number;
}

interface DocumentUploaderProps {
  clientId?:  string | null;
  caseId?:    string | null;
  category?:  string;
  onUploaded?: (doc: UploadedFile) => void;
  /** If true, drop zone + file picker only — no DB insert (used in Add Client wizard before client exists) */
  pendingMode?: boolean;
  onPending?:  (files: PendingFile[]) => void;
  className?:  string;
}

export interface PendingFile {
  id:       string;
  file:     File;
  name:     string;   // user-editable label
  preview?: string;   // object URL for images
}

interface FileEntry {
  id:       string;
  file:     File;
  name:     string;
  progress: number;   // 0-100
  status:   "pending" | "uploading" | "done" | "error";
  error?:   string;
  preview?: string;
}

export function DocumentUploader({
  clientId, caseId, category, onUploaded, pendingMode = false, onPending, className,
}: DocumentUploaderProps) {
  const { t }       = useTranslation();
  const { profile } = useAuth();
  const { canMutate, lock, renewTooltip } = useMutationLock();
  const qc          = useQueryClient();
  const toast       = useToast();
  const fileRef     = useRef<HTMLInputElement>(null);
  const cameraRef   = useRef<HTMLInputElement>(null);
  const [entries,   setEntries]  = useState<FileEntry[]>([]);
  const [dragging,  setDragging] = useState(false);

  async function addFiles(raw: FileList | File[]) {
    if (!canMutate) return;
    const files = Array.from(raw);
    const newEntries: FileEntry[] = [];

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        toast.warning(t("common.fileSkipped"), `${file.name} ${t("common.fileTooLarge", { size: formatFileSize(MAX_FILE_SIZE) })}`);
        continue;
      }
      if (!(ALLOWED_MIME_TYPES as readonly string[]).includes(file.type)) {
        toast.warning(t("common.fileSkipped"), `${file.name} ${t("common.unsupportedType")}`);
        continue;
      }
      let compressed: File;
      try {
        compressed = await compressImage(file);
      } catch (error) {
        toast.error(t("common.unableToProcess"), `${file.name}: ${error instanceof Error ? error.message : t("common.couldNotDelete")}`);
        continue;
      }
      const preview = compressed.type.startsWith("image/")
        ? URL.createObjectURL(compressed)
        : undefined;
      newEntries.push({
        id:       crypto.randomUUID(),
        file:     compressed,
        name:     file.name.replace(/\.\w+$/, ""),
        progress: 0,
        status:   "pending",
        preview,
      });
    }

    setEntries(prev => [...prev, ...newEntries]);

    if (pendingMode && onPending) {
      onPending(newEntries.map(e => ({ id: e.id, file: e.file, name: e.name, preview: e.preview })));
      return;
    }

    // Upload immediately
    for (const entry of newEntries) {
      await uploadEntry(entry);
    }
  }

  async function uploadEntry(entry: FileEntry) {
    if (!profile) return;
    const firmId = profile.firm_id;
    const isSuperAdmin = profile.role === "super_admin";
    const storagePrefix = isSuperAdmin && !firmId ? "super_admin" : firmId;

    if (!firmId && !isSuperAdmin) {
      setEntries(prev => prev.map(e =>
        e.id === entry.id ? { ...e, status: "error", error: t("documents.firmRequired"), progress: 0 } : e
      ));
      return;
    }
    setEntries(prev => prev.map(e =>
      e.id === entry.id ? { ...e, status: "uploading", progress: 0 } : e
    ));

    let uploadedPath: string | null = null;
    try {
      const upload = await uploadDocument(storagePrefix, entry.file, progress => {
        setEntries(prev => prev.map(e =>
          e.id === entry.id ? { ...e, progress } : e
        ));
      });
      uploadedPath = upload.path;

      const { error: dbErr } = await insert.document({
        firm_id:     firmId ?? null,
        client_id:   clientId ?? null,
        case_id:     caseId   ?? null,
        category:    category ?? null,
        name:        entry.name || entry.file.name,
        file_path:   upload.path,
        mime:        entry.file.type,
        size:        entry.file.size,
        uploaded_by: profile.id,
      });

      if (dbErr) throw dbErr;

      setEntries(prev => prev.map(e =>
        e.id === entry.id ? { ...e, status: "done", progress: 100 } : e
      ));

      qc.invalidateQueries({ queryKey: ["documents", clientId ?? null, caseId ?? null] });
      onUploaded?.({ name: entry.name, file_path: upload.path, mime: entry.file.type, size: entry.file.size });

    } catch (err: unknown) {
      if (uploadedPath) {
        const { error: cleanupError } = await supabase.storage.from("documents").remove([uploadedPath]);
        if (cleanupError) console.error("[documents] upload compensation failed:", cleanupError.message);
      }
      const msg = err instanceof Error ? err.message : "Upload failed";
      setEntries(prev => prev.map(e =>
        e.id === entry.id ? { ...e, status: "error", error: msg, progress: 0 } : e
      ));
    }
  }

  function removeEntry(id: string) {
    setEntries(prev => {
      const e = prev.find(x => x.id === id);
      if (e?.preview) URL.revokeObjectURL(e.preview);
      return prev.filter(x => x.id !== id);
    });
  }

  function updateName(id: string, name: string) {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, name } : e));
  }

  // Drag and drop
  function onDrop(e: React.DragEvent) {
    e.preventDefault(); setDragging(false);
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Drop zone */}
      <div
        onDragOver={canMutate ? (e => { e.preventDefault(); setDragging(true); }) : undefined}
        onDragLeave={canMutate ? () => setDragging(false) : undefined}
        onDrop={canMutate ? onDrop : undefined}
        className={cn(
          "border-2 border-dashed rounded-xl p-6 flex flex-col items-center gap-3 transition-colors",
          !canMutate && "opacity-60 cursor-not-allowed",
          canMutate && "cursor-pointer",
          dragging
            ? "border-gold bg-gold-50"
            : "border-navy-100 hover:border-gold hover:bg-gold-50/30"
        )}
        onClick={canMutate ? (() => fileRef.current?.click()) : undefined}
        role="button"
        tabIndex={canMutate ? 0 : -1}
        aria-label={t("documents.upload")}
        aria-disabled={!canMutate}
        title={canMutate ? undefined : renewTooltip}
        onKeyDown={e => canMutate && e.key === "Enter" && fileRef.current?.click()}
      >
        <Upload className="w-8 h-8 text-navy-300" />
        <div className="text-center">
          <p className="text-sm font-medium text-navy">{t("documents.upload")}</p>
          <p className="text-xs text-navy-400 mt-0.5">{t("common.fileTypeHint")}</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={e => { e.stopPropagation(); fileRef.current?.click(); }}
            {...lock}
            className="btn-secondary text-xs px-3 py-1.5 min-h-0 disabled:opacity-50"
          >
            {t("common.browseFiles")}
          </button>
          <button
            type="button"
            onClick={e => { e.stopPropagation(); cameraRef.current?.click(); }}
            {...lock}
            className="btn-secondary text-xs px-3 py-1.5 min-h-0 flex items-center gap-1 disabled:opacity-50"
          >
            <Camera className="w-3.5 h-3.5" /> {t("common.camera")}
          </button>
        </div>
      </div>

      {/* Hidden inputs */}
      <input
        ref={fileRef} type="file" multiple
        accept={ALLOWED_MIME_ACCEPT}
        className="sr-only"
        disabled={!canMutate}
        onChange={e => e.target.files && addFiles(e.target.files)}
      />
      <input
        ref={cameraRef} type="file" multiple
        accept="image/*"
        capture="environment"   // opens rear camera on mobile
        className="sr-only"
        disabled={!canMutate}
        onChange={e => e.target.files && addFiles(e.target.files)}
      />

      {/* File entries */}
      {entries.length > 0 && (
        <div className="space-y-2">
          {entries.map(entry => (
            <div
              key={entry.id}
              className={cn(
                "flex items-start gap-3 p-3 rounded-xl border transition-colors",
                entry.status === "error" ? "border-danger bg-red-50" :
                entry.status === "done"  ? "border-success/30 bg-green-50/30" :
                "border-navy-100 bg-white"
              )}
            >
              {/* Thumbnail / icon */}
              <div className="w-10 h-10 rounded-lg bg-navy-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {entry.preview ? (
                  <Image
                    src={entry.preview}
                    alt=""
                    width={40}
                    height={40}
                    unoptimized
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FileIcon className="w-5 h-5 text-navy-300" />
                )}
              </div>

              {/* Name + status */}
              <div className="flex-1 min-w-0">
                {entry.status === "pending" || entry.status === "uploading" ? (
                  <input
                    type="text"
                    value={entry.name}
                    onChange={e => updateName(entry.id, e.target.value)}
                    placeholder={t("common.documentName")}
                    className="input text-xs py-1 px-2 h-7 mb-1"
                  />
                ) : (
                  <p className="text-xs font-medium text-navy truncate">{entry.name}</p>
                )}

                {/* Progress bar */}
                {entry.status === "uploading" && (
                  <div className="h-1 bg-navy-100 rounded-full mt-1 overflow-hidden">
                    <div
                      className="h-full bg-gold rounded-full transition-all duration-300"
                      style={{ width: `${entry.progress}%` }}
                    />
                  </div>
                )}

                {entry.status === "done" && (
                    <p className="text-[10px] text-success flex items-center gap-1 mt-0.5">
                      <CheckCircle className="w-3 h-3" /> {t("common.uploaded")} · {formatFileSize(entry.file.size)}
                  </p>
                )}
                {entry.status === "error" && (
                  <p className="text-[10px] text-danger flex items-center gap-1 mt-0.5">
                    <AlertCircle className="w-3 h-3" /> {entry.error}
                  </p>
                )}
                {entry.status === "pending" && (
                  <p className="text-[10px] text-navy-400 mt-0.5">{formatFileSize(entry.file.size)}</p>
                )}
              </div>

              {/* Remove */}
              <button
                type="button"
                onClick={() => removeEntry(entry.id)}
                aria-label={t("common.remove")}
                className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-navy-100 transition-colors text-navy-300 hover:text-danger flex-shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
