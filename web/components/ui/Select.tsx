import { forwardRef, type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?:       string;
  error?:       string;
  hint?:        string;
  options:      SelectOption[];
  placeholder?: string;
  containerClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      hint,
      options,
      placeholder = "Select an option",
      containerClassName,
      className,
      id,
      required,
      ...props
    },
    ref
  ) => {
    const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className={cn("flex flex-col gap-1.5", containerClassName)}>
        {label && (
          <label htmlFor={selectId} className="label">
            {label}
            {required && <span className="text-danger ms-0.5" aria-hidden="true">*</span>}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            required={required}
            aria-invalid={!!error}
            className={cn(
              "input appearance-none pe-9",
              error && "border-danger focus:ring-danger",
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-300 pointer-events-none"
            aria-hidden="true"
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

Select.displayName = "Select";
