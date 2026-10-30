"use client";

import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";
import { Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "placeholder"> {
  label:        string;
  error?:       string;
  hint?:        string;
  /** When true, a green check is shown as soon as the field is non-empty. */
  valid?:       boolean;
  leftIcon?:    ReactNode;
  rightSlot?:   ReactNode;
  containerClassName?: string;
}

/**
 * Floating-label input with instant validation affordances.
 */
export const FloatingField = forwardRef<HTMLInputElement, FloatingFieldProps>(
  (
    {
      label,
      error,
      hint,
      valid,
      leftIcon,
      rightSlot,
      containerClassName,
      className,
      id,
      required,
      value,
      ...props
    },
    ref
  ) => {
    const autoId = useId();
    const inputId = id ?? autoId;
    const showValid = Boolean(valid) && !error && String(value ?? "").trim().length > 0;

    return (
      <div className={cn("flex flex-col gap-1.5", containerClassName)}>
        <div className="relative">
          {leftIcon && (
            <span className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-navy-400 flex items-center justify-center w-5 h-5" aria-hidden="true">
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            value={value}
            required={required}
            placeholder=" "
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            className={cn(
              "field-float",
              leftIcon ? "field-float--with-left-icon !ps-11" : "!ps-4",
              (rightSlot || showValid) ? "field-float--with-right-slot !pe-11" : "!pe-4",
              error && "border-rose-300 focus:border-rose-400 focus:ring-rose-400/15",
              className
            )}
            {...props}
          />

          <label
            htmlFor={inputId}
            className={cn(
              "field-float-label",
              leftIcon && "field-float-label--inset",
              error && "field-float-label--error"
            )}
          >
            {label}
            {required && <span className="ms-0.5 text-rose-400" aria-hidden="true">*</span>}
          </label>

          {(rightSlot || showValid) && (
            <span className="absolute end-3.5 top-1/2 -translate-y-1/2">
              {showValid ? (
                <Check className="h-4 w-4 text-emerald-500 animate-check-draw [stroke-dasharray:100]" aria-hidden="true" />
              ) : (
                rightSlot
              )}
            </span>
          )}
        </div>

        {error ? (
          <p id={`${inputId}-error`} role="alert" className="flex items-center gap-1.5 text-xs font-medium text-rose-600">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {error}
          </p>
        ) : hint ? (
          <p id={`${inputId}-hint`} className="text-xs text-navy-400">{hint}</p>
        ) : null}
      </div>
    );
  }
);

FloatingField.displayName = "FloatingField";
