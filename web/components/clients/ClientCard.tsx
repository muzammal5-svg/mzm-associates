"use client";

import Link                from "next/link";
import { useTranslation }  from "react-i18next";
import { Phone, CreditCard, Briefcase, ChevronRight } from "lucide-react";
import { Card }            from "@/components/ui/Card";
import { Badge }           from "@/components/ui/Badge";
import { cn, isUrdu, textDir } from "@/lib/utils";
import { formatPhoneDisplay }  from "@/lib/phone";
import type { Client }     from "@/types/supabase";

interface ClientCardProps {
  client:       Client;
  caseCount?:   number;
  className?:   string;
}

export function ClientCard({ client, caseCount, className }: ClientCardProps) {
  const { t } = useTranslation();

  return (
    <Link href={`/clients/view?id=${client.id}`} className="block group">
      <Card
        hover
        className={cn("flex items-center gap-3", className)}
      >
        {/* Avatar */}
        <div className="w-11 h-11 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0">
          <span className={cn(
            "font-bold text-gold leading-none",
            isUrdu(client.full_name) ? "font-urdu text-base" : "text-base"
          )}>
            {client.full_name.charAt(0).toUpperCase()}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p
            className="font-semibold text-navy truncate text-sm"
            dir={textDir(client.full_name)}
            lang={isUrdu(client.full_name) ? "ur" : "en"}
          >
            {client.full_name}
          </p>

          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {client.phone && (
              <span className="flex items-center gap-1 text-xs text-navy-500 font-medium">
                <Phone className="w-3 h-3 text-navy-400" />
                {formatPhoneDisplay(client.phone)}
              </span>
            )}
            {client.cnic && (
              <span className="flex items-center gap-1 text-xs text-navy-500 font-mono">
                <CreditCard className="w-3 h-3 text-navy-400" />
                {client.cnic}
              </span>
            )}
          </div>

          {client.city && (
            <p className="text-xs text-navy-500 mt-0.5">{client.city}</p>
          )}
        </div>

        {/* Right side */}
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          {!client.is_active && (
            <Badge variant="neutral" size="sm">{t("common.deactivate")}</Badge>
          )}
          {caseCount !== undefined && caseCount > 0 && (
            <span className="flex items-center gap-1 text-xs font-semibold text-gold">
              <Briefcase className="w-3 h-3" />
              {caseCount}
            </span>
          )}
          <ChevronRight className="w-4 h-4 text-navy-400 group-hover:text-gold transition-colors rtl:rotate-180" />
        </div>
      </Card>
    </Link>
  );
}
