"use client";

import { useRouter } from "next/navigation";
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
} from "lucide-react";
import EmailVerificationBanner from "@/components/EmailVerificationBanner";
import VerificationGuard from "@/components/VerificationGuard";
import { getBlockedActions } from "@/lib/verificationGuard";
import { ServerUser } from "@/lib/server-api";
import routes from "@/lib/routes";

interface ProfileClientProps {
  user: ServerUser;
}

export default function ProfileClient({ user }: ProfileClientProps) {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push(routes.HOME);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Email Verification Banner */}
      <EmailVerificationBanner />

      <div className="container mx-auto p-6 max-w-4xl">
        {/* Profile Header */}
        <Card className="mb-8 overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600" />
          <div className="px-6 pt-0 pb-6 bg-white">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Avatar className="w-24 h-24 ring-4 ring-white bg-gray-200 relative z-10">
                <AvatarImage src={user?.avatarUrl} alt={user?.name} />
                <AvatarFallback className="text-3xl">
                  {user?.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 pt-4">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  {user?.name}
                  {user?.isEmailVerified && (
                    <Badge variant="secondary" className="ml-2">
                      <CheckCircle2 className="w-4 h-4 mr-1" /> Verified
                    </Badge>
                  )}
                </h1>
                <p className="text-lg text-gray-600">@{user?.username}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {user?.bio || "No bio provided"}
                </p>
              </div>
              <Button variant="outline" className="mt-4 sm:mt-4">
                <Edit className="w-4 h-4 mr-2" /> Edit Profile
              </Button>
            </div>
          </div>
        </Card>

        {/* Main Content with Tabs for Clear Sections */}
        <Tabs defaultValue="account" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="plan">Plan</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" /> Account Information
                </CardTitle>
                <CardDescription>
                  View and manage your personal details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="pr-4">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700">
                          Full Name
                        </label>
                        <p className="mt-1 text-sm text-gray-900">
                          {user?.name}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
                        <AtSign className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700">
                          Username
                        </label>
                        <p className="mt-1 text-sm text-gray-900">
                          @{user?.username}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                        <Mail className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700">
                          Email
                        </label>
                        <p className="mt-1 text-sm text-gray-900">
                          {user?.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
                        {user?.isEmailVerified ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-yellow-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700">
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
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                        <Info className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700">
                          Account Type
                        </label>
                        <p className="mt-1 text-sm text-gray-900">
                          {user?.type}
                        </p>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="plan">
            {user?.planDetails ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" /> Plan Information
                  </CardTitle>
                  <CardDescription>
                    Your current subscription details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                        <Package className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700">
                          Plan Name
                        </label>
                        <p className="mt-1 text-sm text-gray-900">
                          {user?.planDetails?.planName || "No plan"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700">
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
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                          <Calendar className="h-5 w-5 text-orange-600" />
                        </div>
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700">
                            Expires On
                          </label>
                          <p className="mt-1 text-sm text-gray-900">
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
                  <Button variant="outline">Manage Subscription</Button>
                </CardFooter>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-10 text-center">
                  <p className="text-gray-600">
                    No active plan. Upgrade to access premium features.
                  </p>
                  <Button className="mt-4">Upgrade Plan</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="settings">
            <div className="space-y-6">
              {/* Account Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" /> Account Settings
                  </CardTitle>
                  <CardDescription>
                    Manage your preferences and actions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <VerificationGuard action="update_profile">
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <Edit className="mr-2 h-4 w-4" /> Edit Profile
                      </Button>
                    </VerificationGuard>

                    <VerificationGuard action="manage_billing">
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <Settings className="mr-2 h-4 w-4" /> Privacy Settings
                      </Button>
                    </VerificationGuard>

                    <Button variant="outline" className="w-full justify-start">
                      <Bell className="mr-2 h-4 w-4" /> Notifications
                    </Button>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button variant="destructive" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" /> Sign Out
                  </Button>
                </CardFooter>
              </Card>

              {/* Restricted Actions for Unverified Users */}
              {!user?.isEmailVerified && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-yellow-600" />{" "}
                      Restricted Actions
                    </CardTitle>
                    <CardDescription>
                      The following actions require email verification
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {getBlockedActions(user).map((action) => (
                        <div
                          key={action}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                        >
                          <Lock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600 capitalize">
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
