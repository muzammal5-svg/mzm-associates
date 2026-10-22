"use client";

import { Suspense, useEffect, useState, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  CheckCircle2, ExternalLink, Hash, Wallet, Sparkles, Crown, CalendarDays,
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { RouteGuard } from "@/components/shared/RouteGuard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { toast } from "@/components/ui/Toast";
import { PlanCard, type PlanView } from "@/components/marketing/PlanCard";
import { LockBanner } from "@/components/billing/LockBanner";
import { PaymentGatewayTabs } from "@/components/billing/PaymentGatewayTabs";
import { ReceiptDropzone } from "@/components/billing/ReceiptDropzone";
import { FloatingField } from "@/components/billing/FloatingField";
import { PaymentHistoryTable } from "@/components/billing/PaymentHistoryTable";
import { supabase } from "@/lib/supabase/client";
import { useSubscriptionAccess } from "@/hooks/useSubscriptionAccess";
import { saasDb, saasRpc } from "@/lib/supabase/saas";
import type { Payment, PaymentAccount, PaymentMethod } from "@/types/saas";

function BillingView() {
  const { t } = useTranslation();
  const { state, status, refresh } = useSubscriptionAccess();
  const params = useSearchParams();
  const preselectCode = params.get("plan") ?? "";

  const [plans, setPlans] = useState<PlanView[]>([]);
  const [accounts, setAccounts] = useState<PaymentAccount[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Form states
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("bank_transfer");
  const [referenceNo, setReferenceNo] = useState("");
  const [amount, setAmount] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState({ ref: false, amount: false });
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);

  const loadBillingData = useCallback(async () => {
    try {
      const [{ data: plansData }, { data: accountsData }, { data: paymentsData }] = await Promise.all([
        saasDb.plans().select("*").eq("is_active", true).order("sort_order"),
        saasDb.paymentAccounts().select("*").eq("is_active", true).order("sort_order"),
        saasDb.payments().select("*").order("created_at", { ascending: false }),
      ]);

      const fetchedPlans = (plansData as unknown as PlanView[]) ?? [];
      setPlans(fetchedPlans);
      setAccounts((accountsData as unknown as PaymentAccount[]) ?? []);
      setPayments((paymentsData as unknown as Payment[]) ?? []);

      if (fetchedPlans.length > 0) {
        setSelectedPlanId((current) => {
          if (current && fetchedPlans.some((p) => p.id === current)) return current;
          const match = preselectCode ? fetchedPlans.find((p) => p.code === preselectCode) : null;
          return (match ?? fetchedPlans[0]).id;
        });
      }
    } catch (err: unknown) {
      console.error("Failed to load billing details:", err);
    } finally {
      setLoadingData(false);
    }
  }, [preselectCode]);

  useEffect(() => {
    void loadBillingData();
  }, [loadBillingData]);

  const selectedPlanObj = useMemo(
    () => plans.find((p) => p.id === selectedPlanId),
    [plans, selectedPlanId]
  );

  // Keep the amount in sync with the chosen plan
  useEffect(() => {
    if (selectedPlanObj) setAmount(String(selectedPlanObj.price_pkr));
  }, [selectedPlanObj]);

  const baselineMonthly = useMemo(() => {
    if (plans.length === 0) return 0;
    return Math.min(
      ...plans.map((p) => Math.round(Number(p.price_pkr) / Math.max(1, p.duration_months)))
    );
  }, [plans]);

  const popularPlanId = useMemo(
    () => plans.find((p) => p.duration_months >= 12)?.id ?? plans[0]?.id ?? "",
    [plans]
  );

  const planNames = useMemo(() => {
    const map: Record<string, string> = {};
    plans.forEach((p) => { map[p.id] = p.name; });
    return map;
  }, [plans]);

  const handleSelectPlan = (plan: PlanView) => {
    setSelectedPlanId(plan.id);
    setAmount(String(plan.price_pkr));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ ref: true, amount: true });

    if (!selectedPlanId || !amount || !referenceNo.trim()) {
      toast.error(t("billing.formIncomplete"));
      return;
    }

    setSubmitting(true);
    let slipPath: string | null = null;

    try {
      if (file) {
        const { data: userData } = await supabase.auth.getUser();
        const { data: profile } = await supabase
          .from("profiles")
          .select("firm_id")
          .eq("id", userData.user?.id ?? "")
          .single();

        const ext = file.name.split(".").pop();
        const path = `${profile?.firm_id || "firm"}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadErr } = await supabase.storage.from("payment-slips").upload(path, file);
        if (uploadErr) throw uploadErr;
        slipPath = path;
      }

      const { error: submitErr } = await saasRpc.submitPayment({
        planId: selectedPlanId,
        method: selectedMethod,
        referenceNo: referenceNo.trim(),
        slipPath,
        amount: Number(amount),
      });

      if (submitErr) throw submitErr;

      toast.success(t("billing.submitted"));
      setReferenceNo("");
      setFile(null);
      setTouched({ ref: false, amount: false });
      await Promise.all([loadBillingData(), refresh()]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t("common.error");
      console.error("Payment error:", err);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewReceipt = async (payment: Payment) => {
    if (!payment.slip_path) return;
    try {
      const { data, error } = await supabase.storage
        .from("payment-slips")
        .createSignedUrl(payment.slip_path, 600);
      if (error || !data?.signedUrl) {
        toast.error(t("billing.receiptUnavailable"));
        return;
      }
      setReceiptUrl(data.signedUrl);
    } catch (err: unknown) {
      console.error("Failed to load slip:", err);
      toast.error(t("billing.receiptUnavailable"));
    }
  };

  const isLocked =
    status === "expired" ||
    status === "suspended" ||
    status === "cancelled" ||
    status === "none" ||
    status === "pending";

  const severity = isLocked ? "locked" : status === "grace" ? "grace" : "active";

  const refError =
    touched.ref && !referenceNo.trim() ? t("billing.transIdRequired") : undefined;
  const amountError =
    touched.amount && (!amount || Number(amount) <= 0) ? t("billing.amountRequired") : undefined;

  const refValid = referenceNo.trim().length >= 6;
  const amountValid = Number(amount) > 0;

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-10">
      {/* ── Subscription status ───────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm backdrop-blur-md sm:p-6">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-gold-400 via-gold-200 to-transparent" aria-hidden="true" />
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="font-heading text-xl font-bold text-navy sm:text-2xl">
                {t("billing.title")}
              </h1>
              <Badge
                variant={
                  status === "active" ? "success"
                  : status === "trialing" ? "gold"
                  : status === "grace" ? "warning"
                  : "danger"
                }
                size="sm"
                dot
              >
                {status.toUpperCase()}
              </Badge>
            </div>
            <p className="mt-1.5 text-xs text-muted">
              {state?.ends_at
                ? t("billing.renewsOn", { date: new Date(state.ends_at).toLocaleDateString() })
                : t("billing.selectPlan")}
            </p>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {state?.days_left != null && (
              <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 px-4 py-2.5 text-center">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-muted">
                  {t("billing.daysLeftLabel")}
                </span>
                <span className="font-heading text-lg font-bold text-navy">
                  {t("billing.daysLeft", { count: state.days_left })}
                </span>
              </div>
            )}
            {state?.seats_used != null && (
              <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 px-4 py-2.5 text-center">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-muted">
                  {t("billing.seatsLabel")}
                </span>
                <span className="font-heading text-lg font-bold text-navy">
                  {state.seats_used} / {state.seats_max ?? 5}
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Lock / status banner ──────────────────────────────────────── */}
      <LockBanner severity={severity} status={status} />

      {/* ── Plan selection ────────────────────────────────────────────── */}
      <section id="plans" className="scroll-mt-24 space-y-4">
        <div className="flex items-center gap-2.5">
          <Crown className="h-5 w-5 text-gold" aria-hidden="true" />
          <h2 className="font-heading text-lg font-bold text-navy">{t("billing.selectPlan")}</h2>
        </div>

        {loadingData ? (
          <div className="grid gap-5 sm:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-72 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div
            className="grid gap-5 sm:grid-cols-3"
            role="radiogroup"
            aria-label={t("billing.selectPlan")}
          >
            {plans.map((p) => (
              <PlanCard
                key={p.id}
                plan={p}
                selected={p.id === selectedPlanId}
                popular={p.id === popularPlanId}
                baselineMonthly={baselineMonthly}
                onSelect={handleSelectPlan}
                showCta={false}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── Payment form ──────────────────────────────────────────────── */}
      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <header className="flex items-center gap-2.5 border-b border-slate-200/80 bg-gradient-to-r from-slate-900 to-navy-800 px-5 py-4">
          <Wallet className="h-[18px] w-[18px] text-gold-300" aria-hidden="true" />
          <h2 className="font-heading text-base font-bold text-white">{t("billing.submitPayment")}</h2>
          <span className="ms-auto inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-white/70">
            <Sparkles className="h-3 w-3 text-gold-300" aria-hidden="true" />
            {t("billing.securePayment")}
          </span>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6 p-5 sm:p-6">
          <PaymentGatewayTabs
            accounts={accounts}
            value={selectedMethod}
            onChange={(m) => setSelectedMethod(m)}
          />

          <div className="h-px bg-slate-100" aria-hidden="true" />

          {/* Transaction details */}
          <div className="grid gap-4 sm:grid-cols-2">
            <FloatingField
              label={t("billing.transId")}
              value={referenceNo}
              onChange={(e) => setReferenceNo(e.target.value.toUpperCase())}
              onBlur={() => setTouched((s) => ({ ...s, ref: true }))}
              error={refError}
              valid={refValid}
              required
              autoComplete="off"
              spellCheck={false}
              leftIcon={<Hash className="h-4 w-4" />}
              hint={t("billing.transIdHint")}
            />
            <FloatingField
              label={t("billing.amountPkr")}
              type="number"
              inputMode="numeric"
              min={1}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onBlur={() => setTouched((s) => ({ ...s, amount: true }))}
              error={amountError}
              valid={amountValid}
              required
              leftIcon={<Wallet className="h-4 w-4" />}
              hint={selectedPlanObj ? t("billing.amountHint", { name: selectedPlanObj.name }) : undefined}
            />
          </div>

          {/* Receipt upload */}
          <div className="space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-navy-600">
              {t("billing.uploadSlip")}
            </p>
            <ReceiptDropzone file={file} onChange={setFile} />
          </div>

          <Button
            type="submit"
            variant="primary"
            disabled={submitting}
            className="h-12 w-full"
            leftIcon={<CheckCircle2 className="h-4 w-4" />}
          >
            {submitting ? t("billing.submitting") : t("billing.submitPayment")}
          </Button>
        </form>
      </section>

      {/* ── Payment history ───────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2.5">
          <CalendarDays className="h-5 w-5 text-gold" aria-hidden="true" />
          <h2 className="font-heading text-lg font-bold text-navy">{t("billing.history")}</h2>
        </div>
        <PaymentHistoryTable
          payments={payments}
          planNames={planNames}
          onViewReceipt={handleViewReceipt}
        />
      </section>

      {/* ── Receipt lightbox ──────────────────────────────────────────── */}
      <Modal
        open={!!receiptUrl}
        onClose={() => setReceiptUrl(null)}
        title={t("billing.receiptTitle")}
        size="lg"
        footer={
          receiptUrl ? (
            <>
              <Button variant="secondary" onClick={() => setReceiptUrl(null)}>
                {t("common.close")}
              </Button>
              <a
                href={receiptUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-primary text-sm"
              >
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                {t("billing.openFullSize")}
              </a>
            </>
          ) : undefined
        }
      >
        <div className="flex max-h-[70vh] items-center justify-center overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={receiptUrl ?? ""} alt={t("billing.receiptPreview")} className="max-h-full max-w-full rounded-lg object-contain" />
        </div>
      </Modal>
    </div>
  );
}

export default function BillingPage() {
  const { t } = useTranslation();
  return (
    <RouteGuard>
      <AppShell pageTitle={t("billing.title")} showBack>
        <Suspense fallback={<div className="min-h-dvh bg-offwhite" />}>
          <BillingView />
        </Suspense>
      </AppShell>
    </RouteGuard>
  );
}
