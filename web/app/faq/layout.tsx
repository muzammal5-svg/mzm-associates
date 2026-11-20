import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Frequently Asked Questions (FAQ) — Daily Diary MZM",
  description:
    "Got questions about Daily Diary MZM? Find answers regarding 7-day free trials, multi-device mobile sync, automated hearing reminders, cause list management, and security.",
  keywords: [
    "Daily Diary MZM FAQ",
    "Lawyer Diary Help",
    "Court Case Tracker Questions",
    "Advocate Software Pakistan FAQ",
  ],
  alternates: {
    canonical: "https://dailydiary-mzm.com/faq",
  },
  openGraph: {
    title: "FAQ — Daily Diary MZM Legal Case Management",
    description:
      "Find answers to common questions about Daily Diary MZM trial periods, device access, data security, and court cause lists.",
    url: "https://dailydiary-mzm.com/faq",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Daily Diary MZM FAQ" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "FAQ — Daily Diary MZM",
    description: "Answers to common questions about Daily Diary MZM legal software.",
    images: ["/og.png"],
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is Daily Diary MZM?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Daily Diary MZM is a comprehensive cloud-based legal practice and case management platform designed specifically for Pakistani advocates, legal consultants, and law firms."
      }
    },
    {
      "@type": "Question",
      "name": "Who can use Daily Diary MZM?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Daily Diary MZM is ideal for solo legal practitioners, senior advocates, law firms, and legal chambers managing multiple running cases, cause lists, and clients across Pakistani courts."
      }
    },
    {
      "@type": "Question",
      "name": "Is there a free trial available?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes! We offer a full-featured 7-day free trial with no upfront payment or credit card required."
      }
    },
    {
      "@type": "Question",
      "name": "How do hearing reminders work?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Daily Diary MZM sends automated reminders via web push notifications and in-app alerts ahead of scheduled hearing dates so you never miss a court appearance."
      }
    },
    {
      "@type": "Question",
      "name": "Is client and chamber data secure?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, Daily Diary MZM enforces strict Row Level Security (RLS), SSL/TLS encryption in transit, and encrypted cloud storage for all case documents and confidential client records."
      }
    }
  ]
};

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {children}
    </>
  );
}
