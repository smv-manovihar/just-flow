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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  User,
  Mail,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Edit,
  Settings,
  Info,
  Calendar,
  Bell,
  Package,
  AtSign,
  Lock,
  Loader2,
  Trash2,
} from "lucide-react";
import EmailVerificationBanner from "@/components/email-verification/EmailVerificationBanner";
import VerificationGuard from "@/components/email-verification/VerificationGuard";
import { getBlockedActions } from "@/lib/verificationGuard";
import { useState, useEffect } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import routes from "@/lib/routes";

// New: AlertDialog for destructive confirmation
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

import { deleteAccount } from "@/api/auth.api";

export default function ProfilePage() {
  const { user, logout, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.replace(routes.HOME); // Use replace to prevent back navigation
      } else {
        setIsLoading(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  const handleLogout = async () => {
    try {
      await logout();
      router.replace(routes.HOME); // Use replace for direct redirect without history
    } catch (error) {
      console.error("Logout error:", error);
      router.replace(routes.HOME); // Redirect even on error
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      if (!user) return;
      await deleteAccount(user.id);
      await logout();
      router.replace(routes.HOME); // Use replace for direct redirect
    } catch (error) {
      console.error("Delete account error:", error);
      router.replace(routes.HOME); // Redirect even on error
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <p className="text-lg font-medium text-gray-600 dark:text-gray-300">
          Loading profile...
        </p>
      </div>
    );
  }

  const getInitials = (name: string | undefined) =>
    name
      ? name
          .split(" ")
          .map((part) => part)
          .join("")
          .slice(0, 2)
          .toUpperCase()
      : "U";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <EmailVerificationBanner />

      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 max-w-4xl">
        {/* Profile Header */}
        <Card className="mb-6 overflow-hidden shadow-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="h-20 sm:h-24 bg-gradient-to-r from-blue-600 to-indigo-700" />
          <div className="relative -mt-12 px-4 sm:px-6 pb-6">
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
              <Avatar className="w-20 h-20 sm:w-24 sm:h-24 ring-4 ring-white dark:ring-gray-800 bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-gray-800">
                <AvatarImage
                  src={user?.avatar}
                  alt={user?.name || "User avatar"}
                  className="object-cover"
                />
                <AvatarFallback className="text-xl sm:text-2xl font-medium">
                  {getInitials(user?.name)}
                </AvatarFallback>
              </Avatar>

              <div className="text-center md:text-left flex-1 w-full">
                <div className="flex flex-col items-center md:items-start gap-2">
                  <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    {user?.name}
                    {user?.isEmailVerified && (
                      <Badge variant="secondary" className="text-xs">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Verified
                      </Badge>
                    )}
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 break-all">
                    @{user?.username}
                  </p>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
                  {user?.bio || "No bio provided"}
                </p>
              </div>

              <div className="flex items-center gap-2 mt-2 md:mt-0">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="account" className="space-y-6">
          <TabsList
            className="
              grid w-full grid-cols-3 rounded-lg
              bg-gray-100 dark:bg-gray-800 p-1
              sticky top-0 z-10
              backdrop-blur supports-[backdrop-filter]:bg-gray-100/75 dark:supports-[backdrop-filter]:bg-gray-800/75
            "
          >
            <TabsTrigger
              value="account"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400"
            >
              Account
            </TabsTrigger>
            <TabsTrigger
              value="plan"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400"
            >
              Plan
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400"
            >
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Account Info */}
          <TabsContent value="account">
            <Card className="shadow-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <User className="w-5 h-5" /> Account Information
                </CardTitle>
                <CardDescription className="text-gray-500 dark:text-gray-400">
                  View and manage personal details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[420px] pr-3 sm:pr-4">
                  <div className="space-y-5">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Full Name
                        </label>
                        <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                          {user?.name}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900">
                        <AtSign className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Username
                        </label>
                        <p className="mt-1 text-sm text-gray-900 dark:text-gray-100 break-all">
                          @{user?.username}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                        <Mail className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Email
                        </label>
                        <p className="mt-1 text-sm text-gray-900 dark:text-gray-100 break-all">
                          {user?.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900">
                        {user?.isEmailVerified ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-yellow-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Email Verification
                        </label>
                        <Badge
                          variant={
                            user?.isEmailVerified ? "secondary" : "destructive"
                          }
                          className="mt-1"
                        >
                          {user?.isEmailVerified ? "Verified" : "Not Verified"}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                        <Lock className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Password Status
                        </label>
                        <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                          {user?.hasPassword ? "Set" : "Not set"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                        <Info className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Account Type
                        </label>
                        <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                          {user?.type}
                        </p>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Plan Info */}
          <TabsContent value="plan">
            {user?.planDetails ? (
              <Card className="shadow-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                    <Calendar className="w-5 h-5" /> Plan Information
                  </CardTitle>
                  <CardDescription className="text-gray-500 dark:text-gray-400">
                    Current subscription details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-5">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                        <Package className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Plan Name
                        </label>
                        <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                          {user?.planDetails?.planName || "No plan"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Status
                        </label>
                        <Badge
                          variant={
                            user?.planDetails?.isActive
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {user?.planDetails?.isActive ? "Active" : "Inactive"}
                          {user?.planDetails?.isTrial ? " (Trial)" : ""}
                        </Badge>
                      </div>
                    </div>

                    {user?.planDetails?.expiresAt && (
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900">
                          <Calendar className="h-5 w-5 text-orange-600" />
                        </div>
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Expires On
                          </label>
                          <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                            {new Date(
                              user.planDetails.expiresAt
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <VerificationGuard action="manage_billing">
                    <Button variant="outline" size="sm">
                      Manage Subscription
                    </Button>
                  </VerificationGuard>
                </CardFooter>
              </Card>
            ) : (
              <Card className="shadow-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <CardContent className="py-8 text-center">
                  <p className="text-gray-600 dark:text-gray-400">
                    No active plan. Upgrade to access premium features.
                  </p>
                  <VerificationGuard action="manage_billing">
                    <Button className="mt-4">Upgrade Plan</Button>
                  </VerificationGuard>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Settings */}
          <TabsContent value="settings">
            <div className="space-y-6">
              <Card className="shadow-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                    <Settings className="w-5 h-5" /> Account Settings
                  </CardTitle>
                  <CardDescription className="text-gray-500 dark:text-gray-400">
                    Manage preferences and actions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <VerificationGuard action="update_profile">
                      <Button
                        variant="outline"
                        className="w-full justify-start text-sm"
                      >
                        <Edit className="mr-2 h-4 w-4" /> Edit Profile
                      </Button>
                    </VerificationGuard>

                    <VerificationGuard action="manage_billing">
                      <Button
                        variant="outline"
                        className="w-full justify-start text-sm"
                      >
                        <Settings className="mr-2 h-4 w-4" /> Privacy Settings
                      </Button>
                    </VerificationGuard>

                    <Button
                      variant="outline"
                      className="w-full justify-start text-sm"
                    >
                      <Bell className="mr-2 h-4 w-4" /> Notifications
                    </Button>
                  </div>

                  {/* Danger Zone */}
                  <div className="mt-6 rounded-lg border border-red-200 dark:border-red-800 bg-red-50/60 dark:bg-red-900/20 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-red-700 dark:text-red-300">
                          Danger Zone
                        </p>
                        <p className="text-sm text-red-700/80 dark:text-red-400/80 mt-1">
                          Permanently delete the account and all associated
                          data.
                        </p>
                      </div>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="shrink-0"
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Account
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete account?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will
                              permanently delete the account and remove all
                              associated data.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel disabled={isDeleting}>
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleDeleteAccount}
                              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                              disabled={isDeleting}
                            >
                              {isDeleting ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                                  Deleting...
                                </>
                              ) : (
                                "Delete"
                              )}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex justify-end">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" /> Sign Out
                  </Button>
                </CardFooter>
              </Card>

              {!user?.isEmailVerified && (
                <Card className="shadow-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                      <AlertCircle className="w-5 h-5" /> Restricted Actions
                    </CardTitle>
                    <CardDescription className="text-gray-500 dark:text-gray-400">
                      The following actions require email verification
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {getBlockedActions(user).map((action) => (
                        <div
                          key={action}
                          className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                        >
                          <Lock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                            {action.replace("_", " ")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
