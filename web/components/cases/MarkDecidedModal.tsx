"use client";

import { useState, useRef }     from "react";
import { useTranslation }       from "react-i18next";
import { useForm }              from "react-hook-form";
import { zodResolver }          from "@hookform/resolvers/zod";
import { z }                    from "zod";
import { CheckSquare, Upload, X, FileText } from "lucide-react";

import { Modal, BottomSheet }   from "@/components/ui/Modal";
import { Select }               from "@/components/ui/Select";
import { DatePicker }           from "@/components/ui/DatePicker";
import { Textarea }             from "@/components/ui/Textarea";
import { Button }               from "@/components/ui/Button";
import { MutatingButton, useMutationLock } from "@/components/shared/MutatingButton";
import { useToast }             from "@/components/ui/Toast";
import { useAuth }              from "@/providers/AuthProvider";
import { useMarkAsDecidedFull } from "@/hooks/useActivityLog";
import { supabase, uploadDocument } from "@/lib/supabase/client";
import { todayKarachi, fmtDate } from "@/lib/utils";
import { compressImage, formatFileSize, ALLOWED_MIME_ACCEPT, ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from "@/lib/imageCompress";
import type { CaseOutcome }     from "@/types/supabase";

const schema = z.object({
  decision_date:  z.string().min(1, "Required"),
  outcome:        z.enum(["won","lost","dismissed","settled","withdrawn"] as const),
  decision_notes: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

interface MarkDecidedModalProps {
  caseId:    string;
  caseRef:   string;
  parties:   string;
  open:      boolean;
  onClose:   () => void;
}

export function MarkDecidedModal({
  caseId, caseRef, parties, open, onClose,
}: MarkDecidedModalProps) {
  const { t }       = useTranslation();
  const toast       = useToast();
  const { profile } = useAuth();
  const { lock, canMutate } = useMutationLock();
  const fileRef     = useRef<HTMLInputElement>(null);

  const markDecided = useMarkAsDecidedFull();
  const [docFile,    setDocFile]    = useState<File | null>(null);
  const [uploading,  setUploading]  = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const {
    register, handleSubmit, reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { decision_date: todayKarachi() },
  });

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      toast.warning(t("common.fileSkipped"), `${file.name} ${t("common.fileTooLarge", { size: formatFileSize(MAX_FILE_SIZE) })}`);
      e.target.value = "";
      return;
    }
    if (!(ALLOWED_MIME_TYPES as readonly string[]).includes(file.type)) {
      toast.warning(t("common.fileSkipped"), `${file.name} ${t("common.unsupportedType")}`);
      e.target.value = "";
      return;
    }
    try {
      const compressed = await compressImage(file);
      setDocFile(compressed);
    } catch (error) {
      toast.error(t("common.unableToProcess"), error instanceof Error ? error.message : file.name);
    }
  }

  async function onSubmit(data: FormData) {
    if (!profile) return;
    let uploadedPath: string | null = null;
    try {
      let document: { name: string; file_path: string; mime: string; size: number } | undefined;
      if (docFile) {
        setUploading(true);
        const upload = await uploadDocument(profile.firm_id, docFile, setUploadProgress);
        uploadedPath = upload.path;
        document = {
          name: `Final Order — ${caseRef}`,
          file_path: uploadedPath,
          mime: docFile.type,
            size: docFile.size,
        };
      }

      await markDecided.mutateAsync({
        caseId,
        decisionDate:  data.decision_date,
        outcome:       data.outcome as CaseOutcome,
        decisionNotes: data.decision_notes,
        document,
      });

      toast.success(t("common.caseDecided"), `${caseRef} ${t("common.movedToDecided", { ref: caseRef })}`);
      reset();
      setDocFile(null);
      setUploading(false);
      setUploadProgress(0);
      onClose();
    } catch (err: unknown) {
      setUploading(false);
      setUploadProgress(0);
      const message = err instanceof Error ? err.message : "Failed.";
      if (uploadedPath) {
        const { error: cleanupError } = await supabase.storage.from("documents").remove([uploadedPath]);
        if (cleanupError) {
          toast.error(t("common.error"), `${message} Uploaded file cleanup failed: ${cleanupError.message}`);
          return;
        }
      }
      toast.error(t("common.error"), message);
    }
  }

  const formContent = (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      {/* Case info */}
      <div className="bg-navy-50 rounded-xl px-3 py-2.5">
        <p className="text-xs font-mono text-gold font-semibold">{caseRef}</p>
        <p className="text-sm text-navy font-medium truncate mt-0.5">{parties}</p>
      </div>

      <DatePicker
        label={t("common.decisionDate")}
        required
        error={errors.decision_date?.message}
        {...register("decision_date")}
      />

      <Select
        label={t("common.outcome")}
        required
        options={[
          { value: "won",       label: t("common.outcomeWon") },
          { value: "lost",      label: t("common.outcomeLost") },
          { value: "dismissed", label: t("common.outcomeDismissed") },
          { value: "settled",   label: t("common.outcomeSettled") },
          { value: "withdrawn", label: t("common.outcomeWithdrawn") },
        ]}
        error={errors.outcome?.message}
        {...register("outcome")}
      />

      <Textarea
        label={t("common.decisionNotes")}
        rows={3}
        placeholder={t("common.decisionNotesPlaceholder")}
        {...register("decision_notes")}
      />

      {/* Optional final order upload */}
      <div className="space-y-1.5">
        <label className="label">
          {t("common.finalOrderDocument")} <span className="text-navy-300 text-xs">{t("common.finalOrderOptional")}</span>
        </label>
        {docFile ? (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-success/30 rounded-xl">
            <FileText className="w-4 h-4 text-success flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-navy truncate">{docFile.name}</p>
              <p className="text-[11px] text-navy-400">{formatFileSize(docFile.size)}</p>
            </div>
            {uploading &&             <progress className="w-full" max={100} value={uploadProgress} aria-label={t("common.uploadProgress", { progress: uploadProgress })} />}
            <button
              type="button"
              onClick={() => { setDocFile(null); if (fileRef.current) fileRef.current.value = ""; }}
              className="text-navy-300 hover:text-danger transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            {...lock}
            className="w-full flex items-center gap-2 p-3 border-2 border-dashed border-navy-100 rounded-xl hover:border-gold hover:bg-gold-50/30 transition-colors text-sm text-navy-400 disabled:opacity-50"
          >
            <Upload className="w-4 h-4 flex-shrink-0" />
            {t("common.uploadFinalOrder")}
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept={ALLOWED_MIME_ACCEPT}
          className="sr-only"
          disabled={!canMutate}
          onChange={handleFileChange}
        />
      </div>

      <p className="text-[11px] text-navy-400 bg-yellow-50 border border-yellow-100 rounded-lg px-3 py-2">
        {t("common.decidedMoveNote")}
      </p>

      <div className="flex gap-3">
        <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
          {t("common.cancel")}
        </Button>
        <MutatingButton
          type="submit"
          loading={isSubmitting || uploading}
          leftIcon={<CheckSquare className="w-4 h-4" />}
          className="flex-1"
        >
          {t("common.markAsDecided")}
        </MutatingButton>
      </div>
    </form>
  );

  return (
    <>
      <BottomSheet open={open} onClose={onClose} title={t("common.markAsDecided")} snapPoints="auto" className="md:hidden">
        {formContent}
      </BottomSheet>
      <Modal open={open} onClose={onClose} title={t("common.markAsDecided")} size="md" className="hidden md:flex">
        {formContent}
      </Modal>
    </>
  );
}
