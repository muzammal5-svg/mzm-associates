import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn, isUrdu } from "@/lib/utils";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?:       string;
  error?:       string;
  hint?:        string;
  autoRtl?:     boolean;   // auto-detect Urdu and switch to RTL
  variant?:     "light" | "dark";
  containerClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      hint,
      autoRtl = true,
      variant = "light",
      containerClassName,
      className,
      id,
      required,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    const textValue  = typeof value === "string" ? value : "";
    const dir        = autoRtl && isUrdu(textValue) ? "rtl" : "ltr";
    const isDark     = variant === "dark";

    return (
      <div className={cn("flex flex-col gap-1.5", containerClassName)}>
        {label && (
          <label htmlFor={textareaId} className={isDark ? "label-dark" : "label"}>
            {label}
            {required && <span className="text-danger ms-0.5" aria-hidden="true">*</span>}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          required={required}
          dir={dir}
          value={value}
          onChange={onChange}
          aria-invalid={!!error}
          className={cn(
            isDark ? "input-dark min-h-[88px] resize-y py-2.5" : "input min-h-[88px] resize-y py-2.5",
            dir === "rtl" && "font-urdu text-end",
            error && "border-danger focus:ring-danger",
            className
          )}
          {...props}
        />

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

Textarea.displayName = "Textarea";
