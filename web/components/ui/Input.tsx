import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?:       string;
  error?:       string;
  hint?:        string;
  leftElement?: ReactNode;
  rightElement?: ReactNode;
  variant?:     "light" | "dark";
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftElement,
      rightElement,
      variant = "light",
      containerClassName,
      className,
      id,
      required,
      ...props
    },
    ref
  ) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    const isDark = variant === "dark";

    return (
      <div className={cn("flex flex-col gap-1.5", containerClassName)}>
        {label && (
          <label htmlFor={inputId} className={isDark ? "label-dark" : "label"}>
            {label}
            {required && <span className="text-danger ms-0.5" aria-hidden="true">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          {leftElement && (
            <div className={cn("absolute start-3 flex items-center pointer-events-none", isDark ? "text-white/50" : "text-navy-400")}>
              {leftElement}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            required={required}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            className={cn(
              isDark ? "input-dark min-h-[44px]" : "input min-h-[44px]",
              leftElement  && "ps-9",
              rightElement && "pe-9",
              error && "border-danger focus:ring-danger",
              className
            )}
            {...props}
          />

          {rightElement && (
            <div className={cn("absolute end-3 flex items-center", isDark ? "text-white/50" : "text-navy-400")}>
              {rightElement}
            </div>
          )}
        </div>

        {error && (
          <p id={`${inputId}-error`} role="alert" className="text-danger text-xs font-medium">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${inputId}-hint`} className={cn("text-xs", isDark ? "text-white/60" : "text-navy-500")}>
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
