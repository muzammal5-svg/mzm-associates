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
      <div className="w-16 h-16 rounded-full bg-navy-50 flex items-center justify-center">
        <Icon className="w-7 h-7 text-navy-300" aria-hidden="true" />
      </div>
      <div className="space-y-1">
        <p className="font-semibold text-navy">{title}</p>
        {body && (
          <p className="text-sm text-navy-300 max-w-xs mx-auto">{body}</p>
        )}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
