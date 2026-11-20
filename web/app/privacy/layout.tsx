import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Learn how Daily Diary MZM protects advocate confidential data, case records, and client information.",
  alternates: {
    canonical: "https://dailydiary-mzm.com/privacy",
  },
  openGraph: {
    title: "Privacy Policy — Daily Diary MZM",
    description: "Data privacy standards and commitments for Daily Diary MZM legal software.",
    url: "https://dailydiary-mzm.com/privacy",
  },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
