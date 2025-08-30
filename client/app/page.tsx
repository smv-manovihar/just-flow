"use client";

import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Separator } from "@/components/ui/separator";
import { RainbowButton } from "@/components/magicui/rainbow-button";
import { ChevronRight } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { ShinyButton } from "@/components/magicui/shiny-button";

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
    <div className="min-h-screen bg-background dark:bg-gray-900">
      <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background/40 dark:from-gray-900 dark:via-gray-800/80 dark:to-gray-900/40 z-10" />

        <div className="absolute top-4 right-4 z-30">
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Button
                    variant="outline"
                    className="rounded-full border-foreground/20 dark:border-gray-700"
                  >
                    {user?.name || user?.username}
                  </Button>
                </HoverCardTrigger>
                <HoverCardContent className="w-80 bg-background dark:bg-gray-800 border-foreground/20 dark:border-gray-700">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-foreground dark:text-gray-200">
                        Welcome back!
                      </h4>
                      <p className="text-sm text-muted-foreground dark:text-gray-400">
                        {user?.email}
                      </p>
                    </div>
                    <Separator className="bg-foreground/20 dark:bg-gray-700" />
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        onClick={() => router.push("/profile")}
                        className="w-full justify-start border-foreground/20 dark:border-gray-700 text-foreground dark:text-gray-200"
                      >
                        View Profile
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleLogout}
                        className="w-full justify-start text-destructive hover:text-destructive dark:text-red-400 dark:hover:text-red-300"
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
              <ThemeToggle />
              <Button
                variant="outline"
                onClick={() => router.push("/login")}
                className="rounded-full border-foreground/20 dark:border-gray-700 text-foreground dark:text-gray-200"
              >
                Sign In
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
          <motion.div variants={itemVariants} className="relative">
            <h1 className="text-6xl md:text-8xl font-bold font-engagement relative leading-none">
              <span className="absolute inset-0 flex justify-center items-center -z-10 pointer-events-none">
                <span className="bg-gradient-to-b from-blue-500 via-indigo-600 to-purple-400 dark:from-blue-400 dark:via-indigo-500 dark:to-purple-300 bg-clip-text text-transparent filter blur-3xl opacity-40 animate-pulse">
                  JustFlow
                </span>
              </span>
              <span className="absolute inset-0 bg-gradient-to-b from-blue-500 via-indigo-600 to-purple-400 dark:from-blue-400 dark:via-indigo-500 dark:to-purple-300 bg-clip-text text-transparent drop-shadow-[0_8px_32px_rgba(99,102,241,0.35)]">
                JustFlow
              </span>
              <span className="relative text-foreground/10 dark:text-gray-700/10 ">
                JustFlow
              </span>
            </h1>
          </motion.div>

          <motion.p
            variants={itemVariants}
            className="text-xl md:text-2xl text-muted-foreground dark:text-gray-400 max-w-2xl mx-auto text-nowrap font-lobster"
          >
            Where memories, ideas, and productivity flow together
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            {isAuthenticated ? (
              <RainbowButton
                size="lg"
                onClick={() => router.push("/profile")}
                className="rounded-full px-8"
              >
                Go to Dashboard{" "}
                <ChevronRight className="w-4 h-4 ml-2 transition-transform duration-300 ease-in-out group-hover:translate-x-1" />
              </RainbowButton>
            ) : (
              <>
                <RainbowButton
                  size="lg"
                  onClick={() => router.push("/login")}
                  className="rounded-full px-8"
                >
                  Sign In{" "}
                  <ChevronRight className="w-4 h-4 ml-2 transition-transform duration-300 ease-in-out group-hover:translate-x-1" />
                </RainbowButton>
                <RainbowButton
                  variant="outline"
                  size="lg"
                  onClick={() => router.push("/register")}
                  className="rounded-full px-8 border-foreground/20 dark:border-gray-700"
                >
                  Get Started{" "}
                  <ChevronRight className="w-4 h-4 ml-2 transition-transform duration-300 ease-in-out group-hover:translate-x-1" />
                </RainbowButton>
              </>
            )}
          </motion.div>
        </motion.div>
      </div>

      <div className="py-20 px-4" ref={ref}>
        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={containerVariants}
          className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          <HoverCard>
            <HoverCardTrigger asChild>
              <motion.div
                variants={itemVariants}
                className="p-6 rounded-xl border bg-card dark:bg-gray-800 border-foreground/20 dark:border-gray-700 cursor-pointer hover:shadow-lg transition-shadow"
              >
                <h3 className="text-xl font-semibold mb-2 text-foreground dark:text-gray-200">
                  Smart Organization
                </h3>
                <p className="text-muted-foreground dark:text-gray-400">
                  Automatically organize your tasks and projects with AI-powered
                  categorization.
                </p>
              </motion.div>
            </HoverCardTrigger>
            <HoverCardContent className="w-80 bg-background dark:bg-gray-800 border-foreground/20 dark:border-gray-700">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-foreground dark:text-gray-200">
                  AI-Powered Organization
                </h4>
                <p className="text-sm text-muted-foreground dark:text-gray-400">
                  Our AI analyzes your tasks and automatically categorizes them
                  based on priority, deadline, and context.
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>

          <HoverCard>
            <HoverCardTrigger asChild>
              <motion.div
                variants={itemVariants}
                className="p-6 rounded-xl border bg-card dark:bg-gray-800 border-foreground/20 dark:border-gray-700 cursor-pointer hover:shadow-lg transition-shadow"
              >
                <h3 className="text-xl font-semibold mb-2 text-foreground dark:text-gray-200">
                  Real-time Collaboration
                </h3>
                <p className="text-muted-foreground dark:text-gray-400">
                  Work seamlessly with your team members in real-time with
                  instant updates.
                </p>
              </motion.div>
            </HoverCardTrigger>
            <HoverCardContent className="w-80 bg-background dark:bg-gray-800 border-foreground/20 dark:border-gray-700">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-foreground dark:text-gray-200">
                  Team Collaboration
                </h4>
                <p className="text-sm text-muted-foreground dark:text-gray-400">
                  Real-time updates, comments, and notifications keep your team
                  in sync and productive.
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>

          <HoverCard>
            <HoverCardTrigger asChild>
              <motion.div
                variants={itemVariants}
                className="p-6 rounded-xl border bg-card dark:bg-gray-800 border-foreground/20 dark:border-gray-700 cursor-pointer hover:shadow-lg transition-shadow"
              >
                <h3 className="text-xl font-semibold mb-2 text-foreground dark:text-gray-200">
                  Analytics & Insights
                </h3>
                <p className="text-muted-foreground dark:text-gray-400">
                  Get detailed insights into your productivity and workflow
                  patterns.
                </p>
              </motion.div>
            </HoverCardTrigger>
            <HoverCardContent className="w-80 bg-background dark:bg-gray-800 border-foreground/20 dark:border-gray-700">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-foreground dark:text-gray-200">
                  Performance Analytics
                </h4>
                <p className="text-sm text-muted-foreground dark:text-gray-400">
                  Track your productivity metrics, identify bottlenecks, and
                  optimize your workflow.
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>
        </motion.div>

        <Separator className="my-20 bg-foreground/20 dark:bg-gray-700" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center space-y-4"
        >
          <h2 className="text-3xl font-bold text-foreground dark:text-gray-200">
            Ready to Get Started?
          </h2>
          <p className="text-muted-foreground dark:text-gray-400 max-w-2xl mx-auto">
            Join thousands of users who have transformed their workflow with
            JustFlow.
          </p>
          <ShinyButton
            onClick={() =>
              router.push(isAuthenticated ? "/profile" : "/register")
            }
            className="rounded-full px-8 mt-4 text-white shadow-md shadow-black/30 dark:shadow-white/10"
          >
            {isAuthenticated ? "Go to Dashboard" : "Start Free Trial"}
          </ShinyButton>
        </motion.div>
      </div>
    </div>
  );
}
