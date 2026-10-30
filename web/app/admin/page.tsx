"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import {
  ShieldCheck,
  CreditCard,
  Building2,
  Tag,
  Wallet,
  Sliders,
  History,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  ExternalLink,
  Eye,
  RefreshCw,
  AlertTriangle,
  Search,
  Check,
  Edit,
  Power,
  Calendar,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { RouteGuard } from "@/components/shared/RouteGuard";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { toast } from "@/components/ui/Toast";
import { supabase } from "@/lib/supabase/client";
import { saasDb, saasRpc } from "@/lib/supabase/saas";
import type {
  Plan,
  Subscription,
  Payment,
  PaymentAccount,
  AppSetting,
  BillingEvent,
  SubStatus,
  PaymentStatus,
} from "@/types/saas";

type AdminTab = "payments" | "firms" | "plans" | "accounts" | "settings" | "audit";

interface FirmWithSub {
  id: string;
  name: string;
  phone: string | null;
  created_at: string;
  owner_name?: string;
  owner_email?: string;
  subscription?: Subscription;
  plan?: Plan;
  seats_used?: number;
}

interface PaymentWithDetails extends Payment {
  firm_name?: string;
  plan_name?: string;
}

function AdminDashboard() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<AdminTab>("payments");
  const [loading, setLoading] = useState(true);

  // Data states
  const [payments, setPayments] = useState<PaymentWithDetails[]>([]);
  const [firms, setFirms] = useState<FirmWithSub[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [accounts, setAccounts] = useState<PaymentAccount[]>([]);
  const [settings, setSettings] = useState<AppSetting[]>([]);
  const [events, setEvents] = useState<BillingEvent[]>([]);

  // Search & Filter
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | "all">("pending");
  const [firmFilter, setFirmFilter] = useState<SubStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination
  const [paymentPage, setPaymentPage] = useState(1);
  const [firmPage, setFirmPage] = useState(1);
  const [eventsPage, setEventsPage] = useState(1);
  const PAYMENTS_PER_PAGE = 8;
  const FIRMS_PER_PAGE = 8;
  const EVENTS_PER_PAGE = 15;

  // Modals
  const [slipUrl, setSlipUrl] = useState<string | null>(null);
  const [rejectPaymentId, setRejectPaymentId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [extendFirm, setExtendFirm] = useState<{ id: string; name: string } | null>(null);
  const [extendDays, setExtendDays] = useState(30);
  const [editPlan, setEditPlan] = useState<Plan | null>(null);
  const [editAccount, setEditAccount] = useState<PaymentAccount | null>(null);
  const [editSetting, setEditSetting] = useState<AppSetting | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch all admin data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch plans
      const { data: plansData } = await saasDb.plans().select("*").order("sort_order");
      const fetchedPlans = (plansData as unknown as Plan[]) || [];
      setPlans(fetchedPlans);

      // 2. Fetch payments
      const { data: paymentsData } = await saasDb
        .payments()
        .select("*")
        .order("created_at", { ascending: false });
      const rawPayments = (paymentsData as unknown as Payment[]) || [];

      // 3. Fetch firms and subscriptions
      const { data: firmsData } = await supabase.from("firms").select("*").order("created_at", { ascending: false });
      const { data: subsData } = await saasDb.subscriptions().select("*");
      const { data: profilesData } = await supabase.from("profiles").select("id, firm_id, full_name, email, is_owner, role");

      const rawFirms = (firmsData as any[]) || [];
      const rawSubs = (subsData as unknown as Subscription[]) || [];
      const rawProfiles = (profilesData as any[]) || [];

      // Map firm details with latest subscription
      const mappedFirms: FirmWithSub[] = rawFirms.map((f) => {
        const firmSubs = rawSubs
          .filter((s) => s.firm_id === f.id)
          .sort((a, b) => new Date(b.ends_at).getTime() - new Date(a.ends_at).getTime());
        const sub = firmSubs[0];
        const owner = rawProfiles.find((p) => p.firm_id === f.id && p.is_owner);
        const plan = sub ? fetchedPlans.find((p) => p.id === sub.plan_id) : undefined;
        const membersCount = rawProfiles.filter((p) => p.firm_id === f.id && p.is_active !== false).length;

        return {
          id: f.id,
          name: f.name,
          phone: f.phone,
          created_at: f.created_at,
          owner_name: owner?.full_name || "N/A",
          owner_email: owner?.email || "N/A",
          subscription: sub,
          plan,
          seats_used: membersCount,
        };
      });
      setFirms(mappedFirms);

      // Map payment details
      const mappedPayments: PaymentWithDetails[] = rawPayments.map((p) => {
        const firm = rawFirms.find((f) => f.id === p.firm_id);
        const plan = fetchedPlans.find((pl) => pl.id === p.plan_id);
        return {
          ...p,
          firm_name: firm?.name || "Unknown Firm",
          plan_name: plan?.name || "Plan",
        };
      });
      setPayments(mappedPayments);

      // 4. Fetch accounts, settings, events
      const { data: accountsData } = await saasDb.paymentAccounts().select("*").order("sort_order");
      setAccounts((accountsData as unknown as PaymentAccount[]) || []);

      const { data: settingsData } = await saasDb.appSettings().select("*").order("key");
      setSettings((settingsData as unknown as AppSetting[]) || []);

      const { data: eventsData } = await saasDb
        .billingEvents()
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      setEvents((eventsData as unknown as BillingEvent[]) || []);
    } catch (err: any) {
      console.error("Admin fetch error:", err);
      toast.error(err.message || "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  // Metrics
  const metrics = useMemo(() => {
    const pendingCount = payments.filter((p) => p.status === "pending").length;
    const activeFirmsCount = firms.filter((f) => f.subscription?.status === "active").length;
    const trialingFirmsCount = firms.filter((f) => f.subscription?.status === "trialing").length;
    const expiredFirmsCount = firms.filter(
      (f) => f.subscription?.status === "expired" || f.subscription?.status === "grace"
    ).length;
    const totalRevenue = payments
      .filter((p) => p.status === "verified")
      .reduce((sum, p) => sum + Number(p.amount_pkr || 0), 0);

    return {
      pendingCount,
      activeFirmsCount,
      trialingFirmsCount,
      expiredFirmsCount,
      totalRevenue,
    };
  }, [payments, firms]);

  // Slip preview handler
  const handlePreviewSlip = async (slipPath: string) => {
    try {
      const { data, error } = await supabase.storage.from("payment-slips").createSignedUrl(slipPath, 600);
      if (error || !data?.signedUrl) {
        toast.error("Could not generate secure link for receipt slip");
        return;
      }
      setSlipUrl(data.signedUrl);
    } catch (err: any) {
      toast.error(err.message || "Failed to view slip");
    }
  };

  // Payment actions
  const handleApprovePayment = async (paymentId: string) => {
    if (!window.confirm("Approve this payment and activate the firm subscription?")) return;
    setActionLoading(true);
    try {
      const { error } = await saasRpc.verifyPayment(paymentId, true, "Approved by admin");
      if (error) throw error;
      toast.success("Payment verified! Firm subscription is now active.");
      void fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to verify payment");
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectPaymentId) return;
    setActionLoading(true);
    try {
      const { error } = await saasRpc.verifyPayment(rejectPaymentId, false, rejectNote || "Payment rejected by administrator");
      if (error) throw error;
      toast.success("Payment marked as rejected.");
      setRejectPaymentId(null);
      setRejectNote("");
      void fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to reject payment");
    } finally {
      setActionLoading(false);
    }
  };

  // Firm actions
  const handleConfirmExtend = async () => {
    if (!extendFirm) return;
    setActionLoading(true);
    try {
      const { error } = await saasRpc.adminExtendSubscription(extendFirm.id, Number(extendDays));
      if (error) throw error;
      toast.success(`Extended subscription for ${extendFirm.name} by ${extendDays} days!`);
      setExtendFirm(null);
      void fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to extend subscription");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuspendFirm = async (firm: FirmWithSub) => {
    const note = window.prompt(`Enter suspension reason for "${firm.name}":`, "Payment violation");
    if (!note) return;
    setActionLoading(true);
    try {
      const { error } = await saasRpc.adminSuspendFirm(firm.id, note);
      if (error) throw error;
      toast.success(`Suspended firm ${firm.name}. Access is locked.`);
      void fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to suspend firm");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReactivateFirm = async (firm: FirmWithSub) => {
    if (!window.confirm(`Reactivate firm "${firm.name}"?`)) return;
    setActionLoading(true);
    try {
      const { error } = await saasRpc.adminReactivateFirm(firm.id);
      if (error) throw error;
      toast.success(`Reactivated firm ${firm.name}.`);
      void fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to reactivate firm");
    } finally {
      setActionLoading(false);
    }
  };

  // Plan actions
  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPlan) return;
    setActionLoading(true);
    try {
      const { error } = await saasDb
        .plans()
        .update({
          name: editPlan.name,
          price_pkr: editPlan.price_pkr,
          max_users: editPlan.max_users,
          is_active: editPlan.is_active,
        })
        .eq("id", editPlan.id);
      if (error) throw error;
      toast.success("Plan updated successfully!");
      setEditPlan(null);
      void fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to update plan");
    } finally {
      setActionLoading(false);
    }
  };

  // Account actions
  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editAccount) return;
    setActionLoading(true);
    try {
      const { error } = await saasDb
        .paymentAccounts()
        .update({
          account_title: editAccount.account_title,
          account_number: editAccount.account_number,
          bank_name: editAccount.bank_name,
          instructions: editAccount.instructions,
          is_active: editAccount.is_active,
        })
        .eq("id", editAccount.id);
      if (error) throw error;
      toast.success("Payment account details updated!");
      setEditAccount(null);
      void fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to update payment account");
    } finally {
      setActionLoading(false);
    }
  };

  // Setting actions
  const handleSaveSetting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editSetting) return;
    setActionLoading(true);
    try {
      const { error } = await saasDb
        .appSettings()
        .update({ value: editSetting.value })
        .eq("key", editSetting.key);
      if (error) throw error;
      toast.success(`Setting '${editSetting.key}' saved!`);
      setEditSetting(null);
      void fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to update setting");
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered & Paginated Payments
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const matchesFilter = paymentFilter === "all" || p.status === paymentFilter;
      const matchesSearch =
        !searchQuery ||
        p.firm_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.reference_no.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [payments, paymentFilter, searchQuery]);

  const totalPaymentPages = Math.ceil(filteredPayments.length / PAYMENTS_PER_PAGE) || 1;
  const paginatedPayments = useMemo(() => {
    const from = (paymentPage - 1) * PAYMENTS_PER_PAGE;
    return filteredPayments.slice(from, from + PAYMENTS_PER_PAGE);
  }, [filteredPayments, paymentPage]);

  // Filtered & Paginated Firms
  const filteredFirms = useMemo(() => {
    return firms.filter((f) => {
      const matchesFilter = firmFilter === "all" || f.subscription?.status === firmFilter;
      const matchesSearch =
        !searchQuery ||
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.owner_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.phone?.includes(searchQuery);
      return matchesFilter && matchesSearch;
    });
  }, [firms, firmFilter, searchQuery]);

  const totalFirmPages = Math.ceil(filteredFirms.length / FIRMS_PER_PAGE) || 1;
  const paginatedFirms = useMemo(() => {
    const from = (firmPage - 1) * FIRMS_PER_PAGE;
    return filteredFirms.slice(from, from + FIRMS_PER_PAGE);
  }, [filteredFirms, firmPage]);

  // Paginated Audit Events
  const totalEventsPages = Math.ceil(events.length / EVENTS_PER_PAGE) || 1;
  const paginatedEvents = useMemo(() => {
    const from = (eventsPage - 1) * EVENTS_PER_PAGE;
    return events.slice(from, from + EVENTS_PER_PAGE);
  }, [events, eventsPage]);

  return (
    <div className="min-h-screen bg-mesh-surface pb-16">
      {/* Top Header */}
      <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-900/90 text-white shadow-xl shadow-slate-950/30 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gold-cta shadow-gold ring-1 ring-gold-300/40">
              <ShieldCheck className="h-5 w-5 text-navy-900" aria-hidden="true" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading text-lg font-bold text-white">MZM Admin</span>
                <Badge variant="gold" size="sm" className="font-semibold uppercase text-[10px]">
                  Super Admin
                </Badge>
              </div>
              <p className="hidden text-xs text-white/60 sm:block">Subscription SaaS Control Center</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/80 transition-all duration-200 hover:border-gold-400/60 hover:bg-gold-400/10 hover:text-gold-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Back to App</span>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void fetchData()}
              disabled={loading}
              className="text-white hover:bg-white/10"
              title="Refresh Data"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
        <div className="h-px w-full bg-gradient-to-r from-transparent via-gold-400/60 to-transparent" aria-hidden="true" />
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Metric Highlights */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Card className="glass-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">Pending Payments</p>
                <p className="mt-1 font-heading text-2xl font-bold text-navy">{metrics.pendingCount}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                <Clock className="h-5 w-5" aria-hidden="true" />
              </div>
            </div>
          </Card>

          <Card className="glass-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">Active Firms</p>
                <p className="mt-1 font-heading text-2xl font-bold text-navy">{metrics.activeFirmsCount}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                <Building2 className="h-5 w-5" aria-hidden="true" />
              </div>
            </div>
          </Card>

          <Card className="glass-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">Trialing Firms</p>
                <p className="mt-1 font-heading text-2xl font-bold text-navy">{metrics.trialingFirmsCount}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
                <Users className="h-5 w-5" aria-hidden="true" />
              </div>
            </div>
          </Card>

          <Card className="glass-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">Verified Revenue</p>
                <p className="mt-1 font-heading text-2xl font-bold text-gold-700">
                  Rs {metrics.totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-100 text-gold-700">
                <Wallet className="h-5 w-5" aria-hidden="true" />
              </div>
            </div>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div
          className="scrollbar-hide flex items-center gap-1 overflow-x-auto rounded-2xl border border-slate-200/80 bg-white/80 p-1.5 shadow-sm backdrop-blur-md"
          role="tablist"
          aria-label="Admin sections"
        >
          {(
            [
              { id: "payments", label: "Payments Queue", icon: CreditCard, count: metrics.pendingCount },
              { id: "firms", label: "Subscriber Firms", icon: Building2, count: firms.length },
              { id: "plans", label: "Pricing Plans", icon: Tag, count: plans.length },
              { id: "accounts", label: "Payment Accounts", icon: Wallet, count: accounts.length },
              { id: "settings", label: "SaaS Settings", icon: Sliders, count: settings.length },
              { id: "audit", label: "Audit Events", icon: History, count: events.length },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSearchQuery("");
                  setPaymentPage(1);
                  setFirmPage(1);
                  setEventsPage(1);
                }}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-all duration-200 ease-in-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                  isActive
                    ? "bg-navy-800 text-white shadow-md"
                    : "text-muted hover:bg-white hover:text-navy"
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[11px] font-bold leading-none ${
                      isActive ? "bg-gold-cta text-navy-900" : "bg-navy-50 text-navy-500"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Payments Queue */}
        {activeTab === "payments" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Filter pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {(["pending", "verified", "rejected", "all"] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => { setPaymentFilter(st); setPaymentPage(1); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                      paymentFilter === st
                        ? "bg-gold text-white shadow-xs"
                        : "bg-white text-muted hover:text-navy border border-border"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Search box */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  placeholder="Search firm or ref no..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setPaymentPage(1); }}
                  className="w-full ps-9 pe-3 py-1.5 text-xs text-navy rounded-lg border border-border bg-white placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-gold/30"
                />
              </div>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 rounded-xl" />
                ))}
              </div>
            ) : filteredPayments.length === 0 ? (
              <Card>
                <EmptyState
                  icon={CreditCard}
                  title="No payment records found"
                  description="When clients submit manual payment receipts, they will appear in this verification queue."
                  className="py-12"
                />
              </Card>
            ) : (
              <div className="space-y-3">
                {paginatedPayments.map((p) => (
                  <Card key={p.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          p.status === "verified"
                            ? "bg-success/10 text-success"
                            : p.status === "rejected"
                            ? "bg-danger/10 text-danger"
                            : "bg-warning/10 text-warning"
                        }`}
                      >
                        {p.status === "verified" ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : p.status === "rejected" ? (
                          <XCircle className="w-5 h-5" />
                        ) : (
                          <Clock className="w-5 h-5" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold text-navy text-sm">{p.firm_name}</h4>
                          <Badge
                            variant={
                              p.status === "verified" ? "success" : p.status === "rejected" ? "danger" : "warning"
                            }
                            size="sm"
                          >
                            {p.status}
                          </Badge>
                          <span className="text-xs text-muted font-medium bg-navy-50 px-2 py-0.5 rounded">
                            {p.method.replace("_", " ")}
                          </span>
                        </div>

                        <div className="mt-1 text-xs text-muted flex flex-wrap gap-x-4 gap-y-1">
                          <span>
                            Plan: <strong className="text-navy">{p.plan_name}</strong>
                          </span>
                          <span>
                            Ref / TID: <strong className="font-mono text-navy">{p.reference_no}</strong>
                          </span>
                          <span>
                            Amount: <strong className="text-gold font-bold">Rs {Number(p.amount_pkr).toLocaleString()}</strong>
                          </span>
                          <span>Date: {new Date(p.created_at).toLocaleDateString()}</span>
                        </div>

                        {p.note && (
                          <p className="mt-1.5 text-xs text-danger/80 italic bg-danger/5 px-2 py-0.5 rounded">
                            Note: {p.note}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                      {p.slip_path && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handlePreviewSlip(p.slip_path!)}
                          className="text-xs"
                        >
                          <Eye className="w-3.5 h-3.5 me-1.5" />
                          View Slip
                        </Button>
                      )}

                      {p.status === "pending" && (
                        <>
                          <Button
                            variant="primary"
                            size="sm"
                            disabled={actionLoading}
                            onClick={() => handleApprovePayment(p.id)}
                            className="text-xs bg-success hover:bg-success/90"
                          >
                            <Check className="w-3.5 h-3.5 me-1" />
                            Approve
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            disabled={actionLoading}
                            onClick={() => setRejectPaymentId(p.id)}
                            className="text-xs"
                          >
                            <XCircle className="w-3.5 h-3.5 me-1" />
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </Card>
                ))}

                {totalPaymentPages > 1 && (
                  <div className="flex items-center justify-between pt-3 px-1 text-xs text-muted border-t border-slate-200">
                    <span>
                      Showing {(paymentPage - 1) * PAYMENTS_PER_PAGE + 1} to {Math.min(paymentPage * PAYMENTS_PER_PAGE, filteredPayments.length)} of {filteredPayments.length} entries
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="secondary"
                        size="xs"
                        disabled={paymentPage <= 1}
                        onClick={() => setPaymentPage((p) => Math.max(1, p - 1))}
                        className="px-2 py-1"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </Button>
                      <span className="font-medium text-navy px-1">
                        {paymentPage} / {totalPaymentPages}
                      </span>
                      <Button
                        variant="secondary"
                        size="xs"
                        disabled={paymentPage >= totalPaymentPages}
                        onClick={() => setPaymentPage((p) => Math.min(totalPaymentPages, p + 1))}
                        className="px-2 py-1"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Subscriber Firms */}
        {activeTab === "firms" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {(["all", "active", "trialing", "grace", "expired", "suspended"] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => { setFirmFilter(st); setFirmPage(1); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                      firmFilter === st
                        ? "bg-gold text-white shadow-xs"
                        : "bg-white text-muted hover:text-navy border border-border"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  placeholder="Search firm, email, phone..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setFirmPage(1); }}
                  className="w-full ps-9 pe-3 py-1.5 text-xs text-navy rounded-lg border border-border bg-white placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-gold/30"
                />
              </div>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 rounded-xl" />
                ))}
              </div>
            ) : filteredFirms.length === 0 ? (
              <Card>
                <EmptyState
                  icon={Building2}
                  title="No subscriber firms found"
                  description="Firms that register will appear here with live seat usage and subscription status."
                  className="py-12"
                />
              </Card>
            ) : (
              <div className="space-y-3">
                {paginatedFirms.map((f) => {
                  const sub = f.subscription;
                  const isSuspended = sub?.status === "suspended";
                  return (
                    <Card key={f.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-navy/10 text-navy flex items-center justify-center font-heading font-bold text-base shrink-0">
                          {f.name.charAt(0)}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold text-navy text-sm">{f.name}</h4>
                            {sub ? (
                              <Badge
                                variant={
                                  sub.status === "active"
                                    ? "success"
                                    : sub.status === "trialing"
                                    ? "gold"
                                    : sub.status === "grace"
                                    ? "warning"
                                    : "danger"
                                }
                                size="sm"
                              >
                                {sub.status}
                              </Badge>
                            ) : (
                              <Badge variant="neutral" size="sm">No sub</Badge>
                            )}
                            <span className="text-xs text-muted">
                              Plan: <strong>{f.plan?.name || "None"}</strong>
                            </span>
                          </div>

                          <div className="mt-1 text-xs text-muted flex flex-wrap gap-x-4 gap-y-1">
                            <span>Owner: <strong className="text-navy">{f.owner_name}</strong> ({f.owner_email})</span>
                            {f.phone && <span>Phone: {f.phone}</span>}
                            <span>
                              Seats: <strong className="text-navy">{f.seats_used} / {f.plan?.max_users || 5}</strong>
                            </span>
                            {sub?.ends_at && (
                              <span>
                                Expiry: <strong className="text-navy">{new Date(sub.ends_at).toLocaleDateString()}</strong>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setExtendFirm({ id: f.id, name: f.name })}
                          className="text-xs"
                        >
                          <Calendar className="w-3.5 h-3.5 me-1" />
                          Extend (+Days)
                        </Button>

                        {isSuspended ? (
                          <Button
                            variant="primary"
                            size="sm"
                            disabled={actionLoading}
                            onClick={() => handleReactivateFirm(f)}
                            className="text-xs bg-success hover:bg-success/90"
                          >
                            <Power className="w-3.5 h-3.5 me-1" />
                            Reactivate
                          </Button>
                        ) : (
                          <Button
                            variant="danger"
                            size="sm"
                            disabled={actionLoading}
                            onClick={() => handleSuspendFirm(f)}
                            className="text-xs"
                          >
                            <AlertTriangle className="w-3.5 h-3.5 me-1" />
                            Suspend
                          </Button>
                        )}
                      </div>
                    </Card>
                  );
                })}

                {totalFirmPages > 1 && (
                  <div className="flex items-center justify-between pt-3 px-1 text-xs text-muted border-t border-slate-200">
                    <span>
                      Showing {(firmPage - 1) * FIRMS_PER_PAGE + 1} to {Math.min(firmPage * FIRMS_PER_PAGE, filteredFirms.length)} of {filteredFirms.length} firms
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="secondary"
                        size="xs"
                        disabled={firmPage <= 1}
                        onClick={() => setFirmPage((p) => Math.max(1, p - 1))}
                        className="px-2 py-1"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </Button>
                      <span className="font-medium text-navy px-1">
                        {firmPage} / {totalFirmPages}
                      </span>
                      <Button
                        variant="secondary"
                        size="xs"
                        disabled={firmPage >= totalFirmPages}
                        onClick={() => setFirmPage((p) => Math.min(totalFirmPages, p + 1))}
                        className="px-2 py-1"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Pricing Plans */}
        {activeTab === "plans" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-navy">SaaS Subscription Plans</h3>
                <p className="text-xs text-muted">Configure pricing, durations, and seat capacities visible on the landing page and checkout.</p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {plans.map((pl) => (
                <Card key={pl.id} className="p-6 flex flex-col justify-between relative overflow-hidden">
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-heading font-bold text-lg text-navy">{pl.name}</h4>
                      <Badge variant={pl.is_active ? "success" : "neutral"} size="sm">
                        {pl.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted font-mono mt-0.5">Code: {pl.code}</p>

                    <div className="mt-4">
                      <p className="text-3xl font-bold text-navy font-heading">
                        Rs {Number(pl.price_pkr).toLocaleString()}
                      </p>
                      <p className="text-xs text-muted mt-1">
                        Duration: <strong>{pl.duration_months} month(s)</strong>
                      </p>
                      <p className="text-xs text-muted">
                        Max Seats: <strong>{pl.max_users} users</strong> (1 Owner + Lawyers + Clerks)
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-border flex items-center justify-end">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setEditPlan(pl)}
                      className="text-xs w-full"
                    >
                      <Edit className="w-3.5 h-3.5 me-1.5" />
                      Edit Plan Details
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Payment Accounts */}
        {activeTab === "accounts" && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-navy">Subscriber Payment Receiving Accounts</h3>
              <p className="text-xs text-muted">
                These account details and instructions are shown to firm owners on the <code className="bg-navy-50 px-1 py-0.5 rounded">/billing</code> screen when submitting payments.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {accounts.map((acc) => (
                <Card key={acc.id} className="p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-gold" />
                        <h4 className="font-bold text-navy text-sm uppercase tracking-wider">
                          {acc.method.replace("_", " ")}
                        </h4>
                      </div>
                      <Badge variant={acc.is_active ? "success" : "neutral"} size="sm">
                        {acc.is_active ? "Active" : "Disabled"}
                      </Badge>
                    </div>

                    <div className="mt-4 space-y-2 text-xs">
                      {acc.bank_name && (
                        <div>
                          <span className="text-muted block">Bank Name:</span>
                          <strong className="text-navy">{acc.bank_name}</strong>
                        </div>
                      )}
                      <div>
                        <span className="text-muted block">Account Title:</span>
                        <strong className="text-navy">{acc.account_title}</strong>
                      </div>
                      <div>
                        <span className="text-muted block">Account / Mobile Number:</span>
                        <strong className="font-mono text-gold text-sm">{acc.account_number}</strong>
                      </div>
                      {acc.instructions && (
                        <div className="pt-2">
                          <span className="text-muted block">Instructions:</span>
                          <p className="text-navy/80 italic">{acc.instructions}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-border">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setEditAccount(acc)}
                      className="text-xs w-full"
                    >
                      <Edit className="w-3.5 h-3.5 me-1.5" />
                      Configure Account
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: SaaS Settings */}
        {activeTab === "settings" && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-navy">Global SaaS System Variables</h3>
              <p className="text-xs text-muted">
                Runtime configuration values stored in <code className="bg-navy-50 px-1 py-0.5 rounded">public.app_settings</code>.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {settings.map((s) => (
                <Card key={s.key} className="p-4 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-mono text-muted uppercase tracking-wider block">{s.key}</span>
                    <p className="text-lg font-bold text-navy font-mono mt-1 break-all">
                      {typeof s.value === "object" ? JSON.stringify(s.value) : String(s.value)}
                    </p>
                    <p className="text-[10px] text-muted mt-2">
                      Last modified: {new Date(s.updated_at).toLocaleString()}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setEditSetting(s)}
                      className="text-xs w-full"
                    >
                      <Edit className="w-3.5 h-3.5 me-1" />
                      Edit Variable
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Tab 6: Audit Events */}
        {activeTab === "audit" && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-navy">Audit & Billing Events</h3>
              <p className="text-xs text-muted">Immutable log of system billing events and notifications.</p>
            </div>

            {events.length === 0 ? (
              <Card>
                <EmptyState icon={History} title="No audit events logged" className="py-12" />
              </Card>
            ) : (
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-start text-xs">
                    <thead className="bg-navy-50 text-navy font-semibold uppercase text-[10px] tracking-wider border-b border-border">
                      <tr>
                        <th className="px-4 py-3 text-start">Timestamp</th>
                        <th className="px-4 py-3 text-start">Event Type</th>
                        <th className="px-4 py-3 text-start">Firm ID</th>
                        <th className="px-4 py-3 text-start">Payload</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {paginatedEvents.map((ev) => (
                        <tr key={ev.id} className="hover:bg-offwhite transition-colors">
                          <td className="px-4 py-2.5 text-muted whitespace-nowrap">
                            {new Date(ev.created_at).toLocaleString()}
                          </td>
                          <td className="px-4 py-2.5 font-bold text-navy whitespace-nowrap">
                            <span className="bg-navy/10 px-2 py-0.5 rounded text-[11px] font-mono">
                              {ev.event_type}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 font-mono text-muted whitespace-nowrap">{ev.firm_id}</td>
                          <td className="px-4 py-2.5 font-mono text-[11px] text-navy/80 max-w-xs truncate">
                            {JSON.stringify(ev.payload)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalEventsPages > 1 && (
                  <div className="flex items-center justify-between p-3 text-xs text-muted border-t border-slate-200">
                    <span>
                      Showing {(eventsPage - 1) * EVENTS_PER_PAGE + 1} to {Math.min(eventsPage * EVENTS_PER_PAGE, events.length)} of {events.length} events
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="secondary"
                        size="xs"
                        disabled={eventsPage <= 1}
                        onClick={() => setEventsPage((p) => Math.max(1, p - 1))}
                        className="px-2 py-1"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </Button>
                      <span className="font-medium text-navy px-1">
                        {eventsPage} / {totalEventsPages}
                      </span>
                      <Button
                        variant="secondary"
                        size="xs"
                        disabled={eventsPage >= totalEventsPages}
                        onClick={() => setEventsPage((p) => Math.min(totalEventsPages, p + 1))}
                        className="px-2 py-1"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            )}
          </div>
        )}
      </main>

      {/* MODAL: View Slip Lightbox */}
      {slipUrl && (
        <Modal
          open={!!slipUrl}
          onClose={() => setSlipUrl(null)}
          title="Payment Deposit Receipt"
        >
          <div className="space-y-4">
            <div className="max-h-[70vh] overflow-auto rounded-lg border border-border flex items-center justify-center bg-navy-50 p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={slipUrl} alt="Deposit Slip Receipt" className="max-w-full h-auto rounded object-contain" />
            </div>
            <div className="flex justify-end gap-2">
              <a
                href={slipUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary text-xs px-3 py-2 flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open Full Size
              </a>
              <Button variant="secondary" onClick={() => setSlipUrl(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL: Reject Payment with Note */}
      {rejectPaymentId && (
        <Modal
          open={!!rejectPaymentId}
          onClose={() => { setRejectPaymentId(null); setRejectNote(""); }}
          title="Reject Payment Submission"
        >
          <div className="space-y-4">
            <p className="text-xs text-muted">
              Please provide a clear reason for rejecting this payment (e.g. invalid transaction ID, incorrect deposit amount). The firm owner will see this feedback.
            </p>
            <Input
              label="Rejection Reason / Feedback"
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              placeholder="e.g. Transaction ID was not found in bank records"
              required
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="secondary"
                onClick={() => { setRejectPaymentId(null); setRejectNote(""); }}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                disabled={actionLoading || !rejectNote.trim()}
                onClick={handleConfirmReject}
              >
                Reject Payment
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL: Extend Subscription */}
      {extendFirm && (
        <Modal
          open={!!extendFirm}
          onClose={() => setExtendFirm(null)}
          title={`Extend Subscription: ${extendFirm.name}`}
        >
          <div className="space-y-4">
            <p className="text-xs text-muted">
              Add days to this firm&apos;s active subscription. This is ideal for manual offline renewals or goodwill extensions.
            </p>
            <Input
              label="Days to Add"
              type="number"
              value={extendDays}
              onChange={(e) => setExtendDays(Number(e.target.value))}
              min={1}
              max={365}
              required
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setExtendFirm(null)}>
                Cancel
              </Button>
              <Button variant="primary" disabled={actionLoading || extendDays < 1} onClick={handleConfirmExtend}>
                Apply Extension
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL: Edit Plan */}
      {editPlan && (
        <Modal
          open={!!editPlan}
          onClose={() => setEditPlan(null)}
          title={`Edit Plan: ${editPlan.name}`}
        >
          <form onSubmit={handleSavePlan} className="space-y-4">
            <Input
              label="Plan Display Name"
              value={editPlan.name}
              onChange={(e) => setEditPlan({ ...editPlan, name: e.target.value })}
              required
            />
            <Input
              label="Price (PKR)"
              type="number"
              value={editPlan.price_pkr}
              onChange={(e) => setEditPlan({ ...editPlan, price_pkr: Number(e.target.value) })}
              min={0}
              required
            />
            <Input
              label="Max Users / Seats"
              type="number"
              value={editPlan.max_users}
              onChange={(e) => setEditPlan({ ...editPlan, max_users: Number(e.target.value) })}
              min={1}
              max={100}
              required
            />
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-navy">
              <input
                type="checkbox"
                checked={editPlan.is_active}
                onChange={(e) => setEditPlan({ ...editPlan, is_active: e.target.checked })}
                className="rounded border-border text-gold focus:ring-gold"
              />
              <span>Plan is Active (Visible to subscribers)</span>
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" type="button" onClick={() => setEditPlan(null)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={actionLoading}>
                Save Plan Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL: Edit Payment Account */}
      {editAccount && (
        <Modal
          open={!!editAccount}
          onClose={() => setEditAccount(null)}
          title={`Edit ${editAccount.method.toUpperCase()} Account`}
        >
          <form onSubmit={handleSaveAccount} className="space-y-4">
            {editAccount.method === "bank_transfer" && (
              <Input
                label="Bank Name"
                value={editAccount.bank_name || ""}
                onChange={(e) => setEditAccount({ ...editAccount, bank_name: e.target.value })}
                placeholder="e.g. Meezan Bank, HBL"
                required
              />
            )}
            <Input
              label="Account Title"
              value={editAccount.account_title}
              onChange={(e) => setEditAccount({ ...editAccount, account_title: e.target.value })}
              required
            />
            <Input
              label="Account Number / IBAN / Wallet Number"
              value={editAccount.account_number}
              onChange={(e) => setEditAccount({ ...editAccount, account_number: e.target.value })}
              required
            />
            <div className="space-y-1">
              <label className="text-xs font-semibold text-navy">Instructions for Subscribers</label>
              <textarea
                value={editAccount.instructions || ""}
                onChange={(e) => setEditAccount({ ...editAccount, instructions: e.target.value })}
                rows={3}
                className="w-full text-xs text-navy p-2.5 rounded-lg border border-border bg-white placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-gold/30"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-navy">
              <input
                type="checkbox"
                checked={editAccount.is_active}
                onChange={(e) => setEditAccount({ ...editAccount, is_active: e.target.checked })}
                className="rounded border-border text-gold focus:ring-gold"
              />
              <span>Enable this payment method for checkout</span>
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" type="button" onClick={() => setEditAccount(null)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={actionLoading}>
                Save Account Details
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL: Edit Setting */}
      {editSetting && (
        <Modal
          open={!!editSetting}
          onClose={() => setEditSetting(null)}
          title={`Edit Setting: ${editSetting.key}`}
        >
          <form onSubmit={handleSaveSetting} className="space-y-4">
            <p className="text-xs text-muted">
              Enter the new value for <code className="font-mono bg-navy-50 px-1 py-0.5 rounded">{editSetting.key}</code>:
            </p>
            <Input
              label="Value"
              value={
                typeof editSetting.value === "object"
                  ? JSON.stringify(editSetting.value)
                  : String(editSetting.value)
              }
              onChange={(e) => {
                let parsed: any = e.target.value;
                if (e.target.value === "true") parsed = true;
                else if (e.target.value === "false") parsed = false;
                else if (!isNaN(Number(e.target.value)) && e.target.value.trim() !== "") parsed = Number(e.target.value);
                setEditSetting({ ...editSetting, value: parsed });
              }}
              required
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" type="button" onClick={() => setEditSetting(null)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={actionLoading}>
                Save Setting
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default function AdminPage() {
  return (
    <RouteGuard allowedRoles={["super_admin"]}>
      <AdminDashboard />
    </RouteGuard>
  );
}
