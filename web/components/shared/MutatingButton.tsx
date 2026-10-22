"use client";
import { useTranslation } from "react-i18next";
import { Button, type ButtonProps } from "@/components/ui/Button";
import { useSubscriptionAccess } from "@/hooks/useSubscriptionAccess";

export type LockProps = { disabled?: boolean; "aria-disabled"?: boolean; title?: string };

/**
 * Single source of truth for "this control writes". Returns props to spread onto any
 * button, input or link-shaped control so a grace/expired firm sees it disabled + explained.
 */
export function useMutationLock() {
  const { canMutate } = useSubscriptionAccess();
  const { t } = useTranslation();
  const lock: LockProps = canMutate
    ? {}
    : { disabled: true, "aria-disabled": true, title: t("subscription.renewToEdit") };
  return { canMutate, lock, renewTooltip: t("subscription.renewToEdit") };
}

export function MutatingButton({ children, ...props }: ButtonProps) {
  const { lock } = useMutationLock();
  return (
    <Button {...props} {...lock}>
      {children}
    </Button>
  );
}
