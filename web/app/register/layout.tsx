import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register Law Firm — 7-Day Free Trial",
  description:
    "Register your law firm or independent advocate chamber on Daily Diary MZM. Instant setup with 7 days free trial. Start managing cases, cause lists, and hearings today.",
  keywords: [
    "Register Lawyer Diary",
    "Law Firm Registration Pakistan",
    "Create Advocate Account",
    "Legal Case Management Signup",
  ],
  alternates: {
    canonical: "https://dailydiary-mzm.com/register",
  },
  openGraph: {
    title: "Register Chamber — Daily Diary MZM",
    description:
      "Join Daily Diary MZM. Free 7-day trial with full access to court diary, cause lists, and client tracking.",
    url: "https://dailydiary-mzm.com/register",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Register Daily Diary MZM" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Register Chamber — Daily Diary MZM",
    description: "Start your 7-day free trial on Pakistan's premier legal case management platform.",
    images: ["/og.png"],
  },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
