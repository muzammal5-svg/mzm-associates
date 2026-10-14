import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn, isUrdu } from "@/lib/utils";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?:       string;
  error?:       string;
  hint?:        string;
  autoRtl?:     boolean;   // auto-detect Urdu and switch to RTL
  containerClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      hint,
      autoRtl = true,
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

    return (
      <div className={cn("flex flex-col gap-1.5", containerClassName)}>
        {label && (
          <label htmlFor={textareaId} className="label">
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
            "input min-h-[80px] resize-y py-2.5",
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
          <p className="text-navy-300 text-xs">{hint}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
