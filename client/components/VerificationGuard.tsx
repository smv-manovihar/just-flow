"use client";

import { ReactNode } from "react";
import { useAuth } from "@/context/authContext";
import { isActionAllowed, checkActionPermission } from "@/lib/verificationGuard";
import VerificationPrompt from "./VerificationPrompt";

interface VerificationGuardProps {
  action: string;
  children: ReactNode;
  fallback?: ReactNode;
  showPrompt?: boolean;
  onVerify?: () => void;
  onCancel?: () => void;
}

export default function VerificationGuard({
  action,
  children,
  fallback,
  showPrompt = true,
  onVerify,
  onCancel,
}: VerificationGuardProps) {
  const { user } = useAuth();
  const { allowed, message } = checkActionPermission(user, action as any);

  if (allowed) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (showPrompt) {
    return (
      <VerificationPrompt
        action={action}
        onVerify={onVerify}
        onCancel={onCancel}
      />
    );
  }

  return null;
}

// Hook to check if an action is allowed
export const useVerificationGuard = (action: string) => {
  const { user } = useAuth();
  const { allowed, message } = checkActionPermission(user, action as any);
  
  return {
    isAllowed: allowed,
    message,
    user,
  };
};
