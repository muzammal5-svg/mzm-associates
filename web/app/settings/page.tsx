"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import {
  User,
  Globe,
  Info,
  ChevronRight,
  Scale,
  Tag,
  Shield,
  BellRing,
  AlertTriangle,
  Trash2,
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { RouteGuard } from "@/components/shared/RouteGuard";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { toast } from "@/components/ui/Toast";
import { LangSwitcher } from "@/components/shared/LangSwitcher";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { useAuth } from "@/providers/AuthProvider";
import { saasRpc } from "@/lib/supabase/saas";

function SettingsPage() {
  const { t } = useTranslation();
  const { isAdminOrAbove } = useRoleGuard();
  const { signOut } = useAuth();
  const router = useRouter();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (deleteInput !== "DELETE") return;
    setIsDeleting(true);
    try {
      const { error } = await saasRpc.deleteOwnAccount();
      if (error) throw error;
      toast.success(t("settings.deleteSuccess"));
      await signOut();
      router.replace("/");
    } catch (err: any) {
      toast.error(err.message || t("common.error"));
      setIsDeleting(false);
    }
  };

  return (
    <AppShell pageTitle={t("settings.title")} showBack>
      <div className="max-w-xl mx-auto space-y-5">
        {/* Account */}
        <section>
          <p className="text-xs font-semibold uppercase tracking-wider text-navy-400 mb-2 px-1">
            {t("settings.account")}
          </p>
          <Card padding="none" className="divide-y divide-navy-50">
            <Link
              href="/profile"
              className="flex items-center gap-3 px-4 py-4 hover:bg-navy-50/50 transition-colors"
            >
              <User className="w-4 h-4 text-navy-400" />
              <span className="flex-1 text-sm font-medium text-navy">{t("profile.title")}</span>
              <ChevronRight className="w-4 h-4 text-navy-300" />
            </Link>
            <Link
              href="/settings/notifications"
              className="flex items-center gap-3 px-4 py-4 hover:bg-navy-50/50 transition-colors"
            >
              <BellRing className="w-4 h-4 text-navy-400" />
              <span className="flex-1 text-sm font-medium text-navy">
                {t("settings.notificationPreferences")}
              </span>
              <ChevronRight className="w-4 h-4 text-navy-300" />
            </Link>
          </Card>
        </section>

        {/* Language */}
        <section>
          <p className="text-xs font-semibold uppercase tracking-wider text-navy-400 mb-2 px-1 flex items-center gap-1">
            <Globe className="w-3.5 h-3.5" /> {t("settings.language")}
          </p>
          <LangSwitcher />
        </section>

        {/* Admin config */}
        {isAdminOrAbove && (
          <section>
            <p className="text-xs font-semibold uppercase tracking-wider text-navy-400 mb-2 px-1 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" /> {t("settings.adminConfig")}
            </p>
            <Card padding="none" className="divide-y divide-navy-50">
              <Link
                href="/settings/case-types"
                className="flex items-center gap-3 px-4 py-4 hover:bg-navy-50/50 transition-colors"
              >
                <Tag className="w-4 h-4 text-navy-400" />
                <span className="flex-1 text-sm font-medium text-navy">{t("common.caseTypes")}</span>
                <ChevronRight className="w-4 h-4 text-navy-300" />
              </Link>
              <Link
                href="/settings/courts"
                className="flex items-center gap-3 px-4 py-4 hover:bg-navy-50/50 transition-colors"
              >
                <Scale className="w-4 h-4 text-navy-400" />
                <span className="flex-1 text-sm font-medium text-navy">{t("common.courts")}</span>
                <ChevronRight className="w-4 h-4 text-navy-300" />
              </Link>
            </Card>
          </section>
        )}

        {/* About */}
        <section>
          <p className="text-xs font-semibold uppercase tracking-wider text-navy-400 mb-2 px-1 flex items-center gap-1">
            <Info className="w-3.5 h-3.5" /> {t("settings.about")}
          </p>
          <Card>
            <p className="text-sm text-navy font-medium">MZM & Associates</p>
            <p className="text-xs text-navy-400 mt-0.5">Case Management System v1.0.0</p>
            <p className="text-xs text-navy-300 mt-2">Next.js 14 · Supabase · Capacitor</p>
          </Card>
        </section>

        {/* Danger Zone: Google Play Account Deletion */}
        <section className="pt-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-danger mb-2 px-1 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" /> {t("settings.dangerZone")}
          </p>
          <Card className="border border-danger/30 bg-danger/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-danger">{t("settings.deleteAccount")}</p>
              <p className="text-xs text-muted mt-0.5">{t("settings.deleteAccountDesc")}</p>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowDeleteModal(true)}
              className="text-xs shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5 me-1" />
              {t("settings.deleteAccount")}
            </Button>
          </Card>
        </section>
      </div>

      {/* Account Deletion Confirmation Modal */}
      {showDeleteModal && (
        <Modal
          open={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setDeleteInput("");
          }}
          title={t("settings.deleteConfirmTitle")}
        >
          <div className="space-y-4">
            <p className="text-xs text-muted leading-relaxed">
              {t("settings.deleteConfirmWarning")}
            </p>
            <Input
              label={t("settings.deleteConfirmPrompt")}
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              placeholder="DELETE"
              required
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="secondary"
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteInput("");
                }}
              >
                {t("common.cancel")}
              </Button>
              <Button
                variant="danger"
                disabled={deleteInput !== "DELETE" || isDeleting}
                onClick={handleDeleteAccount}
              >
                {isDeleting ? t("common.loading") : t("settings.deleteButton")}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </AppShell>
  );
}

export default function SettingsRoute() {
  return (
    <RouteGuard>
      <SettingsPage />
    </RouteGuard>
  );
}
