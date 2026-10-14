import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  lines?:     number;
}

/** Single shimmer block */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "rounded-md bg-gradient-to-r from-navy-50 via-navy-100 to-navy-50",
        "bg-[length:200%_100%] animate-shimmer",
        className
      )}
    />
  );
}

/** Stacked text-line skeletons */
export function SkeletonText({ lines = 3, className }: SkeletonProps) {
  return (
    <div className={cn("space-y-2", className)} aria-busy="true" aria-label="Loading…">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-4",
            i === lines - 1 ? "w-3/4" : "w-full"
          )}
        />
      ))}
    </div>
  );
}

/** Card-shaped skeleton */
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("bg-white rounded-xl border border-navy-50 p-4 space-y-3", className)}>
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      <SkeletonText lines={2} />
    </div>
  );
}

/** Table rows skeleton */
export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="w-full rounded-xl border border-navy-50 overflow-hidden">
      <div className="bg-navy-50/60 px-4 py-3 flex gap-4">
        {[40, 20, 15, 15, 10].map((w, i) => (
          <Skeleton key={i} className={`h-3 w-[${w}%]`} />
        ))}
      </div>
      <div className="bg-white divide-y divide-navy-50">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="px-4 py-3 flex gap-4 items-center">
            <Skeleton className="h-4 w-[40%]" />
            <Skeleton className="h-4 w-[20%]" />
            <Skeleton className="h-4 w-[15%]" />
            <Skeleton className="h-4 w-[15%]" />
            <Skeleton className="h-6 w-[10%] rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
