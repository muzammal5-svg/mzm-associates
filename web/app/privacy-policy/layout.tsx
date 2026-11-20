import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Official Privacy Policy for MZM Daily Diary (MZM & Associates). Comprehensive disclosure of data collection, encryption, security, and advocate/client rights under Google Play Store and legal compliance standards.",
  alternates: {
    canonical: "https://dailydiary-mzm.com/privacy-policy",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Privacy Policy — MZM Daily Diary | MZM & Associates",
    description:
      "Official Privacy Policy for MZM Daily Diary legal practice management system.",
    url: "https://dailydiary-mzm.com/privacy-policy",
  },
};

export default function PrivacyPolicyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
