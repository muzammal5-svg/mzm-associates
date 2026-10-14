"use client";

import Link               from "next/link";
import Image              from "next/image";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Bell }from "lucide-react";
import { useRouter }      from "next/navigation";
import { useAuth }        from "@/providers/AuthProvider";
import { Logo }           from "@/components/shared/Logo";
import { cn }             from "@/lib/utils";

interface MobileHeaderProps {
  title?:     string;
  showBack?:  boolean;
  actions?:   React.ReactNode;
  className?: string;
}

export function MobileHeader({ title, showBack, actions, className }: MobileHeaderProps) {
  const { t }                        = useTranslation();
  const { profile, firm, unreadCount } = useAuth();
  const router                       = useRouter();

  return (
    <header
      className={cn(
        "md:hidden sticky top-0 z-20 bg-white border-b border-navy-50",
        "flex items-center gap-2 px-4",
        className
      )}
      style={{ minHeight: 56, paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      {/* Left: back or logo */}
      <div className="flex items-center min-w-[40px]">
        {showBack ? (
          <button
            onClick={() => router.back()}
            aria-label={t("common.back")}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-navy-50 transition-colors -ml-1"
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
                className="absolute top-1 right-1 min-w-[16px] h-4 px-0.5 rounded-full bg-danger text-white text-[10px] font-bold flex items-center justify-center leading-none"
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
  );
}
