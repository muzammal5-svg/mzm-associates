"use client";

import { useEffect }        from "react";
import { useTranslation }   from "react-i18next";
import { useForm }          from "react-hook-form";
import { z }                from "zod";
import { zodResolver }      from "@hookform/resolvers/zod";

import { BottomSheet, Modal } from "@/components/ui/Modal";
import { Input }              from "@/components/ui/Input";
import { Textarea }           from "@/components/ui/Textarea";
import { Button }             from "@/components/ui/Button";
import { MutatingButton }     from "@/components/shared/MutatingButton";
import { useToast }           from "@/components/ui/Toast";
import { useQuickUpdateHearing } from "@/hooks/useHearings";
import type { CauseListRow }  from "@/types/supabase";

const schema = z.object({
  serial_no:          z.string().optional(),
  current_proceeding: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

interface QuickEditSheetProps {
  row:     CauseListRow | null;
  onClose: () => void;
}

export function QuickEditSheet({ row, onClose }: QuickEditSheetProps) {
  const { t }    = useTranslation();
  const toast    = useToast();
  const quickEdit = useQuickUpdateHearing();

  const { register, handleSubmit, reset, formState: { isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!row) return;
    reset({
      serial_no:          row.serial_no          ?? "",
      current_proceeding: row.current_proceeding ?? "",
    });
  }, [row, reset]);

  async function onSubmit(data: FormData) {
    if (!row?.hearing_id) return;
    try {
      await quickEdit.mutateAsync({
        hearingId:         row.hearing_id,
        serialNo:          data.serial_no,
        currentProceeding: data.current_proceeding ?? undefined,
      });
      toast.success(t("common.saved"));
      onClose();
    } catch { toast.error(t("common.error")); }
  }

  const isOpen   = !!row;
  const content = (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {row && (
        <div className="bg-navy-50 rounded-xl px-3 py-2.5">
          <p className="text-xs font-mono text-gold font-semibold">{row.case_ref_no}</p>
          <p className="text-sm text-navy truncate">{row.plaintiff_name} {t("cases.vs")} {row.defendant_name}</p>
        </div>
      )}
      <Input label={t("hearings.serialNo")} placeholder={t("common.serialPlaceholder")} {...register("serial_no")} />
      <Textarea label={t("hearings.currentProceeding")} rows={3}
        placeholder={t("common.currentProceedingPlaceholder")} {...register("current_proceeding")} />
      <div className="flex gap-3">
        <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
          {t("common.cancel")}
        </Button>
        <MutatingButton type="submit" loading={isSubmitting} className="flex-1">
          {t("common.save")}
        </MutatingButton>
      </div>
    </form>
  );

  return (
    <>
      <BottomSheet open={isOpen} onClose={onClose} title={t("common.quickEdit")} className="md:hidden">
        {content}
      </BottomSheet>
      <Modal open={isOpen} onClose={onClose} title={t("common.quickEdit")} size="sm" className="hidden md:flex">
        {content}
      </Modal>
    </>
  );
}
