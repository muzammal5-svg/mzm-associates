import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Welcome — Modern Legal Practice Management",
  description:
    "Welcome to Daily Diary MZM. Transform your law practice with streamlined case management, court schedules, and client communications.",
  alternates: {
    canonical: "https://dailydiary-mzm.com/welcome",
  },
  openGraph: {
    title: "Welcome to Daily Diary MZM",
    description: "Modern legal practice management platform for advocates and law firms.",
    url: "https://dailydiary-mzm.com/welcome",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Welcome to Daily Diary MZM" }],
  },
};

export default function WelcomeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
