import { type ReactNode } from "react";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?:      React.ComponentType<{ className?: string }>;
  title?:     string;
  message?:   string;
  /** Alias for `message` kept for backwards compatibility. */
  description?: string;
  action?:    ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon  = Inbox,
  title       = "No records found",
  message,
  description,
  action,
  className,
}: EmptyStateProps) {
  const body = message ?? description;
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-4 text-center gap-3",
        className
      )}
    >
      <div className="w-14 h-14 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center shadow-xs">
        <Icon className="w-6 h-6 text-gold" aria-hidden="true" />
      </div>
      <div className="space-y-1">
        <p className="font-semibold text-white text-base">{title}</p>
        {body && (
          <p className="text-sm text-white/60 max-w-xs mx-auto leading-relaxed">{body}</p>
        )}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
