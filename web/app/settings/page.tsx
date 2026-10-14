"use client";

import { useTranslation } from "react-i18next";
import Link               from "next/link";
import { User, Globe, Info, ChevronRight, Scale, Tag, Shield, BellRing } from "lucide-react";
import { AppShell }       from "@/components/layout/AppShell";
import { RouteGuard }     from "@/components/shared/RouteGuard";
import { Card }           from "@/components/ui/Card";
import { LangSwitcher }   from "@/components/shared/LangSwitcher";
import { useRoleGuard }   from "@/hooks/useRoleGuard";

function SettingsPage() {
  const { t }              = useTranslation();
  const { isAdminOrAbove } = useRoleGuard();

  return (
    <AppShell pageTitle={t("settings.title")} showBack>
      <div className="max-w-xl mx-auto space-y-5">

        {/* Account */}
        <section>
          <p className="text-xs font-semibold uppercase tracking-wider text-navy-400 mb-2 px-1">
            {t("settings.account")}
          </p>
          <Card padding="none" className="divide-y divide-navy-50">
            <Link href="/profile" className="flex items-center gap-3 px-4 py-4 hover:bg-navy-50/50 transition-colors">
              <User className="w-4 h-4 text-navy-400" />
              <span className="flex-1 text-sm font-medium text-navy">{t("profile.title")}</span>
              <ChevronRight className="w-4 h-4 text-navy-300" />
            </Link>
            <Link href="/settings/notifications" className="flex items-center gap-3 px-4 py-4 hover:bg-navy-50/50 transition-colors">
              <BellRing className="w-4 h-4 text-navy-400" />
              <span className="flex-1 text-sm font-medium text-navy">Notification preferences</span>
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
              <Shield className="w-3.5 h-3.5" /> Admin Configuration
            </p>
            <Card padding="none" className="divide-y divide-navy-50">
              <Link href="/settings/case-types"
                className="flex items-center gap-3 px-4 py-4 hover:bg-navy-50/50 transition-colors">
                <Tag className="w-4 h-4 text-navy-400" />
                <span className="flex-1 text-sm font-medium text-navy">Case Types</span>
                <ChevronRight className="w-4 h-4 text-navy-300" />
              </Link>
              <Link href="/settings/courts"
                className="flex items-center gap-3 px-4 py-4 hover:bg-navy-50/50 transition-colors">
                <Scale className="w-4 h-4 text-navy-400" />
                <span className="flex-1 text-sm font-medium text-navy">Courts</span>
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

      </div>
    </AppShell>
  );
}

export default function SettingsRoute() {
  return <RouteGuard><SettingsPage /></RouteGuard>;
}
