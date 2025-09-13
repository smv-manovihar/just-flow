"use client";

import { useState } from "react";
import { useAuth } from "@/context/authContext";
import { Button } from "@/components/ui/button";
import { resendVerificationEmail } from "@/api/auth.api";
import EmailVerificationModal from "./EmailVerificationModal";
import { Mail, CheckCircle, RefreshCw, Lock } from "lucide-react";

interface VerificationPromptProps {
  action: string;
  onVerify?: () => void;
  onCancel?: () => void;
  showResend?: boolean;
}

export default function VerificationPrompt({
  action,
  onVerify,
  onCancel,
  showResend = true,
}: VerificationPromptProps) {
  const { user } = useAuth();
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  if (!user || user.isEmailVerified) {
    return null;
  }

  const handleResendEmail = async () => {
    setIsResending(true);
    setResendSuccess(false);

    try {
      const response = await resendVerificationEmail({
        email: user.email,
        method: "both",
      });

      if (response.success) {
        setResendSuccess(true);
        setTimeout(() => setResendSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Failed to resend verification email:", error);
    } finally {
      setIsResending(false);
    }
  };

  const handleVerificationSuccess = () => {
    setShowVerificationModal(false);
    if (onVerify) {
      onVerify();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <>
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <Lock className="w-5 h-5 text-yellow-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-yellow-800">
              Email Verification Required
            </h3>
            <p className="text-sm text-yellow-700 mt-1">
              To {action}, please verify your email address ({user.email})
              first.
            </p>

            <div className="flex items-center gap-2 mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowVerificationModal(true)}
                className="text-yellow-700 border-yellow-300 hover:bg-yellow-100"
              >
                <Mail className="w-4 h-4 mr-2" />
                Verify Now
              </Button>

              {showResend && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResendEmail}
                  disabled={isResending}
                  className="text-yellow-700 hover:bg-yellow-100"
                >
                  {isResending ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    "Resend"
                  )}
                </Button>
              )}

              {onCancel && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                  className="text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </Button>
              )}
            </div>

            {resendSuccess && (
              <div className="flex items-center gap-2 mt-2 text-sm text-green-600">
                <CheckCircle className="w-4 h-4" />
                Verification email sent successfully!
              </div>
            )}
          </div>
        </div>
      </div>

      {showVerificationModal && (
        <EmailVerificationModal
          email={user.email}
          onClose={() => setShowVerificationModal(false)}
          onSuccess={handleVerificationSuccess}
        />
      )}
    </>
  );
}
