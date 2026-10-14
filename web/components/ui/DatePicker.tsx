"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface DatePickerProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?:       string;
  error?:       string;
  hint?:        string;
  containerClassName?: string;
}

/**
 * DatePicker — uses native <input type="date">.
 * Values are always ISO strings (YYYY-MM-DD).
 * Works on all platforms including iOS/Android WebView.
 */
export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  ({ label, error, hint, containerClassName, className, id, required, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className={cn("flex flex-col gap-1.5", containerClassName)}>
        {label && (
          <label htmlFor={inputId} className="label">
            {label}
            {required && <span className="text-danger ms-0.5" aria-hidden="true">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          <Calendar
            className="absolute start-3 w-4 h-4 text-navy-300 pointer-events-none"
            aria-hidden="true"
          />
          <input
            ref={ref}
            type="date"
            id={inputId}
            required={required}
            aria-invalid={!!error}
            className={cn(
              "input ps-9",
              // iOS date input needs explicit colour
              "[color-scheme:light]",
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
          <p className="text-navy-300 text-xs">{hint}</p>
        )}
      </div>
    );
  }
);

DatePicker.displayName = "DatePicker";
