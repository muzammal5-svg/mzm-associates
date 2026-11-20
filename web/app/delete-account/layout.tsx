import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account & Data Deletion",
  description:
    "Official Account and Data Deletion Request Portal for MZM Daily Diary (MZM & Associates) in compliance with Google Play Data Safety policy.",
  alternates: {
    canonical: "https://dailydiary-mzm.com/delete-account",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Account & Data Deletion — MZM Daily Diary | MZM & Associates",
    description:
      "Request permanent deletion of your MZM Daily Diary account, case records, and personal data.",
    url: "https://dailydiary-mzm.com/delete-account",
  },
};

export default function DeleteAccountLayout({ children }: { children: React.ReactNode }) {
  return children;
}
