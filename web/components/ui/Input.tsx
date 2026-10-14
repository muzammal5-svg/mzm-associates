import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?:       string;
  error?:       string;
  hint?:        string;
  leftElement?: ReactNode;
  rightElement?: ReactNode;
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
      containerClassName,
      className,
      id,
      required,
      ...props
    },
    ref
  ) => {
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
          {leftElement && (
            <div className="absolute start-3 flex items-center pointer-events-none text-navy-300">
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
              "input",
              leftElement  && "ps-9",
              rightElement && "pe-9",
              error && "border-danger focus:ring-danger",
              className
            )}
            {...props}
          />

          {rightElement && (
            <div className="absolute end-3 flex items-center text-navy-300">
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
          <p id={`${inputId}-hint`} className="text-navy-300 text-xs">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
