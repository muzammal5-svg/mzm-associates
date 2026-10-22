"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  UploadCloud, FileImage, FileText, X, CheckCircle2, AlertCircle, Image as ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/Toast";

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

interface ReceiptDropzoneProps {
  file:       File | null;
  onChange:   (file: File | null) => void;
  label?:     string;
  hint?:      string;
  error?:     string;
}

export function ReceiptDropzone({
  file,
  onChange,
  label,
  hint,
  error,
}: ReceiptDropzoneProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const text = label ?? t("billing.uploadSlip");
  const hintText = hint ?? t("billing.uploadHint");

  // Object URL lifecycle
  useEffect(() => {
    if (!file || !file.type.startsWith("image/")) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const validate = (candidate: File): string | null => {
    if (!ACCEPTED.includes(candidate.type)) return t("billing.invalidFileType");
    if (candidate.size > MAX_SIZE) return t("billing.fileTooLarge");
    return null;
  };

  const accept = (candidate: File | undefined | null) => {
    if (!candidate) return;
    const problem = validate(candidate);
    if (problem) {
      setLocalError(problem);
      toast.error(problem, candidate.name);
      return;
    }
    setLocalError(null);
    onChange(candidate);
  };

  const clear = () => {
    setLocalError(null);
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const sizeLabel = file ? `${(file.size / 1024).toFixed(0)} KB` : null;
  const isPdf = file?.type === "application/pdf";
  const hasError = Boolean(error || localError);

  return (
    <div className="space-y-2">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          accept(e.dataTransfer.files?.[0]);
        }}
        className={cn(
          "relative overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300 ease-in-out",
          dragging
            ? "border-gold bg-gold-50/80 shadow-glow-gold"
            : hasError
            ? "border-rose-300 bg-rose-50/50"
            : file
            ? "border-emerald-300/70 bg-emerald-50/40"
            : "border-slate-300 bg-slate-50/60 hover:border-gold/60 hover:bg-gold-50/40"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          className="sr-only"
          onChange={(e) => accept(e.target.files?.[0])}
          aria-label={text}
        />

        {file ? (
          <div className="flex items-center gap-4 p-4">
            {/* Thumbnail */}
            <div className="relative grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl border border-slate-200 bg-white">
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt={t("billing.receiptPreview")} className="h-full w-full object-cover" />
              ) : isPdf ? (
                <FileText className="h-7 w-7 text-rose-500" aria-hidden="true" />
              ) : (
                <FileImage className="h-7 w-7 text-navy-300" aria-hidden="true" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 truncate text-sm font-semibold text-navy">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-success" aria-hidden="true" />
                {file.name}
              </p>
              <p className="mt-0.5 text-xs text-muted">
                {sizeLabel} · {t("billing.fileReady")}
              </p>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                <div className="h-full w-full rounded-full bg-emerald-500" />
              </div>
            </div>

            <button
              type="button"
              onClick={clear}
              aria-label={t("billing.clearFile")}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-navy-400 transition-all duration-200 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold active:scale-[0.98]"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="group flex w-full flex-col items-center gap-2.5 px-6 py-9 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold"
          >
            <span
              className={cn(
                "grid h-14 w-14 place-items-center rounded-2xl transition-all duration-300",
                dragging
                  ? "scale-110 bg-gold-cta text-navy-900 shadow-glow-gold"
                  : "bg-navy-800 text-gold-300 group-hover:scale-105"
              )}
              aria-hidden="true"
            >
              <UploadCloud className="h-6 w-6" />
            </span>
            <span className="text-sm font-semibold text-navy">{text}</span>
            <span className="text-xs text-muted">{hintText}</span>
            <span className="mt-1 inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-[11px] font-semibold text-navy-600 shadow-sm ring-1 ring-slate-200">
              <ImageIcon className="h-3.5 w-3.5 text-gold" aria-hidden="true" />
              {t("billing.browseFiles")}
            </span>
          </button>
        )}
      </div>

      {(error || localError) && (
        <p role="alert" className="flex items-center gap-1.5 text-xs font-medium text-danger">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {error || localError}
        </p>
      )}
    </div>
  );
}
