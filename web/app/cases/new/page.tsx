"use client";

import { Suspense, useState, useCallback } from "react";
import { useSearchParams, useRouter }   from "next/navigation";
import { useTranslation }               from "react-i18next";
import { useForm, Controller }          from "react-hook-form";
import { zodResolver }                  from "@hookform/resolvers/zod";
import { z }                            from "zod";
import { AlertTriangle }                from "lucide-react";

import { AppShell }            from "@/components/layout/AppShell";
import { RouteGuard }          from "@/components/shared/RouteGuard";
import { MutatingButton }      from "@/components/shared/MutatingButton";
import { Card }                from "@/components/ui/Card";
import { Input }               from "@/components/ui/Input";
import { Select }              from "@/components/ui/Select";
import { DatePicker }          from "@/components/ui/DatePicker";
import { Textarea }            from "@/components/ui/Textarea";
import { Button }              from "@/components/ui/Button";
import { QueryErrorState }  from "@/components/ui/QueryErrorState";
import { ClientSearchSelect }  from "@/components/cases/ClientSearchSelect";
import { useAuth }             from "@/providers/AuthProvider";
import { useToast }            from "@/components/ui/Toast";
import { useCaseTypes }        from "@/hooks/useCaseTypes";
import { useCourts }           from "@/hooks/useCourts";
import { useClient }           from "@/hooks/useClients";
import { useCreateCase, checkDuplicateRefNo } from "@/hooks/useCases";
import { todayKarachi }        from "@/lib/utils";
import type { Client }         from "@/types/supabase";

// ─── Schema ───────────────────────────────────────────────────────────────────
const schema = z.object({
  client_id:       z.string().min(1, "Please select a client"),
  case_ref_no:     z.string().max(80).optional().or(z.literal("")),
  plaintiff_name:  z.string().min(1, "Plaintiff name is required").max(200),
  defendant_name:  z.string().min(1, "Defendant name is required").max(200),
  From:    z.enum(["plaintiff", "defendant"]),
  case_type_id:    z.string().min(1, "Case type is required"),
  offence:         z.string().max(300).optional().or(z.literal("")),
  court_no:        z.string().max(100).optional().or(z.literal("")),
  judge_name:      z.string().max(200).optional().or(z.literal("")),
  description:     z.string().max(2000).optional().or(z.literal("")),
  // First hearing
  serial_no:       z.string().max(20).optional().or(z.literal("")),
  next_date:       z
    .string()
    .optional()
    .refine(v => !v || v >= todayKarachi(), { message: "Next date cannot be in the past" }),
  next_proceeding: z.string().max(500).optional().or(z.literal("")),
});

type FormData = z.infer<typeof schema>;

