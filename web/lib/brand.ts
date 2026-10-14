/**
 * Brand constants for MZM & Associates.
 * All colours reference the Tailwind tokens — import from here, never hardcode.
 */

export const BRAND = {
  name:        "MZM & Associates",
  shortName:   "MZM",
  tagline:     "Advocates & Legal Consultants",
  timezone:    "Asia/Karachi",
  dateFormat:  "dd MMM yyyy",   // date-fns format token
  dateLocale:  "en-PK",

  colors: {
    gold:      "#8A6414",
    navy:      "#0B1B3A",
    offwhite:  "#F7F7F4",
    success:   "#1F7A4D",
    danger:    "#C0392B",
  },
} as const;

export type BrandColor = keyof typeof BRAND.colors;
