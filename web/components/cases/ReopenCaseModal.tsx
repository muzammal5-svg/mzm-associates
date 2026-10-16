"use client";

import { useTranslation }   from "react-i18next";
import { useForm }          from "react-hook-form";
import { z }                from "zod";
import { zodResolver }      from "@hookform/resolvers/zod";
import { RefreshCw }        from "lucide-react";

import { Modal }            from "@/components/ui/Modal";
import { Textarea }         from "@/components/ui/Textarea";
import { Button }           from "@/components/ui/Button";
import { useToast }         from "@/components/ui/Toast";
import { useReopenCase }    from "@/hooks/useActivityLog";

const schema = z.object({
  reason: z.string().min(5, "Please provide a reason (min 5 characters)"),
});
type FormData = z.infer<typeof schema>;

interface ReopenCaseModalProps {
  caseId:  string;
  caseRef: string;
  open:    boolean;
  onClose: () => void;
}

export function ReopenCaseModal({ caseId, caseRef, open, onClose }: ReopenCaseModalProps) {
  const { t }       = useTranslation();
  const toast       = useToast();
  const reopen      = useReopenCase();

  const {
    register, handleSubmit, reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    try {
      await reopen.mutateAsync({ caseId, reason: data.reason });
      toast.success(t("common.caseReopened"), `${caseRef} ${t("common.movedBackToRunning", { ref: caseRef })}`);
      reset();
      onClose();
    } catch (err: unknown) {
      toast.error(t("common.error"), err instanceof Error ? err.message : "Failed.");
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={t("common.reopenCase")} size="sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <p className="text-sm text-navy-400">
          {t("common.reopenNote")}
        </p>
        <Textarea
          label={t("common.reasonForReopen")}
          required
          rows={3}
          placeholder={t("common.reasonPlaceholder")}
          error={errors.reason?.message}
          {...register("reason")}
        />
        <div className="flex gap-3">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            {t("common.cancel")}
          </Button>
          <Button
            type="submit"
            loading={isSubmitting || reopen.isPending}
            leftIcon={<RefreshCw className="w-4 h-4" />}
            className="flex-1"
          >
            {t("common.reopenCase")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
