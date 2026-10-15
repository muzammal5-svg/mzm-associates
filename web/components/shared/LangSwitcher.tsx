"use client";

import { useLang } from "@/providers/LangProvider";
import { useTranslation } from "react-i18next";
import { cn }      from "@/lib/utils";
import type { SupportedLang } from "@/i18n/config";

interface LangSwitcherProps {
  compact?:   boolean;   // icon-only pill
  className?: string;
}

export function LangSwitcher({ compact = false, className }: LangSwitcherProps) {
  const { t } = useTranslation();
  const { lang, setLang, languages } = useLang();

  return (
    <div
      className={cn(
        "flex rounded-lg overflow-hidden border border-navy-100",
        compact ? "w-auto" : "w-full",
        className
      )}
      role="group"
      aria-label={t("settings.language")}
    >
      {languages.map((l) => {
        const active = lang === l.code;
        return (
          <button
            key={l.code}
            onClick={() => setLang(l.code as SupportedLang)}
            aria-pressed={active}
            aria-label={l.label}
            className={cn(
              "flex-1 py-1.5 text-xs font-semibold transition-colors duration-150",
              active
                ? "bg-gold text-white"
                : "bg-white text-navy-400 hover:bg-navy-50"
            )}
          >
            {compact ? l.code.toUpperCase() : l.label}
          </button>
        );
      })}
    </div>
  );
}
