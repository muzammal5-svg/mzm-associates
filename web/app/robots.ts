import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://dailydiary-mzm.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/features",
          "/pricing",
          "/faq",
          "/contact",
          "/welcome",
          "/register",
          "/terms",
          "/privacy",
          "/refund-policy",
        ],
        disallow: [
          "/admin",
          "/admin/*",
          "/cases",
          "/cases/*",
          "/clients",
          "/clients/*",
          "/hearings",
          "/hearings/*",
          "/cause-list",
          "/cause-list/*",
          "/documents",
          "/documents/*",
          "/important-forms",
          "/important-forms/*",
          "/case-laws",
          "/case-laws/*",
          "/reminders",
          "/reminders/*",
          "/settings",
          "/settings/*",
          "/billing",
          "/billing/*",
          "/notifications",
          "/notifications/*",
          "/profile",
          "/profile/*",
          "/auth",
          "/auth/*",
          "/api",
          "/api/*",
          "/design-system",
          "/design-system/*",
          "/splash",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
