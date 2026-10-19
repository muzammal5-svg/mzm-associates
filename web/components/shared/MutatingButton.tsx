"use client";
import { ReactNode } from "react";
import { useSubscriptionAccess } from "@/hooks/useSubscriptionAccess";
import { Button, type ButtonProps } from "@/components/ui/Button";

export function MutatingButton({ children, ...props }: ButtonProps) {
  const { canMutate } = useSubscriptionAccess();
  const disabled = !canMutate;
  return (
    <Button {...props} disabled={disabled || props.disabled} title={disabled ? "Renew to edit" : props.title}>
      {children}
    </Button>
  );
}