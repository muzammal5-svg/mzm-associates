"use client";

import { useTranslation } from "react-i18next";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

interface QueryErrorStateProps {
  onRetry: () => void;
  message?: string;
  className?: string;
}

export function QueryErrorState({ onRetry, message, className }: QueryErrorStateProps) {
  const { t } = useTranslation();

  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 py-12 text-center", className)} role="alert">
      <AlertTriangle className="h-6 w-6 text-danger" aria-hidden="true" />
      <p className="text-sm text-danger">{message ?? t("common.error")}</p>
      <Button size="sm" variant="secondary" onClick={onRetry}>{t("common.retry")}</Button>
    </div>
  );
}
