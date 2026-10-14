"use client";

import Link               from "next/link";
import Image              from "next/image";
import { useState }       from "react";
import { useTranslation } from "react-i18next";
import { Bell, ChevronDown, User, LogOut, Settings } from "lucide-react";
import { useAuth }        from "@/providers/AuthProvider";
import { LangSwitcher }   from "@/components/shared/LangSwitcher";
import { cn }             from "@/lib/utils";

interface DesktopTopBarProps {
  title?:     string;
  subtitle?:  string;
  actions?:   React.ReactNode;
}

/**
 * Desktop-only top bar rendered inside the main content area.
 * Shows page title/subtitle on left, user menu + lang switcher on right.
 */
export function DesktopTopBar({ title, subtitle, actions }: DesktopTopBarProps) {
  const { t }                             = useTranslation();
  const { profile, unreadCount, signOut } = useAuth();
  const [menuOpen, setMenuOpen]           = useState(false);

  return (
    <div className="hidden md:flex items-center justify-between gap-4 mb-6">
      {/* Page title */}
      <div>
        {title && (
          <h1 className="text-2xl font-heading font-bold text-navy leading-tight">{title}</h1>
        )}
        {subtitle && (
          <p className="text-sm text-navy-400 mt-0.5">{subtitle}</p>
        )}
      </div>

      {/* Right actions + user menu */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {actions}

        {/* Language switcher */}
        <LangSwitcher compact className="w-20" />

        {/* Notification bell */}
        <Link
          href="/notifications"
          aria-label={`${t("nav.notifications")}${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
          className="relative w-9 h-9 flex items-center justify-center rounded-xl border border-navy-100 hover:bg-navy-50 transition-colors"
        >
          <Bell className="w-4.5 h-4.5 text-navy" />
          {unreadCount > 0 && (
            <span
              aria-hidden="true"
              className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5 rounded-full bg-danger text-white text-[9px] font-bold flex items-center justify-center"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Link>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(v => !v)}
            aria-expanded={menuOpen}
            aria-haspopup="true"
            className="flex items-center gap-2 px-2 py-1.5 rounded-xl border border-navy-100 hover:bg-navy-50 transition-colors"
          >
            {profile?.photo_url ? (
              <Image src={profile.photo_url} alt={profile.full_name}
                width={28} height={28}
                className="w-7 h-7 rounded-full object-cover"
                unoptimized
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-gold/20 flex items-center justify-center">
                <span className="text-gold text-xs font-bold">
                  {profile?.full_name?.charAt(0)?.toUpperCase() ?? "?"}
                </span>
              </div>
            )}
            <span className="text-sm font-medium text-navy max-w-[100px] truncate hidden lg:block">
              {profile?.full_name ?? "User"}
            </span>
            <ChevronDown className={cn("w-3.5 h-3.5 text-navy-300 transition-transform", menuOpen && "rotate-180")} />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} aria-hidden />
              <div className="absolute right-0 top-full mt-1.5 w-48 bg-white rounded-xl shadow-modal border border-navy-50 z-50 animate-slide-down overflow-hidden">
                <Link href="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-3 text-sm text-navy hover:bg-navy-50 transition-colors"
                >
                  <User className="w-4 h-4 text-navy-300" />
                  {t("profile.title")}
                </Link>
                <Link href="/settings"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-3 text-sm text-navy hover:bg-navy-50 transition-colors"
                >
                  <Settings className="w-4 h-4 text-navy-300" />
                  {t("nav.settings")}
                </Link>
                <div className="border-t border-navy-50" />
                <button
                  onClick={() => { setMenuOpen(false); signOut(); }}
                  className="flex items-center gap-2.5 w-full px-4 py-3 text-sm text-danger hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  {t("auth.signOut")}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