// ─── Page ─────────────────────────────────────────────────────────────────────
function NewCasePage() {
  const { t }       = useTranslation();
  const router      = useRouter();
  const params      = useSearchParams();
  const toast       = useToast();
  const { profile } = useAuth();

  const prefilledClientId = params.get("clientId");
  const { data: prefilledClient, isError: clientError, refetch: refetchClient } = useClient(prefilledClientId);

  const { data: caseTypes = [], isError: caseTypesError, refetch: refetchCaseTypes }  = useCaseTypes();
  const { data: courts    = [], isError: courtsError, refetch: refetchCourts } = useCourts();
  const createCase                = useCreateCase();

  const [selectedClient, setSelectedClient] = useState<Client | null>(
    prefilledClient ?? null
  );
  const [dupWarning, setDupWarning] = useState<string | null>(null);
  const [customCols, setCustomCols] = useState<string[]>([]);

  const {
    register, handleSubmit, watch, control, setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      From:    "plaintiff",
      client_id:       prefilledClientId ?? "",
    },
  });

  const caseTypeId    = watch("case_type_id");
  const selectedType  = caseTypes.find(ct => ct.id === caseTypeId);
  const needsOffence  = selectedType?.requires_offence ?? false;

  const checkRefNo = useCallback(async (refNo: string) => {
    if (!refNo.trim()) {
      setDupWarning(null);
      return;
    }
    try {
      const dup = await checkDuplicateRefNo(refNo);
      setDupWarning(
        dup ? `Case "${dup.case_ref_no}" already exists: ${dup.plaintiff_name} vs ${dup.defendant_name}` : null
      );
    } catch (error) {
      toast.error(t("common.error"), error instanceof Error ? error.message : "Could not check the case reference.");
    }
  }, [toast, t]);

  async function onSubmit(data: FormData) {
    if (!profile) return;
    try {
      const refNo = (data.case_ref_no ?? "").trim();
      const newCase = await createCase.mutateAsync({
        firm_id:        profile.firm_id,
        client_id:      data.client_id,
        case_ref_no:    refNo,
        plaintiff_name: data.plaintiff_name.trim(),
        defendant_name: data.defendant_name.trim(),
        From:   data.From,
        judge_name:     data.judge_name   || undefined,
        court_no:       data.court_no     || undefined,
        case_type_id:   data.case_type_id,
        offence:        needsOffence ? (data.offence || undefined) : undefined,
        description:    data.description  || undefined,
        assigned_to:    profile.id,
        created_by:     profile.id,
        first_hearing: {
          serial_no:       data.serial_no       || undefined,
          next_date:       data.next_date        || undefined,
          next_proceeding: data.next_proceeding  || undefined,
        },
      });
      toast.success(t("cases.new"), refNo ? `${refNo} created.` : "Case created.");
      router.push(`/cases/view?id=${newCase.id}`);
    } catch (err: unknown) {
      toast.error(t("common.error"), err instanceof Error ? err.message : "Failed to save.");
    }
  }

  const caseTypeOptions = caseTypes.map(ct => ({ value: ct.id, label: ct.name }));
  const courtOptions    = courts.map(c  => ({ value: c.name, label: c.name }));

  return (
    <AppShell pageTitle={t("cases.new")} showBack>
      {clientError && <QueryErrorState onRetry={() => void refetchClient()} />}
      {caseTypesError && <QueryErrorState onRetry={() => void refetchCaseTypes()} />}
      {courtsError && <QueryErrorState onRetry={() => void refetchCourts()} />}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="max-w-2xl mx-auto space-y-5">

        {/* ── Client ── */}
        <Card>
          <h2 className="text-sm font-semibold text-navy-400 uppercase tracking-wider mb-3">{t("clients.title")}</h2>
          <div className="space-y-1.5">
            <label className="label">{t("clients.title")} <span className="text-danger ms-0.5">*</span></label>
            <Controller
              name="client_id"
              control={control}
              render={({ field }) => (
                <ClientSearchSelect
                  value={selectedClient ?? prefilledClient ?? null}
                  onChange={c => { setSelectedClient(c); field.onChange(c?.id ?? ""); }}
                  error={errors.client_id?.message}
                />
              )}
            />
          </div>
        </Card>

        {/* ── Case Details ── */}
        <Card>
          <h2 className="text-sm font-semibold text-navy-400 uppercase tracking-wider mb-3">{t("cases.caseDetails")}</h2>
          <div className="space-y-4">

            <Input
              label={t("cases.caseNo")}
              error={errors.case_ref_no?.message}
              placeholder="WP-1234/2024"
              {...register("case_ref_no", {
                onBlur: e => checkRefNo(e.target.value),
              })}
            />

            {dupWarning && (
              <div className="flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                <p className="text-xs text-yellow-800">{dupWarning}</p>
              </div>
            )}

            <Select
              label={t("cases.caseType")} required
              options={caseTypeOptions}
              placeholder={t("common.allTypes")}
              error={errors.case_type_id?.message}
              {...register("case_type_id")}
            />
            <button
              type="button"
              onClick={() => setCustomCols((c) => [...c, ""])}
              className="px-3 py-1.5 rounded-lg bg-gold/10 border border-gold text-gold text-xs font-medium hover:bg-gold/20"
            >
              + Add column
            </button>
            {customCols.map((v, i) => (
              <div key={i} className="p-3 rounded-xl bg-navy-50 border border-navy-100">
                <Input
                  label="Write Down the Colum"
                  value={v}
                  onChange={(e) => setCustomCols((c) => c.map((x, idx) => (idx === i ? e.target.value : x)))}
                />
              </div>
            ))}

            {/* Offence — only for criminal types */}
            {needsOffence && (
              <Input
                label={t("cases.offence")}
                placeholder="e.g. Section 302 PPC"
                error={errors.offence?.message}
                {...register("offence")}
              />
            )}

            {/* From toggle */}
            <div className="space-y-1.5">
              <label className="label">{t("cases.From")} <span className="text-danger ms-0.5">*</span></label>
              <div className="flex rounded-xl overflow-hidden border border-border">
                {(["plaintiff", "defendant"] as const).map(r => {
                  const active = watch("From") === r;
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setValue("From", r, { shouldValidate: true })}
                      className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                        active ? "bg-navy text-white shadow-xs" : "bg-white text-navy-600 hover:bg-navy-50"
                      }`}
                    >
                      {r === "plaintiff" ? t("cases.plaintiff") : t("cases.defendant")}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label={t("cases.plaintiff")} required
                placeholder="Muhammad Aslam Khan"
                error={errors.plaintiff_name?.message}
                {...register("plaintiff_name")}
              />
              <Input
                label={t("cases.defendant")} required
                placeholder="Province of Punjab"
                error={errors.defendant_name?.message}
                {...register("defendant_name")}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label={t("cases.court")}
                placeholder={t("common.allCourts")}
                list="court-options"
                {...register("court_no")}
              />
              <datalist id="court-options">
                {courtOptions.map((c) => (
                  <option key={c.value} value={c.value} />
                ))}
              </datalist>
              <Input
                label={t("cases.judge")}
                placeholder="Hon. Justice Syed Ali Shah"
                {...register("judge_name")}
              />
            </div>

            <Textarea
              label={t("cases.description")}
              rows={3}
              placeholder="Brief description of the case…"
              {...register("description")}
            />
          </div>
        </Card>

        {/* ── First Hearing ── */}
        <Card>
          <h2 className="text-xs font-semibold text-navy-500 uppercase tracking-wider mb-3">
            {t("cases.firstHearing")} <span className="text-navy-400 font-normal">({t("common.optional")})</span>
          </h2>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label={t("hearings.serialNo")}
                placeholder="14"
                {...register("serial_no")}
              />
              <DatePicker
                label={t("hearings.nextDate")}
                error={errors.next_date?.message}
                {...register("next_date")}
              />
            </div>
            <Textarea
              label={t("hearings.nextProceeding")}
              rows={2}
              placeholder={t("common.nextProceedingPlaceholder")}
              {...register("next_proceeding")}
            />
            <p className="text-xs text-navy-400">
              {t("common.reminderAutoNote")}
            </p>
          </div>
        </Card>

        {/* ── Actions ── */}
        <div className="flex gap-3">
          <Button type="button" variant="secondary" onClick={() => router.back()} className="flex-1">
            {t("common.cancel")}
          </Button>
          <MutatingButton type="submit" loading={isSubmitting} className="flex-1">
            {t("common.save")}
          </MutatingButton>
        </div>

      </form>
    </AppShell>
  );
}

export default function NewCaseRoute() {
  return (
    <RouteGuard allowedRoles={["admin", "lawyer", "super_admin"]}>
      <Suspense><NewCasePage /></Suspense>
    </RouteGuard>
  );
}
