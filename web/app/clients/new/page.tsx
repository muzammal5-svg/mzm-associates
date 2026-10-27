"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter }        from "next/navigation";
import { useTranslation }   from "react-i18next";
import { useForm }          from "react-hook-form";
import { zodResolver }      from "@hookform/resolvers/zod";
import { AlertTriangle }    from "lucide-react";

import { AppShell }         from "@/components/layout/AppShell";
import { RouteGuard }       from "@/components/shared/RouteGuard";
import { Card }             from "@/components/ui/Card";
import { Input }            from "@/components/ui/Input";
import { Select }           from "@/components/ui/Select";
import { Textarea }         from "@/components/ui/Textarea";
import { Button }           from "@/components/ui/Button";
import { MutatingButton } from "@/components/shared/MutatingButton";
import { QueryErrorState }  from "@/components/ui/QueryErrorState";
import { StepIndicator }    from "@/components/clients/StepIndicator";
import { DocumentUploader } from "@/components/documents/DocumentUploader";
import type { PendingFile } from "@/components/documents/DocumentUploader";
import { db, insert }     from "@/lib/supabase/client";
import { useAuth }          from "@/providers/AuthProvider";
import { useToast }         from "@/components/ui/Toast";
import { useQueryClient }   from "@tanstack/react-query";
import { PK_CITY_OPTIONS }  from "@/lib/cities";
import { formatCnic, normalisePhone } from "@/lib/phone";
import { checkDuplicates }  from "@/hooks/useClients";
import {
  clientStep1Schema, ClientStep1Data, CLIENT_DRAFT_KEY,
} from "@/components/clients/clientSchema";
import { supabase }         from "@/lib/supabase/client";

const STEPS = [
  { label: "Personal Info" },
  { label: "Documents",    optional: true },
];

