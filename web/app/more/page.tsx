"use client";

import Link               from "next/link";
import Image              from "next/image";
import { useTranslation } from "react-i18next";
import {
  CheckSquare, BellRing, Settings, HelpCircle,
  LogOut, ChevronRight, User,
} from "lucide-react";
import { AppShell }    from "@/components/layout/AppShell";
import { RouteGuard }  from "@/components/shared/RouteGuard";
import { Card }        from "@/components/ui/Card";
import { Badge }       from "@/components/ui/Badge";
import { RoleBadge }   from "@/components/ui/Badge";
import { LangSwitcher } from "@/components/shared/LangSwitcher";
import { useAuth }     from "@/providers/AuthProvider";
import { ConfirmDialog } from "@/components/ui/Modal";
import { useState }    from "react";

interface MenuItem {
  label:   string;
  href?:   string;
  icon:    React.ComponentType<{ className?: string }>;
  badge?:  number;
  danger?: boolean;
  action?: () => void;
}

function MorePage() {
  const { t }                             = useTranslation();
  const { profile, unreadCount, signOut } = useAuth();
  const [confirmLogout, setConfirmLogout] = useState(false);

  const menuItems: MenuItem[] = [
    {
      label: t("more.decidedCases"),
      href:  "/cases/decided",
      icon:  CheckSquare,
    },
    {
      label: t("more.notifications"),
      href:  "/notifications",
      icon:  BellRing,
      badge: unreadCount,
    },
    {
      label: t("more.settings"),
      href:  "/settings",
      icon:  Settings,
    },
    {
      label: t("more.help"),
      href:  "/help",
      icon:  HelpCircle,
    },
  ];

  return (
    <AppShell pageTitle={t("more.title")}>
      <div className="space-y-5 max-w-md mx-auto md:mx-0">

        {/* ── Profile card ── */}
        <Link href="/profile">
          <Card hover className="flex items-center gap-4">
            {profile?.photo_url ? (
              <Image
                src={profile.photo_url}
                alt={profile.full_name}
                width={52} height={52}
                className="w-13 h-13 rounded-full object-cover border-2 border-navy-50 flex-shrink-0"
                unoptimized
              />
            ) : (
              <div className="w-13 h-13 rounded-full bg-gold/15 border-2 border-gold/30 flex items-center justify-center flex-shrink-0">
                <span className="text-gold text-xl font-bold leading-none">
                  {profile?.full_name?.charAt(0)?.toUpperCase() ?? "?"}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-navy truncate">{profile?.full_name ?? "—"}</p>
              <p className="text-xs text-navy-400 truncate">{profile?.email ?? ""}</p>
              {profile?.role && <RoleBadge role={profile.role} className="mt-1" />}
            </div>
            <div className="flex items-center gap-1 text-navy-300 flex-shrink-0">
              <User className="w-4 h-4" />
              <ChevronRight className="w-4 h-4" />
            </div>
          </Card>
        </Link>

        {/* ── Menu items ── */}
        <Card padding="none" className="divide-y divide-navy-50 overflow-hidden">
          {menuItems.map((item) => {
            const Inner = (
              <div className="flex items-center gap-3.5 px-4 py-4">
                <div className="w-8 h-8 rounded-lg bg-navy-50 flex items-center justify-center flex-shrink-0">
                  <item.icon className={`w-4 h-4 ${item.danger ? "text-danger" : "text-navy-400"}`} />
                </div>
                <span className={`flex-1 text-sm font-medium ${item.danger ? "text-danger" : "text-navy"}`}>
                  {item.label}
                </span>
                {item.badge && item.badge > 0 ? (
                  <Badge variant="danger" size="sm">{item.badge > 99 ? "99+" : item.badge}</Badge>
                ) : (
                  <ChevronRight className="w-4 h-4 text-navy-300" />
                )}
              </div>
            );
            return item.href ? (
              <Link key={item.label} href={item.href} className="block hover:bg-navy-50/50 transition-colors active:bg-navy-50">
                {Inner}
              </Link>
            ) : (
              <button key={item.label} onClick={item.action} className="w-full hover:bg-navy-50/50 transition-colors active:bg-navy-50 text-left">
                {Inner}
              </button>
            );
          })}
        </Card>

        {/* ── Language switcher ── */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-navy-400 mb-2 px-1">
            {t("settings.language")}
          </p>
          <LangSwitcher className="w-full" />
        </div>

        {/* ── Logout ── */}
        <button
          onClick={() => setConfirmLogout(true)}
          className="w-full flex items-center gap-3.5 px-4 py-4 bg-white rounded-xl border border-navy-50 shadow-card hover:bg-red-50 transition-colors active:bg-red-100"
        >
          <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
            <LogOut className="w-4 h-4 text-danger" />
          </div>
          <span className="text-sm font-medium text-danger">{t("more.logout")}</span>
        </button>

        {/* ── Version ── */}
        <p className="text-xs text-center text-navy-300 pb-2">
          {t("more.version", { version: "1.0.0" })}
        </p>
      </div>

      <ConfirmDialog
        open={confirmLogout}
        onClose={() => setConfirmLogout(false)}
        onConfirm={signOut}
        title={t("more.logout")}
        message={t("common.confirm")}
        confirmLabel={t("more.logout")}
        confirmVariant="danger"
      />
    </AppShell>
  );
}

export default function MorePageRoute() {
  return <RouteGuard><MorePage /></RouteGuard>;
}
