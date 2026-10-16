"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface LogoProps {
  size?: "xs" | "sm" | "md" | "lg";
  variant?: "full" | "mark";
  className?: string;
}

const sizeMap = {
  xs: { mark: "w-11 h-7", pixels: 44, height: 28 },
  sm: { mark: "w-14 h-9", pixels: 56, height: 36 },
  md: { mark: "w-[4.25rem] h-11", pixels: 68, height: 44 },
  lg: { mark: "w-[5.25rem] h-14", pixels: 84, height: 56 },
};

export function Logo({ size = "md", variant = "full", className }: LogoProps) {
  const { t } = useTranslation();
  const s = sizeMap[size];
  return (
    <div data-variant={variant} className={cn("flex items-center gap-2.5 select-none", className)}>
      <Image
        src="/logo/brand-mark.png"
        alt={t("brand.name")}
        width={s.pixels}
        height={s.height}
        className={cn("object-contain flex-shrink-0 bg-white", s.mark)}
        priority={size === "lg"}
      />
    </div>
  );
}
