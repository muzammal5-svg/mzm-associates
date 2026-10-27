"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslation } from "react-i18next";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { type CaseLaw } from "@/types/supabase";
import { useCreateCaseLaw, useUpdateCaseLaw, LAW_REPORT_OPTIONS } from "@/hooks/useCaseLaws";

const CaseLawSchema = z.object({
  law_report: z.string().min(1, "Law report is required.").max(50),
  year:       z.coerce.number().min(1900, "Invalid year.").max(2100, "Invalid year."),
  page_no:    z.coerce.number().min(1, "Invalid page number.").max(99999, "Invalid page number."),
  case_title: z.string().min(2, "Case title must be at least 2 characters.").max(200),
});

type CaseLawFormData = z.infer<typeof CaseLawSchema>;

interface CaseLawFormProps {
  open:         boolean;
  onClose:      () => void;
  onSuccess:    () => void;
  caseLaw?:     CaseLaw | null;
}

export function CaseLawForm({ open, onClose, onSuccess, caseLaw }: CaseLawFormProps) {
  const { t } = useTranslation();
  const isEdit = caseLaw !== null;

  const createCaseLaw = useCreateCaseLaw();
  const updateCaseLaw = useUpdateCaseLaw(caseLaw?.id ?? "");

  const form = useForm<CaseLawFormData>({
    resolver: zodResolver(CaseLawSchema),
    defaultValues: {
      law_report: caseLaw?.law_report ?? "MLD",
      year:       caseLaw?.year ?? new Date().getFullYear(),
      page_no:    caseLaw?.page_no ?? 1,
      case_title: caseLaw?.case_title ?? "",
    },
  });

  const onSubmit = async (data: CaseLawFormData) => {
    if (isEdit && caseLaw?.id) {
      await updateCaseLaw.mutateAsync({
        law_report:  data.law_report,
        year:        data.year,
        page_no:     data.page_no,
        case_title:  data.case_title,
      });
    } else {
      await createCaseLaw.mutateAsync({
        law_report:  data.law_report,
        year:        data.year,
        page_no:     data.page_no,
        case_title:  data.case_title,
      });
    }
    onClose();
    onSuccess();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? t("caseLaws.editCaseLaw") : t("caseLaws.addCaseLaw")}
      size="md"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="submit"
            form="case-law-form"
            disabled={createCaseLaw.isPending || updateCaseLaw.isPending}
          >
            {createCaseLaw.isPending || updateCaseLaw.isPending
              ? t("common.saving")
              : isEdit ? t("common.saveChanges") : t("common.add")}
          </Button>
        </>
      }
    >
      <form id="case-law-form" onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="law-report" className="label">
              {t("caseLaws.lawReport")}
              <span className="text-danger ms-0.5" aria-hidden="true">*</span>
            </label>
            <input
              id="law-report"
              list="law-report-options"
              {...form.register("law_report")}
              required
              defaultValue={form.getValues("law_report")}
              className="input min-h-[48px]"
            />
            <datalist id="law-report-options">
              {LAW_REPORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} />
              ))}
            </datalist>
            {form.formState.errors.law_report && (
              <p role="alert" className="text-danger text-xs font-medium">
                {form.formState.errors.law_report.message}
              </p>
            )}
          </div>
          <Input
            type="number"
            label={t("caseLaws.year")}
            required
            error={form.formState.errors.year?.message}
            {...form.register("year")}
          />
          <Input
            type="number"
            label={t("caseLaws.pageNo")}
            required
            error={form.formState.errors.page_no?.message}
            {...form.register("page_no")}
          />
          <Input
            label={t("caseLaws.caseTitle")}
            required
            error={form.formState.errors.case_title?.message}
            {...form.register("case_title")}
            className="col-span-2"
          />
        </div>
      </form>
    </Modal>
  );
}
