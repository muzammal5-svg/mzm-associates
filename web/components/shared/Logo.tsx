"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "xs" | "sm" | "md" | "lg";
  variant?: "full" | "mark";
  className?: string;
}

const sizeMap = {
  xs: { mark: "w-7 h-7", firm: "text-xs", assoc: "text-[9px]", pixels: 28 },
  sm: { mark: "w-9 h-9", firm: "text-sm", assoc: "text-[10px]", pixels: 36 },
  md: { mark: "w-11 h-11", firm: "text-base", assoc: "text-[11px]", pixels: 44 },
  lg: { mark: "w-14 h-14", firm: "text-lg", assoc: "text-xs", pixels: 56 },
};

export function Logo({ size = "md", variant = "full", className }: LogoProps) {
  const s = sizeMap[size];
  return (
    <div className={cn("flex items-center gap-2.5 select-none", className)}>
      <Image
        src="/logo/logoadv.jpeg"
        alt="MZM & Associates"
        width={s.pixels}
        height={s.pixels}
        className={cn("object-contain flex-shrink-0 rounded-full bg-white", s.mark)}
        priority={size === "lg"}
      />
      {variant === "full" && (
        <div className="flex flex-col leading-tight">
          <span className={cn("font-heading font-bold text-navy tracking-wide", s.firm)}>MZM</span>
          <span className={cn("font-body font-semibold text-navy/70 uppercase tracking-[0.12em]", s.assoc)}>&amp; ASSOCIATES</span>
        </div>
      )}
    </div>
  );
}
