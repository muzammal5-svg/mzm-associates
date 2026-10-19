import { cn } from "@/lib/utils";
import type { CaseStatus, CaseOutcome, UserRole } from "@/types/supabase";

// ─── Generic Badge ────────────────────────────────────────────────────────────

export type BadgeVariant =
  | "gold" | "navy" | "success" | "danger" | "warning" | "info"
  | "neutral" | "purple";

const VARIANT_STYLES: Record<BadgeVariant, string> = {
  gold:    "bg-gold-100    text-gold-700",
  navy:    "bg-navy-100    text-navy-700",
  success: "bg-green-100   text-green-700",
  danger:  "bg-red-100     text-red-700",
  warning: "bg-yellow-100  text-yellow-800",
  info:    "bg-blue-100    text-blue-700",
  neutral: "bg-gray-100    text-gray-700",
  purple:  "bg-purple-100  text-purple-700",
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
        "inline-flex items-center gap-1 font-semibold rounded-full",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-xs",
        VARIANT_STYLES[variant],
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full flex-shrink-0",
            variant === "success" ? "bg-success" :
            variant === "danger"  ? "bg-danger"  :
            variant === "warning" ? "bg-warning" :
            variant === "gold"    ? "bg-gold"    :
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
