import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing Plans — Transparent Subscriptions in PKR",
  description:
    "Affordable, transparent pricing plans for individual Pakistani advocates and law firms. Starting at PKR 1,000/month with a 7-day free trial. No credit card required.",
  keywords: [
    "Lawyer Diary Pricing Pakistan",
    "Legal Software Subscription PKR",
    "Advocate Case Management Cost",
    "Affordable Law Firm Software",
    "Free Trial Legal Diary",
  ],
  alternates: {
    canonical: "https://dailydiary-mzm.com/pricing",
  },
  openGraph: {
    title: "Pricing Plans — Daily Diary MZM Legal Case Management",
    description:
      "Simple, transparent pricing in PKR for Pakistani lawyers. Monthly, 6-Month, and Yearly plans with a 7-day free trial.",
    url: "https://dailydiary-mzm.com/pricing",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Daily Diary MZM Pricing" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing Plans — Daily Diary MZM",
    description: "Affordable case management software for lawyers starting at PKR 1,000/month.",
    images: ["/og.png"],
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
