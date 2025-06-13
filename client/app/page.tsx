"use client";

import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Separator } from "@/components/ui/separator";

export default function Home() {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background/40 z-10" />
        
        {/* User Menu */}
        <div className="absolute top-4 right-4 z-30">
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Button variant="outline" className="rounded-full">
                    {user?.name || user?.username}
                  </Button>
                </HoverCardTrigger>
                <HoverCardContent className="w-80">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">Welcome back!</h4>
                      <p className="text-sm text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                    <Separator />
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        onClick={() => router.push("/profile")}
                        className="w-full justify-start"
                      >
                        View Profile
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleLogout}
                        className="w-full justify-start text-destructive hover:text-destructive"
                      >
                        Sign Out
                      </Button>
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => router.push("/login")}
                className="rounded-full"
              >
                Sign In
              </Button>
              <Button
                onClick={() => router.push("/register")}
                className="rounded-full"
              >
                Sign Up
              </Button>
            </div>
          )}
        </div>
        
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="relative z-20 text-center space-y-8 px-4 max-w-5xl mx-auto"
        >
          <motion.div 
            variants={itemVariants}
            className="relative"
          >
            <h1 className="text-6xl md:text-8xl font-bold relative">
              <span className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                JustFlow
              </span>
              <span className="relative text-foreground/10">
                JustFlow
              </span>
            </h1>
          </motion.div>
          
          <motion.p 
            variants={itemVariants}
            className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto"
          >
            Streamline your workflow, boost productivity, and achieve more with our intelligent task management platform.
          </motion.p>
          
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            {isAuthenticated ? (
              <Button
                size="lg"
                onClick={() => router.push("/profile")}
                className="rounded-full px-8"
              >
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Button
                  size="lg"
                  onClick={() => router.push("/login")}
                  className="rounded-full px-8"
                >
                  Sign In
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => router.push("/register")}
                  className="rounded-full px-8"
                >
                  Get Started
                </Button>
              </>
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* Features Section */}
      <div className="py-20 px-4" ref={ref}>
        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={containerVariants}
          className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          <HoverCard>
            <HoverCardTrigger asChild>
              <motion.div variants={itemVariants} className="p-6 rounded-xl border bg-card cursor-pointer hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold mb-2">Smart Organization</h3>
                <p className="text-muted-foreground">
                  Automatically organize your tasks and projects with AI-powered categorization.
                </p>
              </motion.div>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">AI-Powered Organization</h4>
                <p className="text-sm text-muted-foreground">
                  Our AI analyzes your tasks and automatically categorizes them based on priority, deadline, and context.
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>

          <HoverCard>
            <HoverCardTrigger asChild>
              <motion.div variants={itemVariants} className="p-6 rounded-xl border bg-card cursor-pointer hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold mb-2">Real-time Collaboration</h3>
                <p className="text-muted-foreground">
                  Work seamlessly with your team members in real-time with instant updates.
                </p>
              </motion.div>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Team Collaboration</h4>
                <p className="text-sm text-muted-foreground">
                  Real-time updates, comments, and notifications keep your team in sync and productive.
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>

          <HoverCard>
            <HoverCardTrigger asChild>
              <motion.div variants={itemVariants} className="p-6 rounded-xl border bg-card cursor-pointer hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold mb-2">Analytics & Insights</h3>
                <p className="text-muted-foreground">
                  Get detailed insights into your productivity and workflow patterns.
                </p>
              </motion.div>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Performance Analytics</h4>
                <p className="text-sm text-muted-foreground">
                  Track your productivity metrics, identify bottlenecks, and optimize your workflow.
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>
        </motion.div>

        <Separator className="my-20" />

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center space-y-4"
        >
          <h2 className="text-3xl font-bold">Ready to Get Started?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Join thousands of users who have transformed their workflow with JustFlow.
          </p>
          <Button
            size="lg"
            onClick={() => router.push(isAuthenticated ? "/profile" : "/register")}
            className="rounded-full px-8 mt-4"
          >
            {isAuthenticated ? "Go to Dashboard" : "Start Free Trial"}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
