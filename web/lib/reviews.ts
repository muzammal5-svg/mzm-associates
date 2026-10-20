/**
 * Landing page review data.
 *
 * These are SAMPLE entries, clearly marked. No real-sounding people are
 * invented as facts. Set SHOW_REVIEWS in lib/siteConfig.ts to true only after
 * real reviews are added; in dev the "Sample" badge is shown.
 */
export interface Review {
  initials: string;
  name: string;
  role: string;
  firm: string;
  quote: string;
  stars: number; // 1-5
  sample: boolean;
}

export const REVIEWS: Review[] = [
  {
    initials: "AR",
    name: "A. Rahman",
    role: "Advocate",
    firm: "Rahman & Co.",
    quote: "The cause list alone saves me two hours a day. Reminders just work.",
    stars: 5,
    sample: true,
  },
  {
    initials: "SK",
    name: "S. Khan",
    role: "Senior Partner",
    firm: "Khan Associates",
    quote: "Finally a case management tool built for how Pakistani lawyers actually work.",
    stars: 5,
    sample: true,
  },
  {
    initials: "MJ",
    name: "M. Javaid",
    role: "Clerk",
    firm: "Javaid Legal",
    quote: "Urdu interface made onboarding the team painless.",
    stars: 4,
    sample: true,
  },
];