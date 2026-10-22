"use client";

import { useEffect, useMemo } from "react";
import { useTranslation }   from "react-i18next";
import { useForm }          from "react-hook-form";
import { zodResolver }      from "@hookform/resolvers/zod";
import { z }                from "zod";
import { CalendarPlus }     from "lucide-react";

import { BottomSheet, Modal } from "@/components/ui/Modal";
import { Input }              from "@/components/ui/Input";
import { DatePicker }         from "@/components/ui/DatePicker";
import { Textarea }           from "@/components/ui/Textarea";
import { Button }             from "@/components/ui/Button";
import { MutatingButton }     from "@/components/shared/MutatingButton";
import { useToast }           from "@/components/ui/Toast";
import { useUpdateHearing }   from "@/hooks/useHearings";
import type { CauseListRow }  from "@/types/supabase";

const schema = z.object({
  current_proceeding: z.string().min(1, "Required — describe what happened today"),
  serial_no:          z.string().optional(),
  next_date:          z
    .string()
    .min(1, "Next date is required")
    .refine(v => /^\d{4}-\d{2}-\d{2}$/.test(v), { message: "Enter a valid date" }),
  next_proceeding:    z.string().optional(),
  judge_change:       z.string().optional(),
  court_change:       z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface UpdateHearingSheetProps {
  row:      CauseListRow | null;
  onClose:  () => void;
}

export function UpdateHearingSheet({ row, onClose }: UpdateHearingSheetProps) {
  const { t }       = useTranslation();
  const toast       = useToast();
  const update      = useUpdateHearing();
  const currentHearingDate = row?.hearing_date;
  const formSchema = useMemo(
    () => schema.refine(
      data => !currentHearingDate || data.next_date > currentHearingDate,
      { path: ["next_date"], message: "Next date must be after the current hearing date" }
    ),
    [currentHearingDate]
  );

  const {
    register, handleSubmit, reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(formSchema) });

  useEffect(() => {
    if (!row?.hearing_id || !row.case_id) return;
    reset({
      serial_no:     row.serial_no ?? "",
      judge_change:  row.hearing_judge ?? "",
      court_change:  row.hearing_court_no ?? "",
    });
  }, [row, reset]);

  async function onSubmit(data: FormData) {
    if (!row?.hearing_id || !row.case_id) return;
    try {
      await update.mutateAsync({
        currentHearingId:  row.hearing_id,
        caseId:            row.case_id,
        currentProceeding: data.current_proceeding,
        serialNo:          data.serial_no || undefined,
        nextDate:          data.next_date,
        nextProceeding:    data.next_proceeding || undefined,
        judgeChange:       data.judge_change || undefined,
        courtChange:       data.court_change || undefined,
      });
      toast.success(t("common.updated"), t("common.newHearingRow"));
      onClose();
    } catch (err: unknown) {
      toast.error(t("common.error"), err instanceof Error ? err.message : t("common.saveFailed"));
    }
  }

  const isOpen = !!row;

  // Use BottomSheet on mobile feel, Modal for desktop — same content
  const formContent = (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      {/* Case label */}
      {row && (
        <div className="bg-navy-50 rounded-xl px-3 py-2.5">
          <p className="text-xs font-mono text-gold font-semibold">{row.case_ref_no}</p>
          <p className="text-sm text-navy font-medium truncate mt-0.5">
            {row.plaintiff_name} {t("cases.vs")} {row.defendant_name}
          </p>
        </div>
      )}

      <Input
        label={t("hearings.serialNo")}
        placeholder={t("common.serialPlaceholder")}
        {...register("serial_no")}
      />

      <Textarea
        label={`${t("hearings.currentProceeding")} *`}
        rows={3}
        placeholder={t("common.currentProceedingPlaceholder")}
        error={errors.current_proceeding?.message}
        required
        {...register("current_proceeding")}
      />

      <DatePicker
        label={`${t("hearings.nextDate")} *`}
        error={errors.next_date?.message}
        required
        {...register("next_date")}
      />

      <Textarea
        label={t("hearings.nextProceeding")}
        rows={2}
        placeholder={t("common.nextProceedingPlaceholder")}
        {...register("next_proceeding")}
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label={t("hearings.judge")}
          placeholder={t("common.judgeNamePlaceholder")}
          {...register("judge_change")}
        />
        <Input
          label={t("hearings.courtNo")}
          placeholder={t("common.courtNoPlaceholder")}
          {...register("court_change")}
        />
      </div>

      <p className="text-[11px] text-navy-400 bg-gold-50 border border-gold-100 rounded-lg px-3 py-2">
        {t("common.hearingUpdateNote")}
      </p>

      <div className="flex gap-3">
        <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
          {t("common.cancel")}
        </Button>
        <MutatingButton
          type="submit"
          loading={isSubmitting || update.isPending}
          leftIcon={<CalendarPlus className="w-4 h-4" />}
          className="flex-1"
        >
          {t("common.saveUpdate")}
        </MutatingButton>
      </div>
    </form>
  );

  return (
    <>
      {/* Mobile: bottom sheet */}
      <BottomSheet
        open={isOpen}
        onClose={onClose}
        title={t("common.updateHearing")}
        snapPoints="auto"
        className="md:hidden"
      >
        {formContent}
      </BottomSheet>

      {/* Desktop: modal */}
      <Modal
        open={isOpen}
        onClose={onClose}
        title={t("common.updateHearing")}
        size="md"
        className="hidden md:flex"
      >
        {formContent}
      </Modal>
    </>
  );
}
