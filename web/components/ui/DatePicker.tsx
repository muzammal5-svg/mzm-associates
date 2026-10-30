"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface DatePickerProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?:       string;
  error?:       string;
  hint?:        string;
  variant?:     "light" | "dark";
  containerClassName?: string;
}

/**
 * DatePicker — uses native <input type="date">.
 * Values are always ISO strings (YYYY-MM-DD).
 * Works on all platforms including iOS/Android WebView.
 */
export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  ({ label, error, hint, variant = "light", containerClassName, className, id, required, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    const isDark  = variant === "dark";

    return (
      <div className={cn("flex flex-col gap-1.5", containerClassName)}>
        {label && (
          <label htmlFor={inputId} className={isDark ? "label-dark" : "label"}>
            {label}
            {required && <span className="text-danger ms-0.5" aria-hidden="true">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          <Calendar
            className={cn("absolute start-3 w-4 h-4 pointer-events-none", isDark ? "text-white/50" : "text-navy-400")}
            aria-hidden="true"
          />
          <input
            ref={ref}
            type="date"
            id={inputId}
            required={required}
            aria-invalid={!!error}
            className={cn(
              isDark ? "input-dark ps-9 min-h-[44px] [color-scheme:dark]" : "input ps-9 min-h-[44px] [color-scheme:light]",
              error && "border-danger focus:ring-danger",
              className
            )}
            {...props}
          />
        </div>

        {error && (
          <p role="alert" className="text-danger text-xs font-medium">{error}</p>
        )}
        {hint && !error && (
          <p className={cn("text-xs", isDark ? "text-white/60" : "text-navy-500")}>{hint}</p>
        )}
      </div>
    );
  }
);

DatePicker.displayName = "DatePicker";