function AddClientPage() {
  const { t }       = useTranslation();
  const { profile } = useAuth();
  const router      = useRouter();
  const toast       = useToast();
  const qc          = useQueryClient();

  const [step,          setStep]          = useState(0);
  const [saving,        setSaving]        = useState(false);
  const [createdId,     setCreatedId]     = useState<string | null>(null);
  const [pendingFiles,  setPendingFiles]  = useState<PendingFile[]>([]);
  const [dupWarning,    setDupWarning]    = useState<string | null>(null);
  const [dupCheckError, setDupCheckError] = useState<string | null>(null);

  // ── Form ──────────────────────────────────────────────────────────────────
  const {
    register, handleSubmit, watch, setValue, getValues,
    formState: { errors },
  } = useForm<ClientStep1Data>({
    resolver: zodResolver(clientStep1Schema),
    defaultValues: (() => {
      try {
        const saved = localStorage.getItem(CLIENT_DRAFT_KEY);
        return saved ? JSON.parse(saved) : { whatsapp_same: true };
      } catch { return { whatsapp_same: true }; }
    })(),
  });

  const whatsappSame = watch("whatsapp_same");
  const phoneVal     = watch("phone");
  const cnicVal      = watch("cnic") ?? "";

  // Auto-fill WhatsApp from phone
  useEffect(() => {
    if (whatsappSame) setValue("whatsapp", phoneVal);
  }, [whatsappSame, phoneVal, setValue]);

  // Save draft to localStorage on field change
  const saveDraft = useCallback(() => {
    try {
      localStorage.setItem(CLIENT_DRAFT_KEY, JSON.stringify(getValues()));
    } catch { /* ignore */ }
  }, [getValues]);

  // ── Duplicate check ───────────────────────────────────────────────────────
  const runDupCheck = useCallback(async () => {
    const vals = getValues();
    if (!vals.cnic && !vals.phone) return;
    try {
      const { cnicMatch, phoneMatch } = await checkDuplicates(
        vals.cnic ?? "", vals.phone
      );
      if (cnicMatch) {
        setDupWarning(`A client with this CNIC already exists: ${cnicMatch.full_name}`);
      } else if (phoneMatch) {
        setDupWarning(`A client with this phone already exists: ${phoneMatch.full_name}`);
      } else {
        setDupWarning(null);
      }
    } catch (error) {
      toast.error(t("common.error"), error instanceof Error ? error.message : "Could not check for duplicates.");
    }
  }, [getValues, toast, t]);

  // ── Step 1 submit → create client ────────────────────────────────────────
  async function onStep1Submit(data: ClientStep1Data) {
    if (!profile) return;
    setSaving(true);
    try {
      const phone    = normalisePhone(data.phone);
      const whatsapp = data.whatsapp_same ? phone : (data.whatsapp ? normalisePhone(data.whatsapp) : null);

      const { data: row, error } = await insert.client({
        firm_id:             profile.firm_id,
        full_name:           data.full_name.trim(),
        father_husband_name: data.father_husband_name && data.father_husband_name.trim() ? data.father_husband_name.trim() : null,
        cnic:                data.cnic && data.cnic.trim() ? data.cnic.trim() : null,
        phone,
        whatsapp,
        email:               data.email && data.email.trim() ? data.email.trim() : null,
        address:             data.address && data.address.trim() ? data.address.trim() : null,
        city:                data.city && data.city.trim() ? data.city.trim() : null,
        created_by:          profile.id,
        is_active:           true,
      });

      if (error) {
        console.error("[client-creation] Insert error:", error);
        throw new Error(error.message || "Failed to create client");
      }

      if (!row) throw new Error("No client returned from database");

      setCreatedId((row as { id: string }).id);
      localStorage.removeItem(CLIENT_DRAFT_KEY);
      qc.invalidateQueries({ queryKey: ["clients"] });
      qc.invalidateQueries({ queryKey: ["dashboard-counts"] });
      toast.success(t("clients.new"), `${data.full_name} added successfully.`);

      // If no pending docs, go to profile; else go to step 2
      if (pendingFiles.length === 0) {
        router.push(`/clients/view?id=${(row as { id: string }).id}`);
      } else {
        setStep(1);
      }
    } catch (err: unknown) {
      console.error("[client-creation] Error:", err);
      const errorMsg = err instanceof Error ? err.message : "Failed to save client";
      toast.error(t("common.error"), errorMsg);
      setDupCheckError(null);
    } finally {
      setSaving(false);
    }
  }

  // ── Step 2: upload pending files (client now exists) ─────────────────────
  async function uploadPendingFiles() {
    if (!createdId || !profile) return;
    setSaving(true);
    try {
      for (const pf of pendingFiles) {
        const ext  = pf.file.name.split(".").pop() ?? "bin";
        const path = `${profile.firm_id}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
        await supabase.storage.from("documents").upload(path, pf.file, { upsert: false });
        await insert.document({
          firm_id:     profile.firm_id,
          client_id:   createdId,
          case_id:     null,
          name:        pf.name || pf.file.name,
          file_path:   path,
          mime:        pf.file.type,
          size:        pf.file.size,
          uploaded_by: profile.id,
        });
      }
      toast.success(t("documents.uploaded"));
    } catch { toast.error(t("common.error"), t("documents.uploadFailed")); }
    finally   { setSaving(false); }
    router.push(`/clients/view?id=${createdId}`);
  }

  return (
    <AppShell pageTitle={t("clients.new")} showBack>
      <div className="w-full max-w-xl mx-auto px-3 sm:px-4 md:px-0 space-y-4 sm:space-y-6">

        {/* Step indicator */}
        <StepIndicator steps={STEPS} current={step} />

        {/* ── STEP 1: Personal info ── */}
        {step === 0 && (
          <Card>
            <form
              onSubmit={handleSubmit(onStep1Submit)}
              onChange={saveDraft}
              className="space-y-4"
              noValidate
            >
              {/* Full name */}
              <Input
                label={t("clients.name")}
                required
                error={errors.full_name?.message}
                placeholder={t("clients.namePlaceholder")}
                {...register("full_name")}
              />

              {/* Father/husband name */}
              <Input
                label={t("clients.fatherHusbandName")}
                error={errors.father_husband_name?.message}
                {...register("father_husband_name")}
              />

              {/* CNIC with mask */}
              <div className="space-y-1.5">
                <label className="label">
                  {t("clients.cnic")}
                  <span className="text-navy-300 text-xs ms-1">({t("common.optional")})</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="35201-1234567-1"
                  maxLength={15}
                  className={`input font-mono ${errors.cnic ? "border-danger" : ""}`}
                  value={cnicVal}
                  onChange={e => {
                    setValue("cnic", formatCnic(e.target.value), { shouldValidate: true });
                    saveDraft();
                  }}
                  onBlur={runDupCheck}
                />
                {errors.cnic && (
                  <p className="text-danger text-xs">{errors.cnic.message}</p>
                )}
              </div>

              {/* Phone */}
              <Input
                label={t("clients.phone")}
                required
                type="tel"
                placeholder="+92 300 1234567"
                error={errors.phone?.message}
                {...register("phone", { onBlur: runDupCheck })}
              />

              {/* WhatsApp same as phone */}
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-navy-200 accent-gold"
                  {...register("whatsapp_same")}
                />
                <span className="text-sm text-navy">{t("clients.whatsapp")} {t("clients.sameAsPhone")}</span>
              </label>

              {!whatsappSame && (
                <Input
                  label={t("clients.whatsapp")}
                  type="tel"
                  placeholder="+92 300 1234567"
                  error={errors.whatsapp?.message}
                  {...register("whatsapp")}
                />
              )}

              {/* Duplicate warning */}
              {dupCheckError && <QueryErrorState onRetry={() => void runDupCheck()} message={dupCheckError} className="py-4" />}
              {dupWarning && (
                <div className="flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                  <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-yellow-800">{dupWarning}</p>
                </div>
              )}

              {/* Email */}
              <Input
                label={t("clients.email")}
                type="email"
                placeholder="client@email.com"
                error={errors.email?.message}
                {...register("email")}
              />

              {/* City */}
              <Select
                label={t("clients.city")}
                options={PK_CITY_OPTIONS}
                placeholder={t("clients.selectCity")}
                {...register("city")}
              />

              {/* Address */}
              <Textarea
                label={t("clients.address")}
                rows={2}
                placeholder={t("clients.addressPlaceholder")}
                {...register("address")}
              />

              {/* Actions */}
              <div className="flex gap-2 sm:gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => router.back()}
                  className="flex-1 text-xs sm:text-sm"
                >
                  {t("common.cancel")}
                </Button>
                <MutatingButton
                  type="submit"
                  loading={saving}
                  className="flex-1 text-xs sm:text-sm"
                >
                  {t("clients.saveContinue")}
                </MutatingButton>
              </div>
            </form>
          </Card>
        )}

        {/* ── STEP 2: Documents ── */}
        {step === 1 && createdId && (
          <Card>
            <h2 className="text-sm font-semibold text-navy mb-4">
              {t("documents.uploadTitle")} <span className="text-navy-300 font-normal">({t("common.optional")})</span>
            </h2>
            <DocumentUploader
              clientId={createdId}
              pendingMode={false}
            />
            <div className="flex gap-2 sm:gap-3 mt-6">
              <Button
                variant="secondary"
                onClick={() => router.push(`/clients/view?id=${createdId}`)}
                className="flex-1 text-xs sm:text-sm"
              >
                {t("documents.skip")}
              </Button>
              <Button
                onClick={() => router.push(`/clients/view?id=${createdId}`)}
                className="flex-1 text-xs sm:text-sm"
              >
                {t("documents.done")}
              </Button>
            </div>
          </Card>
        )}

      </div>
    </AppShell>
  );
}

export default function AddClientRoute() {
  return <RouteGuard allowedRoles={["admin", "lawyer", "super_admin"]}><AddClientPage /></RouteGuard>;
}

