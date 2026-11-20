import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms and conditions governing the use of Daily Diary MZM Legal Case Management Platform.",
  alternates: {
    canonical: "https://dailydiary-mzm.com/terms",
  },
  openGraph: {
    title: "Terms of Service — Daily Diary MZM",
    description: "Terms and conditions for Daily Diary MZM legal software.",
    url: "https://dailydiary-mzm.com/terms",
  },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
