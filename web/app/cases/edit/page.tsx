"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslation }             from "react-i18next";
import { useForm, Controller }        from "react-hook-form";
import { zodResolver }                from "@hookform/resolvers/zod";
import { z }                          from "zod";

import { AppShell }           from "@/components/layout/AppShell";
import { RouteGuard }         from "@/components/shared/RouteGuard";
import { Card }               from "@/components/ui/Card";
import { Input }              from "@/components/ui/Input";
import { Select }             from "@/components/ui/Select";
import { Textarea }           from "@/components/ui/Textarea";
import { Button }             from "@/components/ui/Button";
import { QueryErrorState }  from "@/components/ui/QueryErrorState";
import { PageLoader }         from "@/components/ui/LoadingSpinner";
import { useToast }           from "@/components/ui/Toast";
import { useCaseTypes }       from "@/hooks/useCaseTypes";
import { useCourts }          from "@/hooks/useCourts";
import { useCase, useUpdateCase } from "@/hooks/useCases";

const schema = z.object({
  case_ref_no:     z.string().min(1),
  plaintiff_name:  z.string().min(1),
  defendant_name:  z.string().min(1),
  representing:    z.enum(["plaintiff", "defendant"]),
  case_type_id:    z.string().min(1),
  offence:         z.string().optional().or(z.literal("")),
  court_no:        z.string().optional().or(z.literal("")),
  judge_name:      z.string().optional().or(z.literal("")),
  description:     z.string().optional().or(z.literal("")),
});
type FormData = z.infer<typeof schema>;

function EditCasePage() {
  const { t }    = useTranslation();
  const router   = useRouter();
  const params   = useSearchParams();
  const toast    = useToast();
  const id       = params.get("id") ?? "";

  const { data: c, isLoading, isError: caseError, refetch: refetchCase } = useCase(id || null);
  const { data: caseTypes = [], isError: caseTypesError, refetch: refetchCaseTypes } = useCaseTypes();
  const { data: courts    = [], isError: courtsError, refetch: refetchCourts } = useCourts();
  const updateCase = useUpdateCase(id);

  const {
    register, handleSubmit, watch, setValue, reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { representing: "plaintiff" },
  });

  useEffect(() => {
    if (!c) return;
    reset({
      case_ref_no:    c.case_ref_no,
      plaintiff_name: c.plaintiff_name,
      defendant_name: c.defendant_name,
      representing:   c.representing,
      case_type_id:   c.case_type_id,
      offence:        c.offence ?? "",
      court_no:       c.court_no ?? "",
      judge_name:     c.judge_name ?? "",
      description:    c.description ?? "",
    });
  }, [c, reset]);

  const caseTypeId    = watch("case_type_id");
  const selectedType  = caseTypes.find(ct => ct.id === caseTypeId);
  const needsOffence  = selectedType?.requires_offence ?? false;

  async function onSubmit(data: FormData) {
    try {
      await updateCase.mutateAsync({
        case_ref_no:    data.case_ref_no.trim(),
        plaintiff_name: data.plaintiff_name.trim(),
        defendant_name: data.defendant_name.trim(),
        representing:   data.representing,
        case_type_id:   data.case_type_id,
        offence:        needsOffence ? (data.offence || null) : null,
        court_no:       data.court_no || null,
        judge_name:     data.judge_name || null,
        description:    data.description || null,
      });
      toast.success(t("common.caseUpdated"));
      router.push(`/cases/view?id=${id}`);
    } catch (err: unknown) {
      toast.error(t("common.error"), err instanceof Error ? err.message : t("common.saveFailed"));
    }
  }

  if (isLoading) return <AppShell showBack><PageLoader /></AppShell>;
  if (caseError) return <AppShell showBack><QueryErrorState onRetry={() => void refetchCase()} /></AppShell>;
  if (!c) return <AppShell showBack><p className="text-danger text-sm">{t("common.caseNotFound")}</p></AppShell>;

  const caseTypeOptions = caseTypes.map(ct => ({ value: ct.id, label: ct.name }));
  const courtOptions    = courts.map(ct => ({ value: ct.name, label: ct.name }));

  return (
    <AppShell pageTitle={t("cases.edit")} showBack>
      {caseTypesError && <QueryErrorState onRetry={() => void refetchCaseTypes()} />}
      {courtsError && <QueryErrorState onRetry={() => void refetchCourts()} />}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="max-w-2xl mx-auto space-y-5">
        <Card>
          <div className="space-y-4">
            <Input label={t("cases.caseNo")} required error={errors.case_ref_no?.message}
              {...register("case_ref_no")} />

            <Select label={t("cases.caseType")} required options={caseTypeOptions}
              error={errors.case_type_id?.message} {...register("case_type_id")} />

            {needsOffence && (
              <Input label={t("cases.offence")} placeholder="e.g. Section 302 PPC"
                {...register("offence")} />
            )}

            <div className="space-y-1.5">
              <label className="label">{t("cases.representing")}</label>
              <div className="flex rounded-xl overflow-hidden border border-navy-100">
                {(["plaintiff", "defendant"] as const).map(r => {
                  const active = watch("representing") === r;
                  return (
                    <button key={r} type="button"
                      onClick={() => setValue("representing", r)}
                      className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                        active ? "bg-navy text-white" : "bg-white text-navy-400 hover:bg-navy-50"
                      }`}
                    >
                      {r === "plaintiff" ? t("cases.plaintiff") : t("cases.defendant")}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Input label={t("cases.plaintiff")} required error={errors.plaintiff_name?.message}
                {...register("plaintiff_name")} />
              <Input label={t("cases.defendant")} required error={errors.defendant_name?.message}
                {...register("defendant_name")} />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Select label={t("cases.court")} options={courtOptions}
                placeholder={t("common.allCourts")} {...register("court_no")} />
              <Input label={t("cases.judge")} {...register("judge_name")} />
            </div>

            <Textarea label={t("cases.description")} rows={3} {...register("description")} />
          </div>
        </Card>

        <div className="flex gap-3">
          <Button type="button" variant="secondary" onClick={() => router.back()} className="flex-1">
            {t("common.cancel")}
          </Button>
          <Button type="submit" loading={isSubmitting} className="flex-1">
            {t("common.save")}
          </Button>
        </div>
      </form>
    </AppShell>
  );
}

export default function EditCaseRoute() {
  return (
    <RouteGuard allowedRoles={["admin", "lawyer", "super_admin"]}>
      <Suspense><EditCasePage /></Suspense>
    </RouteGuard>
  );
}
