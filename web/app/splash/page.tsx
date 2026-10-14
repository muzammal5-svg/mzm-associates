"use client";

import { useCallback } from "react";
import { useRouter }   from "next/navigation";
import { useAuth }     from "@/providers/AuthProvider";
import { SplashScreen } from "@/components/shared/SplashScreen";

/**
 * /splash — entry point for Capacitor native app.
 * Shows the animated splash then redirects based on session state.
 * Web PWA hits "/" directly (which has its own loading state).
 */
export default function SplashPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleDone = useCallback(() => {
    if (loading) {
      // Auth not resolved yet — wait a tick and re-check
      const interval = setInterval(() => {
        // useAuth state is live via closure-captured values; re-read from storage
        const session = typeof window !== "undefined"
          ? localStorage.getItem("sb-" + process.env.NEXT_PUBLIC_SUPABASE_URL?.split("//")[1]?.split(".")[0] + "-auth-token")
          : null;
        if (session) {
          clearInterval(interval);
          router.replace("/");
        } else {
          clearInterval(interval);
          router.replace("/auth/sign-in");
        }
      }, 200);
      return;
    }
    router.replace(user ? "/" : "/auth/sign-in");
  }, [user, loading, router]);

  return <SplashScreen onDone={handleDone} minDuration={1600} />;
}
