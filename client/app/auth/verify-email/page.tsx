"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/authContext";
import { verifyEmailWithToken } from "@/api/auth.api";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import routes from "@/lib/routes";

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuth();

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token");

      if (!token) {
        setStatus("error");
        setMessage(
          "Invalid verification link. Please check your email for the correct link."
        );
        return;
      }

      try {
        const response = await verifyEmailWithToken(token);

        if (response.success && response.data) {
          setStatus("success");
          setMessage(
            "Email verified successfully! You can now access all features."
          );
          setUser(response.data);

          // Redirect to profile after 3 seconds
          setTimeout(() => {
            router.push("/profile");
          }, 3000);
        } else {
          setStatus("error");
          setMessage(
            response.message || "Verification failed. Please try again."
          );
        }
      } catch (error) {
        setStatus("error");
        setMessage(
          error instanceof Error
            ? error.message
            : "Verification failed. Please try again."
        );
      }
    };

    verifyEmail();
  }, [searchParams, setUser, router]);

  const getStatusIcon = () => {
    switch (status) {
      case "loading":
        return <Loader2 className="w-12 h-12 text-primary animate-spin" />;
      case "success":
        return <CheckCircle className="w-12 h-12 text-green-500" />;
      case "error":
        return <XCircle className="w-12 h-12 text-red-500" />;
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case "loading":
        return "Verifying Your Email";
      case "success":
        return "Email Verified Successfully!";
      case "error":
        return "Verification Failed";
    }
  };

  const getStatusDescription = () => {
    switch (status) {
      case "loading":
        return "Please wait while we verify your email address...";
      case "success":
        return "Your email has been verified. You will be redirected to your profile shortly.";
      case "error":
        return "We couldn't verify your email. Please check the link or request a new one.";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            {getStatusIcon()}
          </div>
          <CardTitle className="text-xl font-semibold">
            {getStatusTitle()}
          </CardTitle>
          <CardDescription>{getStatusDescription()}</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {message && (
            <p className="text-sm text-muted-foreground mb-4">{message}</p>
          )}

          {status === "error" && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">You can:</p>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(routes.LOGIN)}
                  className="w-full"
                >
                  Go to Login
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(routes.REGISTER)}
                  className="w-full"
                >
                  Create New Account
                </Button>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/" className="text-sm text-primary hover:underline">
            Back to Home
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
