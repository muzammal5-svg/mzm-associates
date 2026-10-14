"use client";

import Link               from "next/link";
import { usePathname }    from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  Home, Briefcase, Users, Bell, MoreHorizontal,
} from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { cn }      from "@/lib/utils";
import { BOTTOM_NAV } from "./navItems";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Home, Briefcase, Users, Bell, MoreHorizontal,
};

export function BottomNav() {
  const { t }                   = useTranslation();
  const pathname                = usePathname();
  const { unreadCount, reminderCount } = useAuth();

  return (
    <nav
      className="md:hidden fixed bottom-0 start-0 end-0 z-30 bg-white border-t border-navy-50 shadow-navbar"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      aria-label={t("nav.home")}
    >
      <div className="flex">
        {BOTTOM_NAV.map((item) => {
          const Icon     = ICON_MAP[item.icon];
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          // Notification badge: show on Bell (reminders) and More
          const badge =
            item.key === "reminders" ? reminderCount :
            item.key === "more"      ? unreadCount : 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-0.5",
                "min-h-[56px] py-2 text-[10px] font-medium transition-colors",
                isActive ? "text-gold" : "text-navy-300"
              )}
            >
              <span className="relative">
                {Icon && (
                  <Icon className={cn("w-[22px] h-[22px]", isActive ? "text-gold" : "text-navy-300")} />
                )}
                {badge > 0 && (
                  <span
                    aria-hidden="true"
                    className="absolute -top-1 -end-1.5 min-w-[14px] h-3.5 px-0.5 rounded-full bg-danger text-white text-[9px] font-bold flex items-center justify-center leading-none"
                  >
                    {badge > 9 ? "9+" : badge}
                  </span>
                )}
              </span>
              <span className="leading-none truncate max-w-[58px] text-center">
                {t(`nav.${item.key}`)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
