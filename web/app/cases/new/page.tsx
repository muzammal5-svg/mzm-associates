"use client";

import { Suspense, useState, useCallback, useEffect } from "react";
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
import {
  getPartyConfigForCaseType,
  getFromRoleSuggestions,
  isSecondaryPartyRole,
  getMappedFromRole,
  getCaseTypeDisplayName,
  getCaseTypeDefinition,
} from "@/lib/caseTypeConfig";
import type { Client }         from "@/types/supabase";

// ─── Schema ───────────────────────────────────────────────────────────────────
const schema = z.object({
  client_id:          z.string().min(1, "Please select a client"),
  case_ref_no:        z.string().max(80).optional().or(z.literal("")),
  plaintiff_name:     z.string().min(1, "Primary party name is required").max(200),
  defendant_name:     z.string().min(1, "Opposing party name is required").max(200),
  From:               z.string().min(1, "From / representing is required").max(100),
  case_type_id:       z.string().min(1, "Case type is required"),
  offence:            z.string().max(300).optional().or(z.literal("")),
  court_no:           z.string().max(100).optional().or(z.literal("")),
  // fresh_diary replaces judge_name on the New Case form (stored as cases.judge_name)
  fresh_diary:        z.string().optional().or(z.literal("")),
  current_proceeding: z.string().max(2000).optional().or(z.literal("")),
  // First hearing
  serial_no:          z.string().max(20).optional().or(z.literal("")),
  next_date:          z
    .string()
    .optional()
    .refine(v => !v || v >= todayKarachi(), { message: "Next date cannot be in the past" }),
  next_proceeding:    z.string().max(500).optional().or(z.literal("")),
});

const DEFAULT_COURT_SUGGESTIONS = [
  "Judicial Magistrate East",
  "Judicial Magistrate West",
  "District & Sessions Court Islamabad",
  "Senior Civil Judge Islamabad",
  "Civil Judge / Judicial Magistrate",
  "Islamabad High Court",
  "Lahore High Court",
  "Supreme Court of Pakistan",
  "Family Court",
  "Consumer Court",
  "Banking Court",
  "Anti-Terrorism Court (ATC)",
  "Special Court (Central)",
  "Accountability Court (NAB)",
];

type FormData = z.infer<typeof schema>;

