import type { Metadata, Viewport } from "next";
import "./globals.css";
import { QueryProvider }  from "@/providers/QueryProvider";
import { I18nProvider }   from "@/providers/I18nProvider";
import { AuthProvider }   from "@/providers/AuthProvider";
import { SubscriptionProvider } from "@/providers/SubscriptionProvider";
import { LangProvider }   from "@/providers/LangProvider";
import { ToastProvider }  from "@/components/ui/Toast";
import { ErrorBoundary }  from "@/components/shared/ErrorBoundary";
import { OfflineBanner }  from "@/components/shared/OfflineBanner";
import { BRAND }          from "@/lib/brand";
import { Analytics }      from "@vercel/analytics/next";

export const metadata: Metadata = {
  metadataBase: new URL("https://dailydiary-mzm.com"),
  title: {
    template: "%s | Daily Diary MZM",
    default: "Daily Diary MZM | Legal Case Management & Law Practice Software",
  },
  description:
    "Pakistan's premier cloud-based legal case management system and court diary for advocates, lawyers, and law firms. Track court hearings, daily cause lists, case files, client records, and automated hearing reminders effortlessly.",
  applicationName: "Daily Diary MZM",
  keywords: [
    "Daily Diary MZM",
    "MZM Associates",
    "Legal Case Management Software Pakistan",
    "Lawyer Diary Software Pakistan",
    "Advocate Case Management System",
    "Law Firm Management Software Pakistan",
    "Court Diary Pakistan",
    "Cause List Manager",
    "Hearing Reminder App for Lawyers",
    "Lahore High Court Diary",
    "Islamabad High Court Case Tracker",
    "Supreme Court of Pakistan Diary",
    "Advocate Munshi Diary Online",
    "Digital Legal Diary Pakistan",
    "Chamber Management Software",
  ],
  authors: [{ name: "MZM Associates", url: "https://dailydiary-mzm.com" }],
  creator: "MZM Associates",
  publisher: "MZM Associates",
  category: "Legal Software",
  formatDetection: {
    email: true,
    address: true,
    telephone: true,
  },
  alternates: {
    canonical: "https://dailydiary-mzm.com",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_PK",
    alternateLocale: ["ur_PK"],
    url: "https://dailydiary-mzm.com",
    siteName: "Daily Diary MZM",
    title: "Daily Diary MZM | Legal Case Management & Law Practice Software",
    description:
      "Pakistan's premier cloud-based legal case management system and court diary for advocates, lawyers, and law firms. Manage court hearings, cause lists, case files, and client records effortlessly.",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Daily Diary MZM - Legal Case Management Software for Advocates",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Daily Diary MZM | Legal Case Management & Law Practice Software",
    description:
      "Manage court cases, hearings, cause lists, and client diaries seamlessly with Daily Diary MZM.",
    images: ["/og.png"],
  },
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: BRAND.shortName },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", sizes: "64x64", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
      { url: "/icons/icon-180.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: ["/favicon.ico"],
  },
};

export const viewport: Viewport = {
  themeColor:   "#0B1B3A",
  width:        "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit:  "cover",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "@id": "https://dailydiary-mzm.com/#software",
      "name": "Daily Diary MZM",
      "operatingSystem": "Web, Android, iOS",
      "applicationCategory": "BusinessApplication",
      "applicationSubCategory": "Legal Case Management",
      "description":
        "Pakistan's premier cloud-based legal case management system and court diary for advocates, lawyers, and law firms. Track hearings, cause lists, case records, and automated reminders.",
      "url": "https://dailydiary-mzm.com",
      "image": "https://dailydiary-mzm.com/og.png",
      "screenshot": "https://dailydiary-mzm.com/og.png",
      "offers": {
        "@type": "Offer",
        "price": "1000",
        "priceCurrency": "PKR",
        "priceValidUntil": "2027-12-31",
        "availability": "https://schema.org/InStock",
        "category": "SoftwareSubscription",
      },
      "featureList": [
        "Real-time Court Cause List management",
        "Daily hearing schedules and next date tracking",
        "Automated hearing alerts and notifications",
        "Client management and case history records",
        "Secure legal document storage",
        "Advocate team and clerk collaboration",
      ],
      "creator": {
        "@type": "LegalService",
        "@id": "https://dailydiary-mzm.com/#organization",
      },
    },
    {
      "@type": "LegalService",
      "@id": "https://dailydiary-mzm.com/#organization",
      "name": "MZM Associates",
      "alternateName": "Daily Diary MZM",
      "url": "https://dailydiary-mzm.com",
      "logo": "https://dailydiary-mzm.com/icons/icon-512.png",
      "image": "https://dailydiary-mzm.com/og.png",
      "telephone": "+923455421753",
      "email": "muhammad.zahid.muneer@outlook.com",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Chamber No 27, Haroon Ur Rasheed Block, F-8",
        "addressLocality": "Islamabad",
        "addressRegion": "Islamabad Capital Territory",
        "addressCountry": "PK",
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+923455421753",
        "contactType": "customer service",
        "areaServed": "PK",
        "availableLanguage": ["English", "Urdu"],
      },
    },
    {
      "@type": "WebSite",
      "@id": "https://dailydiary-mzm.com/#website",
      "url": "https://dailydiary-mzm.com",
      "name": "Daily Diary MZM",
      "description": "Legal Case Management & Court Diary for Advocates in Pakistan",
      "publisher": {
        "@id": "https://dailydiary-mzm.com/#organization",
      },
      "inLanguage": ["en-PK", "ur-PK"],
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // lang + dir are set dynamically by LangProvider on the client via useEffect
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-body bg-offwhite text-navy antialiased">
        <ErrorBoundary>
          <I18nProvider>
            <QueryProvider>
              <AuthProvider>
                <SubscriptionProvider>
                  <LangProvider>
                    <ToastProvider>
                      {children}
                      <OfflineBanner />
                    </ToastProvider>
                  </LangProvider>
                </SubscriptionProvider>
              </AuthProvider>
            </QueryProvider>
          </I18nProvider>
        </ErrorBoundary>
        <Analytics />
      </body>
    </html>
  );
}
