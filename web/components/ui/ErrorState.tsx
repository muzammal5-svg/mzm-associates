import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";

interface ErrorStateProps {
  message?:   string;
  onRetry?:   () => void;
  className?: string;
}

export function ErrorState({
  message   = "Something went wrong. Please try again.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 text-center gap-3", className)}>
      <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
        <AlertTriangle className="w-6 h-6 text-danger" />
      </div>
      <p className="text-danger font-semibold">Error</p>
      <p className="text-sm text-navy-400 max-w-xs">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary mt-2 text-sm">
          Retry
        </button>
      )}
    </div>
  );
}
