import { type ReactNode, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children:    ReactNode;
  padding?:    "none" | "sm" | "md" | "lg";
  hover?:      boolean;
  clickable?:  boolean;
}

const paddingMap = {
  none: "p-0",
  sm:   "p-3",
  md:   "p-4",
  lg:   "p-6",
};

export function Card({
  children,
  padding    = "md",
  hover      = false,
  clickable  = false,
  className,
  ...props
}: CardProps) {
  return (
    <div
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      className={cn(
       "bg-white rounded-lg border border-border shadow-sm",
       paddingMap[padding],
       hover    && "hover:shadow-md transition-shadow duration-150",
       clickable && "cursor-pointer active:scale-[.99] transition-transform focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// ── Card sub-components ───────────────────────────────────────────────────────

export function CardHeader({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex items-center justify-between mb-3", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("text-base font-heading font-semibold text-navy", className)} {...props}>
      {children}
    </h3>
  );
}

export function CardBody({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("text-sm text-navy-400", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mt-4 pt-3 border-t border-navy-50 flex items-center gap-2", className)} {...props}>
      {children}
    </div>
  );
}
