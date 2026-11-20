import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy",
  description: "Subscription cancellation and refund policy for Daily Diary MZM Legal Case Management System.",
  alternates: {
    canonical: "https://dailydiary-mzm.com/refund-policy",
  },
  openGraph: {
    title: "Refund Policy — Daily Diary MZM",
    description: "Subscription cancellation and refund policy details.",
    url: "https://dailydiary-mzm.com/refund-policy",
  },
};

export default function RefundPolicyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
