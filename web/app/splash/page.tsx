"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { SplashScreen } from "@/components/shared/SplashScreen";
import Link from "next/link";

/**
 * /splash — entry point for Capacitor native app.
 * Shows the animated splash then offers sign-in / create-account when no session.
 */
export default function SplashPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [showChoice, setShowChoice] = useState(false);

  const handleDone = useCallback(() => {
    if (loading) {
      const interval = setInterval(() => {
        const session = typeof window !== "undefined"
          ? localStorage.getItem("sb-" + process.env.NEXT_PUBLIC_SUPABASE_URL?.split("//")[1]?.split(".")[0] + "-auth-token")
          : null;
        if (session) {
          clearInterval(interval);
          router.replace("/");
        } else {
          clearInterval(interval);
          setShowChoice(true);
        }
      }, 200);
      return;
    }
    if (user) router.replace("/");
    else setShowChoice(true);
  }, [user, loading, router]);

  if (showChoice) {
    return (
      <div className="min-h-dvh bg-navy-header flex flex-col items-center justify-center px-4 py-8 gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-heading font-bold text-white">MZM &amp; Associates</h1>
          <p className="text-sm text-white/70 mt-2">Welcome — choose how to continue</p>
        </div>
        <div className="w-full max-w-sm space-y-3">
          <Link href="/auth/sign-in" className="btn-primary w-full flex items-center justify-center gap-2">
            Sign in
          </Link>
          <Link href="/register" className="btn-outline w-full flex items-center justify-center gap-2">
            Create account
          </Link>
        </div>
      </div>
    );
  }

  return <SplashScreen onDone={handleDone} minDuration={1600} />;
}
