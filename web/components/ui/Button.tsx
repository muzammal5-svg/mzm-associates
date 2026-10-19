import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "./LoadingSpinner";

export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost" | "link";
export type ButtonSize    = "xs" | "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:   ButtonVariant;
  size?:      ButtonSize;
  loading?:   boolean;
  leftIcon?:  ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

const variants: Record<ButtonVariant, string> = {
  primary:   "bg-gold-cta text-white shadow-gold hover:shadow-md active:shadow-sm focus-visible:ring-gold",
  secondary: "bg-white text-navy border border-border hover:bg-navy-50 active:bg-navy-100 focus-visible:ring-navy",
  danger:    "bg-danger text-white shadow-sm hover:bg-red-700 active:bg-red-800 focus-visible:ring-red-500",
  ghost:     "bg-transparent text-navy hover:bg-navy-50 active:bg-navy-100 focus-visible:ring-navy",
  link:      "bg-transparent text-gold underline-offset-2 hover:underline p-0 min-h-0 focus-visible:ring-gold",
};

const sizes: Record<ButtonSize, string> = {
  xs: "h-8  px-2.5 text-xs  gap-1",
  sm: "h-9  px-3   text-sm  gap-1.5",
  md: "h-12 px-4   text-sm  gap-2",
  lg: "h-14 px-6   text-base gap-2",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant   = "primary",
      size      = "md",
      loading   = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        aria-busy={loading}
        className={cn(
          // Base
          "inline-flex items-center justify-center font-semibold rounded-md",
          "transition-all duration-150 active:scale-[.98]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "select-none",
          variant !== "link" && "min-h-[48px] min-w-[44px]",
          // Variant + size
          variants[variant],
          sizes[size],
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {loading ? (
          <LoadingSpinner size="sm" />
        ) : (
          leftIcon
        )}
        {children && <span>{children}</span>}
        {!loading && rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";
