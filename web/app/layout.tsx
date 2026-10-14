import type { Metadata, Viewport } from "next";
import "./globals.css";
import { QueryProvider }  from "@/providers/QueryProvider";
import { I18nProvider }   from "@/providers/I18nProvider";
import { AuthProvider }   from "@/providers/AuthProvider";
import { LangProvider }   from "@/providers/LangProvider";
import { ToastProvider }  from "@/components/ui/Toast";
import { ErrorBoundary }  from "@/components/shared/ErrorBoundary";
import { OfflineBanner }  from "@/components/shared/OfflineBanner";
import { BRAND }          from "@/lib/brand";

export const metadata: Metadata = {
  title:       { template: `%s | ${BRAND.name}`, default: BRAND.name },
  description: `${BRAND.name} — ${BRAND.tagline}`,
  manifest:    "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: BRAND.shortName },
  icons: {
    icon:  [{ url: "/icons/icon-192.png", sizes: "192x192" }],
    apple: [{ url: "/icons/icon-180.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor:   "#0B1B3A",
  width:        "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit:  "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // lang + dir are set dynamically by LangProvider on the client via useEffect
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head />
      <body className="font-body bg-offwhite text-navy antialiased">
        <ErrorBoundary>
          <I18nProvider>
            <QueryProvider>
              <AuthProvider>
                <LangProvider>
                  <ToastProvider>
                    {children}
                    <OfflineBanner />
                  </ToastProvider>
                </LangProvider>
              </AuthProvider>
            </QueryProvider>
          </I18nProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
