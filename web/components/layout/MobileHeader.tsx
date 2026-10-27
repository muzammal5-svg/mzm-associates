"use client";

import Link               from "next/link";
import Image              from "next/image";
import { useState }       from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Bell, Menu, X, ChevronRight, ShieldCheck, LogOut, Phone } from "lucide-react";
import { useRouter }      from "next/navigation";
import { usePathname }    from "next/navigation";
import { useAuth }        from "@/providers/AuthProvider";
import { Logo }           from "@/components/shared/Logo";
import { RoleBadge }      from "@/components/ui/Badge";
import { LangSwitcher }   from "@/components/shared/LangSwitcher";
import { cn }             from "@/lib/utils";
import { SITE, phoneLink } from "@/lib/siteConfig";
import { SIDEBAR_NAV }    from "./navItems";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard: Menu, Calendar: Menu, Briefcase: Menu, Users: Menu,
  FolderOpen: Menu, Bell: Menu, CheckSquare: Menu, BellRing: Menu,
  Settings: Menu, List: Menu, FileText: Menu, BookOpen: Menu,
};

interface MobileHeaderProps {
  title?:     string;
  showBack?:  boolean;
  actions?:   React.ReactNode;
  className?: string;
}

export function MobileHeader({ title, showBack, actions, className }: MobileHeaderProps) {
  const { t }                           = useTranslation();
  const { profile, firm, unreadCount, signOut } = useAuth();
  const router                          = useRouter();
  const pathname                        = usePathname();
  const [menuOpen, setMenuOpen]         = useState(false);

  const mainItems = SIDEBAR_NAV.filter(i => i.sidebarSection === "main");
  const moreItems = SIDEBAR_NAV.filter(i => i.sidebarSection === "more");

  return (
    <>
      {/* Mobile navigation drawer */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-45 bg-black/95"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />
          <aside
            className="fixed inset-y-0 start-0 z-50 w-[80%] max-w-xs bg-navy flex flex-col"
            aria-label={t("common.mainNavigation")}
          >
            {/* Drawer header */}
            <div className="px-5 py-5 border-b border-white/10 flex items-center gap-3">
              {profile?.photo_url ? (
                <Image src={profile.photo_url} alt={profile.full_name} width={36} height={36}
                  className="rounded-full object-cover flex-shrink-0 border border-white/10" unoptimized />
              ) : firm?.logo_url ? (
                <Image src={firm.logo_url} alt={firm.name} width={36} height={36}
                  className="rounded-lg object-contain flex-shrink-0" unoptimized />
              ) : (
                <Logo size="xs" variant="mark" />
              )}
              <div className="min-w-0">
                <p className="text-white text-sm font-heading font-bold truncate leading-tight">
                  {firm?.name ?? "MZM & Associates"}
                </p>
                <p className="text-navy-300 text-[10px] truncate">{t("nav.dashboard")}</p>
              </div>
              <button
                onClick={() => setMenuOpen(false)}
                className="ml-auto w-8 h-8 flex items-center justify-center rounded hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Main nav */}
            <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
              {mainItems.map(item => {
                const Icon = ICON_MAP[item.icon] || Menu;
                const isActive =
                  item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150",
                      isActive
                        ? "bg-gold/15 text-gold border-s-2 border-gold"
                        : "text-navy-200 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <Icon className="w-4.5 h-4.5 text-navy-300 group-hover:text-white flex-shrink-0" />
                    <span className="flex-1 truncate">{t(`nav.${item.key}`)}</span>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-50 flex-shrink-0" />}
                  </Link>
                );
              })}

              <div className="pt-3 pb-1">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-navy-400 px-3 mb-1">
                  {t("nav.more")}
                </p>
              </div>
              {moreItems.map(item => {
                const Icon = ICON_MAP[item.icon] || Menu;
                const isActive =
                  item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150",
                      isActive
                        ? "bg-gold/15 text-gold border-s-2 border-gold"
                        : "text-navy-200 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <Icon className="w-4.5 h-4.5 text-navy-300 group-hover:text-white flex-shrink-0" />
                    <span className="flex-1 truncate">{t(`nav.${item.key}`)}</span>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-50 flex-shrink-0" />}
                  </Link>
                );
              })}

              {profile?.role === "super_admin" && (
                <div className="pt-2">
                  <Link
                    href="/admin"
                    onClick={() => setMenuOpen(false)}
                    className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-150 bg-gold/15 text-gold border border-gold/30 hover:bg-gold/25"
                  >
                    <ShieldCheck className="w-4 h-4 text-gold" />
                    <span className="flex-1 truncate">Admin Control</span>
                  </Link>
                </div>
              )}
            </nav>

            {/* Language switcher */}
            <div className="px-3 pb-2">
              <LangSwitcher compact className="w-full" />
            </div>

            {/* User footer */}
            <div className="px-3 pb-4 border-t border-white/10 pt-3 space-y-1">
              {profile && (
                <Link href="/profile"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 transition-colors group"
                >
                  {profile.photo_url ? (
                    <Image src={profile.photo_url} alt={profile.full_name}
                      width={32} height={32}
                      className="w-8 h-8 rounded-full object-cover border border-white/20 flex-shrink-0"
                      unoptimized />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center flex-shrink-0">
                      <span className="text-gold text-sm font-bold leading-none">
                        {profile.full_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate leading-tight group-hover:text-gold transition-colors">
                      {profile.full_name}
                    </p>
                    <RoleBadge role={profile.role} />
                  </div>
                </Link>
              )}
              <div className="px-3 pt-3 space-y-2">
                <a
                  href={phoneLink()}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-navy-100 text-sm font-medium text-navy hover:bg-navy-50 hover:text-gold transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span>{SITE.phone}</span>
                </a>
              </div>
              <button
                onClick={() => { setMenuOpen(false); signOut(); }}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-navy-300 hover:bg-white/10 hover:text-white transition-colors"
              >
                <LogOut className="w-4 h-4" />
                {t("auth.signOut")}
              </button>
            </div>
          </aside>
        </>
      )}

      {/* Mobile header bar */}
      <header
        className={cn(
          "md:hidden sticky top-0 z-20 bg-white border-b border-navy-50",
          "flex items-center gap-2 px-4",
          className
        )}
        style={{ minHeight: 56, paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        {/* Left: burger menu */}
        <button
          onClick={() => setMenuOpen(true)}
          aria-label={t("common.mainNavigation")}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-navy-50 transition-colors text-navy"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Centre: logo / back */}
        <div className="flex items-center min-w-[40px] flex-1">
          {showBack ? (
            <button
              onClick={() => router.back()}
              aria-label={t("common.back")}
              className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-navy-50 transition-colors -ms-1"
            >
              <ArrowLeft className="w-5 h-5 text-navy" />
            </button>
          ) : (
            /* Firm logo if available, else MZM mark */
            firm?.logo_url ? (
              <Image
                src={firm.logo_url}
                alt={firm.name}
                width={32} height={32}
                className="rounded-md object-contain"
                unoptimized
              />
            ) : (
              <Logo size="xs" variant="mark" />
            )
          )}
        </div>

        {/* Centre: title or firm name */}
        <div className="flex-1 min-w-0 text-center">
          {title ? (
            <span className="text-sm font-semibold text-navy truncate block">{title}</span>
          ) : (
            <div className="flex flex-col items-center leading-tight">
              <span className="text-sm font-heading font-bold text-navy truncate">
                {firm?.name ?? "MZM & Associates"}
              </span>
              {profile && (
                <span className="text-[10px] text-navy-300 truncate">
                  {profile.full_name}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Right: custom actions OR notification bell */}
        <div className="flex items-center gap-1 min-w-[40px] justify-end">
          {actions ?? (
            <Link
              href="/notifications"
              aria-label={`${t("nav.notifications")}${unreadCount > 0 ? ` (${unreadCount})` : ""}`}
              className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-navy-50 transition-colors"
            >
              <Bell className="w-5 h-5 text-navy" />
              {unreadCount > 0 && (
                <span
                  aria-hidden="true"
                  className="absolute top-1 end-1 min-w-[16px] h-4 px-0.5 rounded-full bg-danger text-white text-[10px] font-bold flex items-center justify-center leading-none"
                >
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Link>
          )}

          {/* Profile avatar */}
          <Link
            href="/profile"
            aria-label={t("profile.title")}
            className="w-9 h-9 rounded-full overflow-hidden border-2 border-navy-100 hover:border-gold transition-colors flex-shrink-0"
          >
            {profile?.photo_url ? (
              <Image
                src={profile.photo_url}
                alt={profile.full_name}
                width={36} height={36}
                className="object-cover w-full h-full"
                unoptimized
              />
            ) : (
              <div className="w-full h-full bg-gold/20 flex items-center justify-center">
                <span className="text-gold text-sm font-bold leading-none">
                  {profile?.full_name?.charAt(0)?.toUpperCase() ?? "?"}
                </span>
              </div>
            )}
          </Link>
        </div>
      </header>
    </>
  );
}
