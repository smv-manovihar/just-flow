"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/authContext";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import EmailVerificationModal from "@/components/EmailVerificationModal";
import Link from "next/link";
import routes from "@/lib/routes";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const router = useRouter();
  const { login } = useAuth();
  const searchParams = useSearchParams();

  // Handle errors from query params after Google callback
  useEffect(() => {
    const err = searchParams.get("error");
    if (err) {
      switch (err) {
        case "email_exists":
          setError(
            "An account with this email already exists. Please sign in with your password."
          );
          break;
        case "provider_mismatch":
          setError("Provider mismatch. Please contact support.");
          break;
        case "no_code":
          setError("No authorization code received from Google.");
          break;
        case "server_error":
          setError(
            "An error occurred during Google authentication. Please try again."
          );
          break;
        case "google_auth_failed":
          setError("Failed to initiate Google authentication.");
          break;
        default:
          setError("An unknown error occurred during Google sign-in.");
      }
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login({ email, password });
      router.push(routes.PROFILE);
    } catch (error: unknown) {
      // Handle login errors
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response: { data: { message?: string } };
        };
        setError(
          axiosError.response?.data?.message || "An error occurred during login"
        );
      } else {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "An error occurred during login";
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationSuccess = () => {
    setShowVerificationModal(false);
    router.push(routes.PROFILE);
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    setError("");
    // Redirect to backend Google auth endpoint on port 5000
    window.location.href = "http://localhost:5000/api/auth/google";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-center">
            Sign in to your JustFlow account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email or Username
              </label>
              <input
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
                disabled={isLoading}
              />
            </div>
            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full mt-0.5"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              <FcGoogle className="mr-2" />
              Continue with Google
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>

      {showVerificationModal && (
        <EmailVerificationModal
          email={email}
          onClose={() => setShowVerificationModal(false)}
          onSuccess={handleVerificationSuccess}
        />
      )}
    </div>
  );
}
