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
  variant?:     "light" | "dark";
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
      variant = "light",
      containerClassName,
      className,
      id,
      required,
      ...props
    },
    ref
  ) => {
    const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    const isDark = variant === "dark";

    return (
      <div className={cn("flex flex-col gap-1.5", containerClassName)}>
        {label && (
          <label htmlFor={selectId} className={isDark ? "label-dark" : "label"}>
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
              isDark ? "input-dark appearance-none pe-9 min-h-[44px]" : "input appearance-none pe-9 min-h-[44px]",
              error && "border-danger focus:ring-danger",
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled className={isDark ? "bg-slate-900 text-white/50" : "bg-white text-navy-400"}>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled} className={isDark ? "bg-slate-900 text-white" : "bg-white text-navy"}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className={cn("absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none", isDark ? "text-white/50" : "text-navy-400")}
            aria-hidden="true"
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

Select.displayName = "Select";
