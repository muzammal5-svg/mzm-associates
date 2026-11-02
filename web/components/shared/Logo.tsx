"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface LogoProps {
  size?: "xs" | "sm" | "md" | "lg";
  variant?: "full" | "mark";
  className?: string;
  inverted?: boolean;
}

const sizeMap = {
  xs: { dim: 32, mark: "w-8 h-8 rounded-lg", text: "text-sm", sub: "text-[9px]" },
  sm: { dim: 40, mark: "w-10 h-10 rounded-xl", text: "text-base", sub: "text-[10px]" },
  md: { dim: 48, mark: "w-12 h-12 rounded-xl", text: "text-xl", sub: "text-xs" },
  lg: { dim: 64, mark: "w-16 h-16 rounded-2xl", text: "text-2xl", sub: "text-xs" },
};

export function Logo({ size = "md", variant = "full", className, inverted = false }: LogoProps) {
  const { t } = useTranslation();
  const s = sizeMap[size];
  const isLightText = inverted || className?.includes("text-white") || className?.includes("text-slate-100");

  if (variant === "mark") {
    return (
      <div data-variant={variant} className={cn("inline-flex items-center select-none flex-shrink-0", className)}>
        <Image
          src="/logo/app-icon.png"
          alt={t("brand.name") || "MZM & Associates"}
          width={s.dim}
          height={s.dim}
          className={cn("object-cover shadow-sm flex-shrink-0", s.mark)}
          priority={size === "lg"}
        />
      </div>
    );
  }

  return (
    <div data-variant={variant} className={cn("inline-flex items-center gap-3 select-none flex-shrink-0", className)}>
      <Image
        src="/logo/app-icon.png"
        alt={t("brand.name") || "MZM & Associates"}
        width={s.dim}
        height={s.dim}
        className={cn("object-cover shadow-md flex-shrink-0", s.mark)}
        priority={size === "lg"}
      />
      <div className="flex flex-col leading-none text-start">
        <span
          className={cn(
            "font-heading font-bold tracking-tight",
            isLightText ? "text-white" : "text-navy",
            s.text
          )}
        >
          MZM
        </span>
        <span
          className={cn(
            "uppercase tracking-[0.18em] font-semibold",
            isLightText ? "text-gold-300" : "text-gold",
            s.sub
          )}
        >
          &amp; Associates
        </span>
      </div>
    </div>
  );
}
