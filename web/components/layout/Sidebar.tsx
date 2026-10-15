"use client";

import Link               from "next/link";
import Image              from "next/image";
import { usePathname }    from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard, Calendar, Briefcase, Users,
  FolderOpen, Bell, CheckSquare, BellRing,
  Settings, LogOut, ChevronRight, List,
} from "lucide-react";
import { Logo }           from "@/components/shared/Logo";
import { LangSwitcher }   from "@/components/shared/LangSwitcher";
import { RoleBadge }      from "@/components/ui/Badge";
import { useAuth }        from "@/providers/AuthProvider";
import { cn }             from "@/lib/utils";
import { SIDEBAR_NAV }    from "./navItems";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard, Calendar, Briefcase, Users,
  FolderOpen, Bell, CheckSquare, BellRing, Settings, List,
};

export function Sidebar() {
  const { t }                             = useTranslation();
  const pathname                          = usePathname();
  const { profile, firm, unreadCount, reminderCount, signOut } = useAuth();

  const mainItems = SIDEBAR_NAV.filter(i => i.sidebarSection === "main");
  const moreItems = SIDEBAR_NAV.filter(i => i.sidebarSection === "more");

  function NavLink({ item }: { item: typeof SIDEBAR_NAV[0] }) {
    const Icon = ICON_MAP[item.icon];
    const isActive =
      item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
    const badge =
      item.key === "notifications" ? unreadCount :
      item.key === "reminders"     ? reminderCount : 0;

    return (
      <Link
        href={item.href}
        aria-current={isActive ? "page" : undefined}
        className={cn(
          "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150",
          isActive
            ? "bg-gold text-white"
            : "text-navy-200 hover:bg-white/10 hover:text-white"
        )}
      >
        {Icon && (
          <span className="relative flex-shrink-0">
            <Icon className={cn("w-4.5 h-4.5", isActive ? "text-white" : "text-navy-300 group-hover:text-white")} />
            {badge > 0 && (
              <span aria-hidden="true" className="absolute -top-1 -end-1 w-2 h-2 rounded-full bg-danger" />
            )}
          </span>
        )}
        <span className="flex-1 truncate">{t(`nav.${item.key}`)}</span>
        {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-50 flex-shrink-0" />}
        {badge > 0 && !isActive && (
          <span className="text-[10px] font-bold bg-danger text-white rounded-full px-1.5 py-0.5 leading-none">
            {badge > 99 ? "99+" : badge}
          </span>
        )}
      </Link>
    );
  }

  return (
    <aside className="hidden md:flex flex-col w-64 min-h-screen bg-navy fixed start-0 top-0 z-30">
      {/* Logo / firm header */}
      <div className="px-5 py-5 border-b border-white/10 flex items-center gap-3">
        {firm?.logo_url ? (
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
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5" aria-label={t("common.mainNavigation")}>
        {mainItems.map(item => <NavLink key={item.href} item={item} />)}

        <div className="pt-3 pb-1">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-navy-400 px-3 mb-1">
            {t("nav.more")}
          </p>
        </div>
        {moreItems.map(item => <NavLink key={item.href} item={item} />)}
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
                unoptimized
              />
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
        <button
          onClick={signOut}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-navy-300 hover:bg-white/10 hover:text-white transition-colors"
        >
          <LogOut className="w-4 h-4" />
          {t("auth.signOut")}
        </button>
      </div>
    </aside>
  );
}
