"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams }    from "next/navigation";
import { useRouter }          from "next/navigation";
import { useTranslation }     from "react-i18next";
import { useForm }            from "react-hook-form";
import { zodResolver }        from "@hookform/resolvers/zod";
import { AlertTriangle }      from "lucide-react";

import { AppShell }         from "@/components/layout/AppShell";
import { RouteGuard }       from "@/components/shared/RouteGuard";
import { Card }             from "@/components/ui/Card";
import { Input }            from "@/components/ui/Input";
import { Select }           from "@/components/ui/Select";
import { Textarea }         from "@/components/ui/Textarea";
import { Button }           from "@/components/ui/Button";
import { QueryErrorState }  from "@/components/ui/QueryErrorState";
import { PageLoader }       from "@/components/ui/LoadingSpinner";
import { PK_CITY_OPTIONS }  from "@/lib/cities";
import { formatCnic, normalisePhone } from "@/lib/phone";
import { checkDuplicates, useClient, useUpdateClient } from "@/hooks/useClients";
import { useToast }         from "@/components/ui/Toast";
import { clientStep1Schema, type ClientStep1Data } from "@/components/clients/clientSchema";
import { useState, useCallback } from "react";

function EditClientPage() {
  const { t }    = useTranslation();
  const params   = useSearchParams();
  const router   = useRouter();
  const toast    = useToast();
  const id       = params.get("id") ?? "";

  const { data: client, isLoading, isError, refetch } = useClient(id || null);
  const updateClient = useUpdateClient(id);

  const [dupWarning, setDupWarning] = useState<string | null>(null);
  const [dupCheckError, setDupCheckError] = useState<string | null>(null);

  const {
    register, handleSubmit, watch, setValue, getValues, reset,
    formState: { errors, isSubmitting },
  } = useForm<ClientStep1Data>({
    resolver: zodResolver(clientStep1Schema),
    defaultValues: { whatsapp_same: false },
  });

  // Populate form once client loads
  useEffect(() => {
    if (!client) return;
    reset({
      full_name:           client.full_name,
      father_husband_name: client.father_husband_name ?? "",
      cnic:                client.cnic ?? "",
      phone:               client.phone ?? "",
      whatsapp_same:       client.phone === client.whatsapp,
      whatsapp:            client.whatsapp ?? "",
      email:               client.email ?? "",
      address:             client.address ?? "",
      city:                client.city ?? "",
    });
  }, [client, reset]);

  const whatsappSame = watch("whatsapp_same");
  const phoneVal     = watch("phone");
  const cnicVal      = watch("cnic") ?? "";

  useEffect(() => {
    if (whatsappSame) setValue("whatsapp", phoneVal);
  }, [whatsappSame, phoneVal, setValue]);

  const runDupCheck = useCallback(async () => {
    const vals = getValues();
    try {
      const { cnicMatch, phoneMatch } = await checkDuplicates(
        vals.cnic ?? "", vals.phone, id
      );
      setDupWarning(
        cnicMatch  ? `Another client has this CNIC: ${cnicMatch.full_name}` :
        phoneMatch ? `Another client has this phone: ${phoneMatch.full_name}` :
        null
      );
    } catch (error) {
      toast.error(t("common.error"), error instanceof Error ? error.message : "Could not check for duplicates.");
    }
  }, [getValues, id, toast, t]);

  async function onSubmit(data: ClientStep1Data) {
    const phone    = normalisePhone(data.phone);
    const whatsapp = data.whatsapp_same ? phone : (data.whatsapp ? normalisePhone(data.whatsapp) : null);

    try {
      await updateClient.mutateAsync({
        full_name:           data.full_name.trim(),
        father_husband_name: data.father_husband_name || null,
        cnic:                data.cnic || null,
        phone,
        whatsapp:            whatsapp ?? undefined,
        email:               data.email || null,
        address:             data.address || null,
        city:                data.city || null,
      });
      toast.success(t("profile.saved"), `${data.full_name} updated.`);
      router.push(`/clients/view?id=${id}`);
    } catch (err: unknown) {
      toast.error(t("common.error"), err instanceof Error ? err.message : "Failed to save.");
    }
  }

  if (isLoading) return <AppShell showBack><PageLoader /></AppShell>;
  if (isError) return <AppShell showBack><QueryErrorState onRetry={() => void refetch()} /></AppShell>;
  if (!client)   return <AppShell showBack><p className="text-danger text-sm">Client not found.</p></AppShell>;

  return (
    <AppShell pageTitle={t("clients.edit")} showBack>
      <div className="max-w-xl mx-auto">
        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>

            <Input label={t("clients.name")} required error={errors.full_name?.message}
              placeholder="e.g. Muhammad Aslam Khan or فاطمہ بی بی" {...register("full_name")} />

            <Input label={t("clients.fatherHusbandName")} error={errors.father_husband_name?.message}
              {...register("father_husband_name")} />

            {/* CNIC with mask */}
            <div className="space-y-1.5">
              <label className="label">
                {t("clients.cnic")}
                <span className="text-navy-300 text-xs ml-1">({t("common.optional")})</span>
              </label>
              <input
                type="text" inputMode="numeric"
                placeholder="35201-1234567-1" maxLength={15}
                className={`input font-mono ${errors.cnic ? "border-danger" : ""}`}
                value={cnicVal}
                onChange={e => setValue("cnic", formatCnic(e.target.value), { shouldValidate: true })}
                onBlur={runDupCheck}
              />
              {errors.cnic && <p className="text-danger text-xs">{errors.cnic.message}</p>}
            </div>

            <Input label={t("clients.phone")} required type="tel" placeholder="+92 300 1234567"
              error={errors.phone?.message}
              {...register("phone", { onBlur: runDupCheck })} />

            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input type="checkbox" className="w-4 h-4 rounded border-navy-200 accent-gold"
                {...register("whatsapp_same")} />
              <span className="text-sm text-navy">{t("clients.whatsapp")} same as phone</span>
            </label>

            {!whatsappSame && (
              <Input label={t("clients.whatsapp")} type="tel" placeholder="+92 300 1234567"
                error={errors.whatsapp?.message} {...register("whatsapp")} />
            )}

            {dupCheckError && <QueryErrorState onRetry={() => void runDupCheck()} message={dupCheckError} className="py-4" />}
            {dupWarning && (
              <div className="flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                <p className="text-xs text-yellow-800">{dupWarning}</p>
              </div>
            )}

            <Input label={t("clients.email")} type="email" error={errors.email?.message}
              {...register("email")} />

            <Select label={t("clients.city")} options={PK_CITY_OPTIONS} placeholder="Select city"
              {...register("city")} />

            <Textarea label={t("clients.address")} rows={2} {...register("address")} />

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={() => router.back()} className="flex-1">
                {t("common.cancel")}
              </Button>
              <Button type="submit" loading={isSubmitting} className="flex-1">
                {t("common.save")}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </AppShell>
  );
}

export default function EditClientRoute() {
  return (
    <RouteGuard allowedRoles={["admin", "lawyer", "super_admin"]}>
      <Suspense><EditClientPage /></Suspense>
    </RouteGuard>
  );
}
