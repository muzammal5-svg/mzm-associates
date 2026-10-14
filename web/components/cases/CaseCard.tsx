"use client";

import Link               from "next/link";
import { useTranslation } from "react-i18next";
import { ChevronRight }   from "lucide-react";
import { Card }           from "@/components/ui/Card";
import { Badge, CaseStatusBadge, OutcomeBadge } from "@/components/ui/Badge";
import { cn, isUrdu, textDir, fmtDate } from "@/lib/utils";
import type { Case }      from "@/types/supabase";

interface CaseCardProps {
  case_:      Case;
  className?: string;
}

export function CaseCard({ case_: c, className }: CaseCardProps) {
  const { t } = useTranslation();

  return (
    <Link href={`/cases/view?id=${c.id}`} className="block group">
      <Card hover className={cn("flex items-start gap-3", className)}>
        {/* Ref no circle */}
        <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-[10px] font-bold text-gold leading-tight text-center px-1 break-all">
            {c.case_ref_no.slice(0, 8)}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-mono text-gold font-semibold">{c.case_ref_no}</p>
          <p
            className="text-sm font-semibold text-navy mt-0.5 leading-snug line-clamp-2"
            dir={isUrdu(c.plaintiff_name) || isUrdu(c.defendant_name) ? "rtl" : "ltr"}
          >
            {c.plaintiff_name}
            <span className="text-navy-300 font-normal mx-1 text-xs">vs</span>
            {c.defendant_name}
          </p>
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            <CaseStatusBadge status={c.status} />
            {c.case_type?.name && (
              <Badge variant="neutral" size="sm">{c.case_type.name}</Badge>
            )}
            {c.status === "decided" && c.outcome && (
              <OutcomeBadge outcome={c.outcome} />
            )}
          </div>
          {c.client?.full_name && (
            <p className="text-[11px] text-navy-300 mt-1"
              dir={textDir(c.client.full_name)}>
              {c.client.full_name}
            </p>
          )}
        </div>

        <ChevronRight className="w-4 h-4 text-navy-200 group-hover:text-gold transition-colors flex-shrink-0 mt-1" />
      </Card>
    </Link>
  );
}
