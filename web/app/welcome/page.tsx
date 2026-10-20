"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { Landing } from "@/components/marketing/Landing";
import { SITE } from "@/lib/siteConfig";

export default function WelcomePage() {
  const { user, loading, configured } = useAuth();
  const router = useRouter();

  // Logged-in users get the dashboard; "/" already renders the landing for
  // visitors, so /welcome exists mainly as a stable marketing URL.
  useEffect(() => {
    if (!configured || loading) return;
    if (user) router.replace("/");
  }, [user, loading, configured, router]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": SITE.name,
    "email": SITE.email,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Landing />
    </>
  );
}
