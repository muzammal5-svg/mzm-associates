"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Users,
  UserPlus,
  Shield,
  Smartphone,
  Trash2,
  Copy,
  Check,
  AlertTriangle,
  Lock,
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { RouteGuard } from "@/components/shared/RouteGuard";
import { Card } from "@/components/ui/Card";
import { Badge, RoleBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { toast } from "@/components/ui/Toast";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import { useSubscriptionAccess } from "@/hooks/useSubscriptionAccess";
import { useMutationLock } from "@/components/shared/MutatingButton";
import { generateTempPassword } from "@/lib/password";
import { saasDb, saasRpc } from "@/lib/supabase/saas";
import type { UserRole } from "@/types/supabase";

interface MemberItem {
  id: string;
  email: string | null;
  full_name: string;
  role: UserRole;
  is_owner: boolean;
  is_active: boolean;
  photo_url: string | null;
  created_at: string;
}

interface DeviceItem {
  id: string;
  device_label?: string;
  label?: string;
  device_id: string;
  last_active_at: string;
  revoked_at: string | null;
  user_id: string;
}

function MembersView() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const { state } = useSubscriptionAccess();
  const { lock, canMutate } = useMutationLock();

  const [members, setMembers] = useState<MemberItem[]>([]);
  const [devices, setDevices] = useState<DeviceItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"lawyer" | "clerk">("lawyer");
  const [tempPassword, setTempPassword] = useState("");
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isOwner =
    (profile as unknown as { is_owner?: boolean } | null)?.is_owner === true ||
    profile?.role === "super_admin";

  const loadData = useCallback(async () => {
    if (!profile?.firm_id) return;
    try {
      const [{ data: membersData }, { data: devicesData }] = await Promise.all([
        supabase
          .from("profiles")
          .select("*")
          .eq("firm_id", profile.firm_id)
          .eq("is_active", true)
          .order("created_at"),
        saasDb
          .userDevices()
          .select("*")
          .eq("firm_id", profile.firm_id)
          .order("last_active_at", { ascending: false }),
      ]);

      setMembers((membersData as unknown as MemberItem[]) || []);
      setDevices((devicesData as unknown as DeviceItem[]) || []);
    } catch (err: any) {
      console.error("Failed to load members:", err);
    } finally {
      setLoading(false);
    }
  }, [profile?.firm_id]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canMutate) return;
    if (!email.trim() || !fullName.trim()) {
      toast.error(t("common.error"));
      return;
    }

    setSubmitting(true);
    const password = generateTempPassword();

    try {
      const { data, error } = await supabase.functions.invoke("create-member", {
        body: { email: email.trim(), full_name: fullName.trim(), role, temp_password: password },
      });

      if (error) throw error;

      setTempPassword(password);
      setEmail("");
      setFullName("");
      toast.success(t("members.memberAdded"));
      void loadData();
    } catch (err: any) {
      console.error("Error creating member:", err);
      toast.error(err.message || t("common.error"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveMember = async (userId: string, memberName: string) => {
    if (!canMutate) return;
    if (!window.confirm(`${t("members.removeConfirm")} (${memberName})`)) return;

    try {
      const { error } = await saasRpc.removeMember(userId);
      if (error) throw error;
      toast.success(t("members.memberRemoved"));
      void loadData();
    } catch (err: any) {
      toast.error(err.message || t("common.error"));
    }
  };

  const handleRevokeDevice = async (deviceId: string) => {
    if (!canMutate) return;
    try {
      const { error } = await saasRpc.revokeDevice(deviceId);
      if (error) throw error;
      toast.success(t("members.deviceRevoked"));
      void loadData();
    } catch (err: any) {
      toast.error(err.message || t("common.error"));
    }
  };

  const handleCopyPassword = () => {
    if (!tempPassword) return;
    navigator.clipboard.writeText(tempPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
    toast.success(t("members.copied"));
  };

  if (!isOwner) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <Card className="p-8 text-center bg-white space-y-3">
          <Lock className="w-8 h-8 text-muted mx-auto" />
          <h2 className="text-lg font-heading font-bold text-navy">{t("members.title")}</h2>
          <p className="text-sm text-muted">{t("members.ownerOnly")}</p>
        </Card>
      </div>
    );
  }

  const seatsUsed = state?.seats_used ?? members.length;
  const seatsMax = state?.seats_max ?? 5;
  const seatsPct = Math.min(Math.round((seatsUsed / seatsMax) * 100), 100);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Seat Utilization Bar */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-gold" />
            <h3 className="font-heading font-bold text-navy text-base">
              {t("members.seatsUsed", { used: seatsUsed, max: seatsMax })}
            </h3>
          </div>
          <Badge variant={seatsUsed >= seatsMax ? "danger" : "gold"} size="sm">
            {seatsMax - seatsUsed} remaining
          </Badge>
        </div>

        <div className="w-full bg-navy-50 rounded-full h-2.5 mt-4 overflow-hidden">
          <div
            className={`h-2.5 rounded-full transition-all duration-300 ${
              seatsUsed >= seatsMax ? "bg-danger" : "bg-gold"
            }`}
            style={{ width: `${seatsPct}%` }}
          />
        </div>
      </Card>

      {/* Add New Member Form */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-navy" />
          <h3 className="font-heading font-bold text-navy text-base">{t("members.addMember")}</h3>
        </div>

        <form onSubmit={handleAddMember} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label={t("members.fullName")}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Advocate Tariq Mehmood"
              required
            />
            <Input
              label={t("members.email")}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="lawyer@firm.pk"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-navy">{t("members.role")}</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "lawyer" | "clerk")}
              className="w-full text-xs p-2.5 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-gold/30"
            >
              <option value="lawyer">{t("members.lawyer")}</option>
              <option value="clerk">{t("members.clerk")}</option>
            </select>
          </div>

          <Button
            type="submit"
            variant="primary"
            disabled={submitting || seatsUsed >= seatsMax || !canMutate}
            {...lock}
            className="w-full"
          >
            {submitting ? t("common.loading") : t("members.addMember")}
          </Button>
        </form>

        {/* Temporary Password Reveal Box */}
        {tempPassword && (
          <div className="p-4 rounded-xl border border-success/30 bg-success/5 space-y-2 mt-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-success flex items-center gap-1.5">
                <Check className="w-4 h-4" />
                {t("members.tempPassword")}
              </span>
              <Button
                variant="ghost"
                size="xs"
                onClick={handleCopyPassword}
                className="text-xs text-navy"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-success me-1" /> : <Copy className="w-3.5 h-3.5 me-1" />}
                {copied ? t("members.copied") : t("members.copyPassword")}
              </Button>
            </div>
            <p className="font-mono text-sm font-bold text-navy bg-white p-2.5 rounded-lg border border-border tracking-wider select-all">
              {tempPassword}
            </p>
            <p className="text-[11px] text-muted">
              Share this password securely with your colleague. They will be prompted to set a permanent password upon first login.
            </p>
            <div className="flex items-start gap-1.5 mt-1 p-2.5 rounded-lg bg-warning/10 border border-warning/30">
              <AlertTriangle className="w-3.5 h-3.5 text-warning shrink-0 mt-0.5" />
              <p className="text-[11px] text-warning font-medium leading-relaxed">
                <span className="font-bold">⚠️ Security notice:</span> Share this password privately (e.g. WhatsApp direct message). Do not email it or post it in group chats. The member must change it on first login.
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* Firm Members List */}
      <Card className="p-6 space-y-4">
        <h3 className="font-heading font-bold text-navy text-base">{t("members.teamList")}</h3>
        {loading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-14 rounded-xl" />
            ))}
          </div>
        ) : members.length === 0 ? (
          <p className="text-xs text-muted text-center py-4">{t("members.noMembers")}</p>
        ) : (
          <div className="divide-y divide-border">
            {members.map((m) => {
              const isCurrentUser = m.id === profile?.id;
              return (
                <div key={m.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-navy/10 text-navy font-bold text-xs flex items-center justify-center shrink-0">
                      {m.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm text-navy truncate">{m.full_name}</span>
                        {m.is_owner && (
                          <Badge variant="gold" size="sm">Owner</Badge>
                        )}
                        <RoleBadge role={m.role} />
                      </div>
                      <span className="text-xs text-muted block truncate">{m.email}</span>
                    </div>
                  </div>

                  {!isCurrentUser && !m.is_owner && (
                    <Button
                      variant="ghost"
                      size="xs"
                      disabled={!canMutate}
                      {...lock}
                      onClick={() => handleRemoveMember(m.id, m.full_name)}
                      className="text-danger hover:bg-danger/10"
                      title={t("members.removeMember")}
                    >
                      <Trash2 className="w-3.5 h-3.5 me-1" />
                      {t("members.remove")}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Authorized Devices */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-navy" />
          <h3 className="font-heading font-bold text-navy text-base">{t("members.devices")}</h3>
        </div>

        {devices.length === 0 ? (
          <p className="text-xs text-muted text-center py-4">{t("members.noDevices")}</p>
        ) : (
          <div className="divide-y divide-border">
            {devices.map((d) => {
              const isRevoked = !!d.revoked_at;
              const label = d.device_label || d.label || "Authorized Browser / Mobile App";
              return (
                <div key={d.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold ${isRevoked ? "text-muted line-through" : "text-navy"}`}>
                        {label}
                      </span>
                      {isRevoked ? (
                        <Badge variant="neutral" size="sm">{t("members.revoked")}</Badge>
                      ) : (
                        <Badge variant="success" size="sm">Active</Badge>
                      )}
                    </div>
                    <span className="text-[10px] text-muted block mt-0.5">
                      Last Active: {new Date(d.last_active_at).toLocaleString()}
                    </span>
                  </div>

                  {!isRevoked && (
                    <Button
                      variant="secondary"
                      size="xs"
                      disabled={!canMutate}
                      {...lock}
                      onClick={() => handleRevokeDevice(d.id)}
                      className="text-xs"
                    >
                      {t("members.revoke")}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

export default function MembersPage() {
  const { t } = useTranslation();
  return (
    <RouteGuard allowedRoles={["admin", "super_admin"]}>
      <AppShell pageTitle={t("members.title")} showBack>
        <MembersView />
      </AppShell>
    </RouteGuard>
  );
}
