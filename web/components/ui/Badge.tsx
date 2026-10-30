import { cn } from "@/lib/utils";
import type { CaseStatus, CaseOutcome, UserRole } from "@/types/supabase";

// ─── Generic Badge ────────────────────────────────────────────────────────────

export type BadgeVariant =
  | "gold" | "navy" | "success" | "danger" | "warning" | "info"
  | "neutral" | "purple";

const VARIANT_STYLES: Record<BadgeVariant, string> = {
  gold:    "bg-amber-50 text-amber-800 border border-amber-300/60 shadow-xs",
  navy:    "bg-slate-100 text-slate-800 border border-slate-300/60 shadow-xs",
  success: "bg-emerald-50 text-emerald-800 border border-emerald-300/60 shadow-xs",
  danger:  "bg-rose-50 text-rose-800 border border-rose-300/60 shadow-xs",
  warning: "bg-amber-50 text-amber-900 border border-amber-300/60 shadow-xs",
  info:    "bg-sky-50 text-sky-800 border border-sky-300/60 shadow-xs",
  neutral: "bg-slate-50 text-slate-700 border border-slate-200 shadow-xs",
  purple:  "bg-indigo-50 text-indigo-800 border border-indigo-300/60 shadow-xs",
};

interface BadgeProps {
  children:    React.ReactNode;
  variant?:    BadgeVariant;
  size?:       "sm" | "md";
  dot?:        boolean;
  className?:  string;
}

export function Badge({
  children,
  variant   = "neutral",
  size      = "md",
  dot       = false,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-medium rounded-full tracking-tight transition-colors",
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
        VARIANT_STYLES[variant],
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full flex-shrink-0",
            variant === "success" ? "bg-emerald-500 ring-2 ring-emerald-500/20" :
            variant === "danger"  ? "bg-rose-500 ring-2 ring-rose-500/20"  :
            variant === "warning" ? "bg-amber-500 ring-2 ring-amber-500/20" :
            variant === "gold"    ? "bg-amber-600 ring-2 ring-amber-500/20"    :
            variant === "info"    ? "bg-sky-500 ring-2 ring-sky-500/20" :
            "bg-current"
          )}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}

// ─── Specialised badges ───────────────────────────────────────────────────────

const CASE_STATUS_MAP: Record<CaseStatus, { variant: BadgeVariant; label: string }> = {
  running: { variant: "info",    label: "Running" },
  decided: { variant: "neutral", label: "Decided" },
};

export function CaseStatusBadge({ status, className }: { status: CaseStatus; className?: string }) {
  const { variant, label } = CASE_STATUS_MAP[status];
  return <Badge variant={variant} dot className={className}>{label}</Badge>;
}

const OUTCOME_MAP: Record<CaseOutcome, { variant: BadgeVariant; label: string }> = {
  won:       { variant: "success", label: "Won" },
  lost:      { variant: "danger",  label: "Lost" },
  dismissed: { variant: "neutral", label: "Dismissed" },
  settled:   { variant: "warning", label: "Settled" },
  withdrawn: { variant: "neutral", label: "Withdrawn" },
};

export function OutcomeBadge({ outcome, className }: { outcome: CaseOutcome; className?: string }) {
  const { variant, label } = OUTCOME_MAP[outcome];
  return <Badge variant={variant} className={className}>{label}</Badge>;
}

const ROLE_MAP: Record<UserRole, { variant: BadgeVariant; label: string }> = {
  super_admin: { variant: "purple",  label: "Super Admin" },
  admin:       { variant: "gold",    label: "Admin" },
  lawyer:      { variant: "navy",    label: "Lawyer" },
  clerk:       { variant: "neutral", label: "Clerk" },
};

export function RoleBadge({ role, className }: { role: UserRole; className?: string }) {
  const { variant, label } = ROLE_MAP[role];
  return <Badge variant={variant} className={className}>{label}</Badge>;
}

export function CourtBadge({ courtName, className }: { courtName?: string | null; className?: string }) {
  if (!courtName) return null;
  const isHighCourt = /high/i.test(courtName);
  const isSupremeCourt = /supreme/i.test(courtName);
  const variant: BadgeVariant = isSupremeCourt ? "purple" : isHighCourt ? "gold" : "navy";
  return (
    <Badge variant={variant} size="sm" className={className}>
      {courtName}
    </Badge>
  );
}
