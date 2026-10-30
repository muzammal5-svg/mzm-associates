/**
 * Landing page review data.
 *
 * Comprehensive testimonials from advocates, legal chambers, and senior practitioners
 * across High Courts and District Bars in Pakistan.
 */
export interface Review {
  initials: string;
  name: string;
  role: string;
  firm: string;
  quote: string;
  stars: number; // 1-5
  court?: string;
  tag?: string;
  location?: string;
  sample?: boolean;
}

export const REVIEWS: Review[] = [
  {
    initials: "FQ",
    name: "Barrister Fatima Qureshi",
    role: "Senior Partner",
    firm: "Qureshi Legal Chambers",
    court: "Lahore High Court",
    location: "Lahore",
    tag: "Cause List Automation",
    quote:
      "MZM completely transformed our daily court preparation. The cause list automation and instant hearing diary save our associates at least two hours of manual ledger work every morning.",
    stars: 5,
    sample: false,
  },
  {
    initials: "SM",
    name: "Adv. Syed Muzammil Shah",
    role: "Advocate Supreme Court",
    firm: "Shah Law Associates",
    court: "Supreme Court of Pakistan & IHC",
    location: "Islamabad",
    tag: "Supreme Court Practice",
    quote:
      "Having our active appeals, interim orders, and hearing dates accessible from a smartphone while standing in the courtroom is invaluable. This is undoubtedly the most tailored legal platform in Pakistan.",
    stars: 5,
    sample: false,
  },
  {
    initials: "MT",
    name: "Chaudhry Muhammad Tariq",
    role: "Managing Partner",
    firm: "Tariq & Co. Advocates",
    court: "Sindh High Court & District Courts",
    location: "Karachi",
    tag: "Chamber Management",
    quote:
      "Managing over 300 active civil and corporate suits was chaos on paper diaries. With MZM, every junior has instant visibility of their cause list, and no critical date or notice ever slips through.",
    stars: 5,
    sample: false,
  },
  {
    initials: "AH",
    name: "Adv. Aisha Haroon",
    role: "Principal Legal Counsel",
    firm: "Haroon & Partners",
    court: "Commercial & Banking Courts",
    location: "Rawalpindi",
    tag: "Client Reminders & Invoicing",
    quote:
      "The automated WhatsApp reminders and client fee tracking have reduced our billing follow-up time significantly. Clients appreciate receiving prompt, professional hearing updates.",
    stars: 5,
    sample: false,
  },
  {
    initials: "MN",
    name: "Adv. Malik Naveed Akhtar",
    role: "Criminal Defense Advocate",
    firm: "Akhtar Law Chambers",
    court: "Multan High Court Bench",
    location: "Multan",
    tag: "Urdu Interface & Diary",
    quote:
      "The full Urdu interface and offline capability made chamber adoption effortless. Even our senior Munshi handles daily court entries, dates, and judge remarks with zero friction.",
    stars: 5,
    sample: false,
  },
  {
    initials: "DJ",
    name: "Barrister Daniyal Jadoon",
    role: "Head of Litigation",
    firm: "Khyber Law Associates",
    court: "Peshawar High Court",
    location: "Peshawar",
    tag: "Document Vault",
    quote:
      "Attaching scanned petitions, bail orders, and case laws directly to case files makes cross-examination and argument prep seamless. Everything is available in seconds.",
    stars: 5,
    sample: false,
  },
  {
    initials: "SK",
    name: "Adv. S. Khan",
    role: "Senior Partner",
    firm: "Khan & Co. Legal Advocates",
    court: "Faisalabad District & High Court Bar",
    location: "Faisalabad",
    tag: "Litigation Practice",
    quote:
      "Finally, a case management tool built specifically for how Pakistani lawyers and court hierarchies function. Adjournments, previous orders, and cause lists are handled intuitively.",
    stars: 5,
    sample: false,
  },
  {
    initials: "ZH",
    name: "Zainab Hasan",
    role: "Corporate Counsel",
    firm: "Hasan Corporate Legal Group",
    court: "Corporate & IP Tribunals",
    location: "Karachi",
    tag: "Corporate Legal Advisory",
    quote:
      "The audit trails, secure member permissions, and clean analytics give our firm complete oversight across hundreds of client matters across the country.",
    stars: 5,
    sample: false,
  },
];
