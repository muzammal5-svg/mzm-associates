import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us & Support — MZM Associates",
  description:
    "Get in touch with the Daily Diary MZM team. Direct support for Pakistani advocates and law firms via WhatsApp (+92 345 5421753), phone, and email.",
  keywords: [
    "Contact Daily Diary MZM",
    "MZM Associates Support",
    "Lawyer Software Helpline Pakistan",
    "Advocate Case Management Assistance",
  ],
  alternates: {
    canonical: "https://dailydiary-mzm.com/contact",
  },
  openGraph: {
    title: "Contact Us — Daily Diary MZM",
    description:
      "Reach out to Daily Diary MZM via WhatsApp, phone, or email. Dedicated customer support for legal practitioners in Pakistan.",
    url: "https://dailydiary-mzm.com/contact",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Contact Daily Diary MZM" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Us — Daily Diary MZM",
    description: "Support for Pakistani advocates via WhatsApp (+92 345 5421753) and email.",
    images: ["/og.png"],
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
