"use client";

import Link               from "next/link";
import Image              from "next/image";
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Bell, ChevronDown, User, LogOut, Settings, Search, CreditCard } from "lucide-react";
import { useAuth }        from "@/providers/AuthProvider";
import { LangSwitcher }   from "@/components/shared/LangSwitcher";
import { cn }             from "@/lib/utils";

interface DesktopTopBarProps {
  title?:     string;
  subtitle?:  string;
  actions?:   React.ReactNode;
}

/**
 * Desktop-only top bar with dark theme
 */
export function DesktopTopBar({ title, subtitle, actions }: DesktopTopBarProps) {
  const { t }                             = useTranslation();
  const { profile, firm, unreadCount, signOut } = useAuth();
  const [menuOpen, setMenuOpen]           = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const menuRef                           = useRef<HTMLDivElement>(null);

  // Close dropdown on Escape key
  useEffect(() => {
    if (!menuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);

  return (
    <div className="hidden md:block sticky top-0 z-30 mb-6 transition-all duration-300">
      {/* Top bar with breadcrumb, search, and user menu */}
      <div className="bg-white/90 backdrop-blur-md border border-border shadow-xs rounded-xl">
        <div className="flex items-center justify-between gap-4 px-6 py-3.5">
          {/* Left: Title and Breadcrumb */}
          <div className="min-w-0">
            {title && (
              <h1 className="text-xl font-heading font-bold text-navy leading-tight">{title}</h1>
            )}
            {subtitle && (
              <p className="text-sm text-navy-500 mt-0.5">{subtitle}</p>
            )}
          </div>

          {/* Center: Search bar */}
          <div className="flex-1 max-w-xs mx-4">
            <div className={cn(
              "relative flex items-center px-3.5 py-1.5 bg-navy-50/60 border border-border rounded-lg transition-all duration-200",
              searchFocused ? "border-gold bg-white shadow-xs ring-2 ring-gold/20" : "hover:bg-navy-50"
            )}>
              <Search className="w-4 h-4 text-navy-400 flex-shrink-0" />
              <input
                type="text"
                placeholder={t("common.search") || "Search..."}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="flex-1 ms-2 bg-transparent text-navy placeholder:text-navy-400 focus:outline-none text-sm"
              />
            </div>
          </div>

          {/* Right: Actions and user menu */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {actions}

            {/* Language switcher */}
            <LangSwitcher compact className="w-20" />

            {/* Notification bell */}
            <Link
              href="/notifications"
              aria-label={`${t("nav.notifications")}${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
              className="relative w-9 h-9 flex items-center justify-center rounded-lg bg-white hover:bg-navy-50 border border-border transition-all duration-200 group"
            >
              <Bell className="w-4.5 h-4.5 text-navy-700 group-hover:text-gold transition-colors" />
              {unreadCount > 0 && (
                <span
                  aria-hidden="true"
                  className="absolute -top-1 -end-1 min-w-[18px] h-4.5 px-1 rounded-full bg-danger text-white text-[9px] font-bold flex items-center justify-center"
                >
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Link>

            {/* User menu */}
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen(v => !v)}
                aria-expanded={menuOpen}
                aria-haspopup="true"
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-200",
                  menuOpen
                    ? "bg-navy-50 border-gold/60 ring-2 ring-gold/20"
                    : "bg-white border-border hover:bg-navy-50"
                )}
              >
                {profile?.photo_url ? (
                  <Image src={profile.photo_url} alt={profile.full_name}
                    width={32} height={32}
                    className="w-7 h-7 rounded-full object-cover border border-border"
                    unoptimized
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center">
                    <span className="text-gold text-xs font-bold">
                      {profile?.full_name?.charAt(0)?.toUpperCase() ?? "?"}
                    </span>
                  </div>
                )}
                <span className="text-sm font-semibold text-navy max-w-[140px] truncate hidden lg:block">
                  {profile?.full_name ?? "User"}
                </span>
                <ChevronDown className={cn(
                  "w-4 h-4 text-navy-400 transition-transform duration-200",
                  menuOpen && "rotate-180"
                )} />
              </button>

              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setMenuOpen(false)}
                    aria-hidden="true"
                  />
                  <div className="absolute end-0 top-full mt-2 w-56 bg-white border border-border rounded-xl shadow-xl z-50 animate-slide-down overflow-hidden">
                    {/* User & Firm info banner */}
                    <div className="px-4 py-3 border-b border-border bg-navy-50/50">
                      <p className="text-xs font-bold text-navy truncate">
                        {profile?.full_name ?? "User"}
                      </p>
                      {firm?.name && (
                        <p className="text-[11px] text-navy-600 font-medium truncate mt-0.5">
                          {firm.name}
                        </p>
                      )}
                      {profile?.email && (
                        <p className="text-[10px] text-navy-400 truncate mt-0.5">
                          {profile.email}
                        </p>
                      )}
                    </div>

                    <div className="p-1">
                      <Link href="/profile"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 text-sm text-navy-700 hover:bg-navy-50 hover:text-navy rounded-lg transition-colors"
                      >
                        <User className="w-4 h-4 text-navy-400" />
                        <span>{t("profile.title")}</span>
                      </Link>
                      <Link href="/settings"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 text-sm text-navy-700 hover:bg-navy-50 hover:text-navy rounded-lg transition-colors"
                      >
                        <Settings className="w-4 h-4 text-navy-400" />
                        <span>{t("nav.settings")}</span>
                      </Link>
                      <Link href="/billing"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 text-sm text-navy-700 hover:bg-navy-50 hover:text-navy rounded-lg transition-colors"
                      >
                        <CreditCard className="w-4 h-4 text-navy-400" />
                        <span>{t("billing.title") || "Billing"}</span>
                      </Link>
                    </div>

                    <div className="border-t border-border p-1">
                      <button
                        onClick={() => { setMenuOpen(false); signOut(); }}
                        className="flex items-center gap-3 w-full px-3 py-2 text-sm text-danger hover:bg-red-50 rounded-lg transition-colors font-medium text-start"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{t("auth.signOut")}</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