// ─── Page ─────────────────────────────────────────────────────────────────────
function NewCasePage() {
  const { t, i18n } = useTranslation();
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
      From:            "Plaintiff",
      client_id:       prefilledClientId ?? "",
      fresh_diary:     todayKarachi(),
    },
  });

  const caseTypeId   = watch("case_type_id");
  const currentFrom  = watch("From");
  const selectedType = caseTypes.find(ct => ct.id === caseTypeId);
  const needsOffence = selectedType?.requires_offence ?? false;

  // ── Dynamic party labels derived from selected case type ──────────────────
  const selectedDef     = getCaseTypeDefinition(selectedType?.name);
  const partyConfig     = selectedDef?.parties ?? getPartyConfigForCaseType(selectedType?.name);
  const fromSuggestions = getFromRoleSuggestions(selectedType?.name);

  // Track previous case type to intelligently remap From role and sync parties
  const prevCaseTypeIdRef = { current: "" };
  useEffect(() => {
    if (!caseTypeId) return;
    const prevId = prevCaseTypeIdRef.current;
    if (prevId === caseTypeId) return;
    prevCaseTypeIdRef.current = caseTypeId;

    const prevType = caseTypes.find(ct => ct.id === prevId);
    const nextType = caseTypes.find(ct => ct.id === caseTypeId);
    const prevTypeName = prevType?.name ?? "";
    const nextTypeName = nextType?.name ?? "";

    const remapped = getMappedFromRole(currentFrom, prevTypeName, nextTypeName);
    if (remapped !== currentFrom) {
      setValue("From", remapped, { shouldValidate: true });
    }

    // Auto-fill party name if client is selected
    const client = selectedClient ?? prefilledClient;
    if (client?.full_name) {
      if (isSecondaryPartyRole(remapped)) {
        setValue("defendant_name", client.full_name, { shouldValidate: true });
        if (watch("plaintiff_name") === client.full_name) {
          setValue("plaintiff_name", "", { shouldValidate: false });
        }
      } else {
        setValue("plaintiff_name", client.full_name, { shouldValidate: true });
        if (watch("defendant_name") === client.full_name) {
          setValue("defendant_name", "", { shouldValidate: false });
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseTypeId]);

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
      const customColsText = customCols.map(c => c.trim()).filter(Boolean);
      const combinedProceeding = [
        data.current_proceeding?.trim(),
        customColsText.length > 0 ? customColsText.join("\n") : "",
      ].filter(Boolean).join("\n\n");

      const hasFirstHearing = Boolean(
        data.serial_no?.trim() ||
        data.next_date?.trim() ||
        data.next_proceeding?.trim()
      );

      const newCase = await createCase.mutateAsync({
        firm_id:        profile.firm_id,
        client_id:      data.client_id,
        case_ref_no:    refNo,
        plaintiff_name: data.plaintiff_name.trim(),
        defendant_name: data.defendant_name.trim(),
        From:           data.From,
        // fresh_diary maps to judge_name column (diary date stored as text)
        judge_name:     data.fresh_diary   || undefined,
        court_no:       data.court_no      || undefined,
        case_type_id:   data.case_type_id,
        offence:        needsOffence ? (data.offence || undefined) : undefined,
        // current_proceeding for the New Case maps to description column
        description:    combinedProceeding || undefined,
        assigned_to:    profile.id,
        created_by:     profile.id,
        first_hearing:  hasFirstHearing ? {
          hearing_date:    data.fresh_diary || todayKarachi(),
          serial_no:       data.serial_no?.trim()       || undefined,
          next_date:       data.next_date        || undefined,
          next_proceeding: data.next_proceeding?.trim()  || undefined,
        } : undefined,
      });
      toast.success(t("cases.new"), refNo ? `${refNo} created.` : "Case created.");
      router.push(`/cases/view?id=${newCase.id}`);
    } catch (err: unknown) {
      toast.error(t("common.error"), err instanceof Error ? err.message : "Failed to save.");
    }
  }

  const caseTypeOptions = caseTypes.map(ct => ({
    value: ct.id,
    label: getCaseTypeDisplayName(ct.name, i18n.language),
  }));
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
                  onChange={c => {
                    setSelectedClient(c);
                    field.onChange(c?.id ?? "");
                    if (c?.full_name) {
                      const fromRole = watch("From") || "Plaintiff";
                      if (isSecondaryPartyRole(fromRole)) {
                        setValue("defendant_name", c.full_name, { shouldValidate: true });
                      } else {
                        setValue("plaintiff_name", c.full_name, { shouldValidate: true });
                      }
                    }
                  }}
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

            {/* Custom columns rendered above the "+ Add column" button */}
            {customCols.map((v, i) => (
              <div key={i} className="p-3 rounded-xl bg-navy-50 border border-navy-100">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-navy-700 uppercase tracking-wider">
                    Write Down the Column {customCols.length > 1 ? `#${i + 1}` : ""}
                  </label>
                  <button
                    type="button"
                    onClick={() => setCustomCols((c) => c.filter((_, idx) => idx !== i))}
                    className="text-xs text-danger hover:underline font-medium"
                  >
                    {t("common.remove") || "Remove"}
                  </button>
                </div>
                <Input
                  value={v}
                  onChange={(e) => setCustomCols((c) => c.map((x, idx) => (idx === i ? e.target.value : x)))}
                />
              </div>
            ))}

            <div>
              <button
                type="button"
                onClick={() => setCustomCols((c) => [...c, ""])}
                className="px-3 py-1.5 rounded-lg bg-gold/10 border border-gold text-gold text-xs font-medium hover:bg-gold/20"
              >
                + Add column
              </button>
            </div>

            {/* Offence — only for criminal types */}
            {needsOffence && (
              <Input
                label={t("cases.offence")}
                placeholder="e.g. Section 302 PPC"
                error={errors.offence?.message}
                {...register("offence")}
              />
            )}

            {/* Dynamic "From" field — suggestions sync with selected case type */}
            <div className="space-y-1.5">
              <Input
                label={t("cases.From")}
                required
                placeholder={t("cases.fromPlaceholder") || "e.g. Plaintiff, Defendant, Petitioner, Respondent, Appellant..."}
                error={errors.From?.message}
                list="from-quick-suggestions"
                {...register("From")}
              />
              <datalist id="from-quick-suggestions">
                {fromSuggestions.map(s => <option key={s} value={s} />)}
              </datalist>
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] text-muted">{t("common.suggestions", "Suggestions:")}</span>
                {fromSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => {
                      setValue("From", suggestion, { shouldValidate: true });

                      // If client is selected, auto-fill appropriate party field
                      const client = selectedClient ?? prefilledClient;
                      if (client?.full_name) {
                        if (isSecondaryPartyRole(suggestion)) {
                          setValue("defendant_name", client.full_name, { shouldValidate: true });
                          if (watch("plaintiff_name") === client.full_name) {
                            setValue("plaintiff_name", "", { shouldValidate: false });
                          }
                        } else {
                          setValue("plaintiff_name", client.full_name, { shouldValidate: true });
                          if (watch("defendant_name") === client.full_name) {
                            setValue("defendant_name", "", { shouldValidate: false });
                          }
                        }
                      }
                    }}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition-all ${
                      currentFrom === suggestion
                        ? "bg-navy text-white border-navy shadow-xs"
                        : "bg-slate-50 text-navy-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic party fields — labels update dynamically with case type */}
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label={`${partyConfig.primaryEn} (${partyConfig.primaryUr})`}
                required
                placeholder={partyConfig.primaryPlaceholder ?? `${partyConfig.primaryEn} Name`}
                error={errors.plaintiff_name?.message}
                {...register("plaintiff_name")}
              />
              <Input
                label={`${partyConfig.secondaryEn} (${partyConfig.secondaryUr})`}
                required
                placeholder={partyConfig.secondaryPlaceholder ?? `${partyConfig.secondaryEn} Name`}
                error={errors.defendant_name?.message}
                {...register("defendant_name")}
              />
            </div>

            {/* Court and Fresh Diary in 2-column grid */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Input
                  label={t("cases.court")}
                  placeholder={t("common.allCourts")}
                  list="court-options"
                  {...register("court_no")}
                />
                <datalist id="court-options">
                  {Array.from(new Set([
                    ...courtOptions.map((c) => c.value),
                    ...DEFAULT_COURT_SUGGESTIONS,
                  ])).map((name) => (
                    <option key={name} value={name} />
                  ))}
                </datalist>
              </div>

              <DatePicker
                label={t("cases.freshDiary")}
                placeholder="Fresh Diary"
                error={errors.fresh_diary?.message}
                {...register("fresh_diary")}
              />
            </div>

            {/* Current Proceeding — replaces Description */}
            <Textarea
              label={t("cases.currentProceedingCase")}
              rows={3}
              placeholder={t("cases.currentProceedingPlaceholder") || "Current proceeding / today's order or notice..."}
              error={errors.current_proceeding?.message}
              {...register("current_proceeding")}
            />
          </div>
        </Card>

        {/* ── First Hearing Entry (optional) ── */}
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
