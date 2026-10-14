"use client";

import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "xs" | "sm" | "md" | "lg";
  variant?: "full" | "mark";  // full = monogram + text; mark = monogram only
  className?: string;
}

const sizeMap = {
  xs: { mark: "w-7 h-7 text-base",  firm: "text-xs",  assoc: "text-[9px]" },
  sm: { mark: "w-9 h-9 text-lg",    firm: "text-sm",  assoc: "text-[10px]" },
  md: { mark: "w-11 h-11 text-xl",  firm: "text-base", assoc: "text-[11px]" },
  lg: { mark: "w-14 h-14 text-2xl", firm: "text-lg",  assoc: "text-xs" },
};

export function Logo({ size = "md", variant = "full", className }: LogoProps) {
  const s = sizeMap[size];

  return (
    <div className={cn("flex items-center gap-2.5 select-none", className)}>
      {/* Gold monogram shield */}
      <div
        className={cn(
          "relative flex items-center justify-center rounded-lg flex-shrink-0",
          "bg-navy border-2 border-gold",
          s.mark
        )}
        aria-hidden="true"
      >
        <span
          className={cn(
            "font-heading font-bold text-gold leading-none tracking-tight",
            s.mark.split(" ").find(c => c.startsWith("text-"))
          )}
        >
          MZM
        </span>
      </div>

      {/* Firm name — hidden in mark-only mode */}
      {variant === "full" && (
        <div className="flex flex-col leading-tight">
          <span
            className={cn(
              "font-heading font-bold text-navy tracking-wide",
              s.firm
            )}
          >
            MZM
          </span>
          <span
            className={cn(
              "font-body font-semibold text-navy/70 uppercase tracking-[0.12em]",
              s.assoc
            )}
          >
            &amp; ASSOCIATES
          </span>
        </div>
      )}
    </div>
  );
}
