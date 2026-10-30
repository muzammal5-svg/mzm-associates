import { Check } from "lucide-react";
import { cn }    from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface Step {
  label:    string;
  optional?: boolean;
}

interface StepIndicatorProps {
  steps:      Step[];
  current:    number;   // 0-indexed
  className?: string;
}

export function StepIndicator({ steps, current, className }: StepIndicatorProps) {
  const { t } = useTranslation();
  return (
    <div className={cn("flex items-center", className)}         aria-label={t("common.progress")}>
      {steps.map((step, i) => {
        const done   = i < current;
        const active = i === current;
        return (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            {/* Circle */}
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center border-2 text-xs font-bold transition-colors duration-200",
                  done   && "bg-gold border-gold text-white",
                  active && "bg-white border-gold text-gold",
                  !done && !active && "bg-white border-navy-200 text-navy-400"
                )}
                aria-current={active ? "step" : undefined}
              >
                {done ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className={cn(
                "text-[10px] font-medium whitespace-nowrap",
                active ? "text-gold font-semibold" : done ? "text-navy-600" : "text-navy-400"
              )}>
                {step.label}
                {step.optional && <span className="text-navy-400 ms-1">({t("common.optional")})</span>}
              </span>
            </div>
            {/* Connector */}
            {i < steps.length - 1 && (
              <div className={cn(
                "flex-1 h-0.5 mx-2 -mt-5 rounded",
                i < current ? "bg-gold" : "bg-navy-200"
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}
