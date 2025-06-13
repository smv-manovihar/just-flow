"use client";

import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";

export default function ProfilePage() {
  const { user, logout, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/");
      } else {
        setIsLoading(false);
      }
    }
  }, [user, authLoading]); // Removed router from dependencies

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (isLoading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header Section - Avatar Removed */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{user?.name}</h1>
        <p className="text-xl text-gray-600">@{user?.username}</p>
      </div>

      {/* Account Information */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>
            Manage your account settings and preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <p className="mt-1 text-sm text-gray-900">{user?.name}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <p className="mt-1 text-sm text-gray-900">{user?.username}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <p className="mt-1 text-sm text-gray-900">{user?.email}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Account Type
              </label>
              <p className="mt-1 text-sm text-gray-900">{user?.type}</p>
            </div>

            <Separator />

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Bio
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {user?.bio || "No bio provided"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plan Information */}
      {user?.planDetails && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Plan Information</CardTitle>
            <CardDescription>
              Your current subscription details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Plan Name
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {user?.planDetails?.planName || "No plan"}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {user?.planDetails?.isActive ? "Active" : "Inactive"}
                  {user?.planDetails?.isTrial ? " (Trial)" : ""}
                </p>
              </div>

              {user?.planDetails?.expiresAt && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Expires On
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(user.planDetails.expiresAt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Account Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Account Actions</CardTitle>
          <CardDescription>
            Manage your account settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <Button variant="outline">Edit Profile</Button>
            <Button variant="outline">Settings</Button>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="destructive" onClick={handleLogout}>
            Sign Out
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
