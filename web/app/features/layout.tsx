import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Features — Case Tracking, Cause List & Hearing Reminders",
  description:
    "Explore dedicated law practice features for Pakistani advocates: real-time court cause list tracking, hearing schedule reminders, client diary, case document vault, and clerk collaboration.",
  keywords: [
    "Lawyer Case Management Features",
    "Court Cause List Tracker",
    "Hearing Date Reminders",
    "Legal Document Vault Pakistan",
    "Advocate Diary System",
    "Client Management for Lawyers",
  ],
  alternates: {
    canonical: "https://dailydiary-mzm.com/features",
  },
  openGraph: {
    title: "Features — Daily Diary MZM Legal Case Management",
    description:
      "Modern law practice management designed for Pakistani advocates. Track cause lists, hearing dates, client files, and documents effortlessly.",
    url: "https://dailydiary-mzm.com/features",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Daily Diary MZM Features" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Features — Daily Diary MZM Legal Case Management",
    description:
      "Real-time court cause lists, hearing schedule reminders, and case tracking for advocates.",
    images: ["/og.png"],
  },
};

export default function FeaturesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
