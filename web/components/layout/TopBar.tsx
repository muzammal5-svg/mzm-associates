"use client";

import { useTranslation } from "react-i18next";
import { Bell } from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import Link from "next/link";

interface TopBarProps {
  title?: string;
}

/** Mobile-only top bar — hidden on md+ (sidebar handles branding there) */
export function TopBar({ title }: TopBarProps) {
  const { t } = useTranslation();

  return (
    <header className="md:hidden sticky top-0 z-20 bg-white border-b border-navy-50 px-4 flex items-center justify-between"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)", minHeight: "56px" }}
    >
      <Logo size="xs" variant="full" />

      {title && (
        <span className="absolute start-1/2 -translate-x-1/2 text-sm font-semibold text-navy truncate max-w-[40vw]">
          {title}
        </span>
      )}

      <Link href="/reminders" aria-label={t("nav.reminders")}
        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-navy-50 transition-colors relative"
      >
        <Bell className="w-5 h-5 text-navy" />
      </Link>
    </header>
  );
}
