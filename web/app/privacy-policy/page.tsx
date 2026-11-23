"use client";

import Link from "next/link";
import { ArrowLeft, ShieldCheck, Lock, FileText, Database, UserCheck, Phone, Trash2, Mail } from "lucide-react";
import { MarketingShell } from "@/components/marketing/MarketingShell";

export default function PrivacyPolicyPage() {
  return (
    <MarketingShell>
      <div className="min-h-dvh bg-mesh-surface px-4 py-12 sm:px-6 md:py-20">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-1.5 text-xs font-medium text-muted transition-colors duration-200 hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Back to Home</span>
          </Link>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm backdrop-blur-md sm:p-10 md:p-14">
            {/* Header */}
            <header className="border-b border-slate-100 pb-8">
              <div className="flex items-center gap-2.5 text-gold">
                <ShieldCheck className="h-6 w-6 text-gold" aria-hidden="true" />
                <span className="text-xs font-bold uppercase tracking-[0.18em]">MZM &amp; Associates</span>
              </div>
              <h1 className="mt-3 font-heading text-3xl font-bold text-navy sm:text-4xl">
                Privacy Policy
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Application: <strong className="text-navy font-semibold">MZM Daily Diary</strong> &bull; Last Updated: November 20, 2026
              </p>
            </header>

            {/* Intro */}
            <div className="mt-8 space-y-8 text-sm leading-relaxed text-slate-700">
              <section className="space-y-3">
                <p>
                  This Privacy Policy governs the collection, use, maintenance, and disclosure of information collected from users (advocates, lawyers, legal associates, legal clerks, and their clients) of the <strong>MZM Daily Diary</strong> application (available via Google Play Store as an Android app and on the web at <a href="https://dailydiary-mzm.com" className="text-gold font-medium hover:underline">dailydiary-mzm.com</a>), operated by <strong>MZM &amp; Associates (Advocates &amp; Legal Consultants)</strong>.
                </p>
                <p>
                  We understand the sensitive and strictly confidential nature of attorney-client privilege, legal case files, court schedules, and judicial proceedings. We are fully committed to protecting your privacy in full compliance with the Google Play Developer Distribution Agreement, Google Play Data Safety standards, and applicable legal ethics in Pakistan.
                </p>
              </section>

              {/* 1. Data Collected */}
              <section className="space-y-4 rounded-xl border border-slate-100 bg-slate-50/60 p-5">
                <div className="flex items-center gap-2 text-navy">
                  <Database className="h-5 w-5 text-gold" />
                  <h2 className="font-heading text-lg font-bold">1. Information &amp; Data We Collect</h2>
                </div>
                <p>
                  To provide a digital case diary and cause list management service, MZM Daily Diary collects the following categories of data when voluntarily provided by registered chamber administrators and advocates:
                </p>
                <ul className="list-disc space-y-2 pl-5 text-slate-600">
                  <li>
                    <strong className="text-navy">User &amp; Chamber Profiles:</strong> Full name, professional legal title (Advocate High Court / Advocate Supreme Court), chamber name, bar council license/enrollment number, professional email address, and mobile phone number.
                  </li>
                  <li>
                    <strong className="text-navy">Client Records:</strong> Client names, phone numbers, CNIC/ID numbers (optional), and case association details recorded by the advocate.
                  </li>
                  <li>
                    <strong className="text-navy">Case &amp; Court Proceeding Details:</strong> Case titles, suit/petition numbers, case categories (Civil, Criminal, Corporate, Family, Constitutional), court name (e.g., Lahore High Court, Islamabad High Court, District Courts), judge/bench titles, previous order sheets, next hearing dates, and advocates&apos; internal diary notes.
                  </li>
                  <li>
                    <strong className="text-navy">Uploaded Legal Documents &amp; Media:</strong> Case pleadings, petitions, stay orders, certified copies, power of attorney (Vakalatnama), and evidence documents uploaded in PDF or image (PNG/JPG) formats for digital archiving.
                  </li>
                  <li>
                    <strong className="text-navy">Device &amp; Notification Identifiers:</strong> Web Push notification endpoints and device tokens necessary to deliver automated hearing reminders and cause list alerts.
                  </li>
                </ul>
              </section>

              {/* 2. Purpose of Use */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-navy">
                  <FileText className="h-5 w-5 text-gold" />
                  <h2 className="font-heading text-lg font-bold">2. How We Use Collected Data</h2>
                </div>
                <p>
                  All collected data is processed strictly for legitimate legal practice management purposes, specifically:
                </p>
                <ul className="list-disc space-y-2 pl-5 text-slate-600">
                  <li>Generating real-time daily cause lists and court hearing rosters for law chambers.</li>
                  <li>Sending automated SMS, email, and push notifications for upcoming court dates to prevent missed hearings.</li>
                  <li>Allowing authorized advocates and clerks within a verified chamber to collaborate on case records securely.</li>
                  <li>Securely storing and indexing case documents for fast retrieval during court appearances.</li>
                  <li>Providing account authentication, session management, and preventing unauthorized chamber access.</li>
                </ul>
                <div className="rounded-lg bg-amber-50/80 border border-amber-200/60 p-4 text-xs text-amber-900">
                  <strong>Zero Commercial Sale Policy:</strong> We do NOT sell, rent, lease, or monetize advocate or client personal data to third parties, data brokers, or advertisers. We do NOT run third-party advertising networks inside MZM Daily Diary.
                </div>
              </section>

              {/* 3. Storage & Security */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-navy">
                  <Lock className="h-5 w-5 text-gold" />
                  <h2 className="font-heading text-lg font-bold">3. Data Storage, Encryption &amp; Security Architecture</h2>
                </div>
                <p>
                  We implement multi-layered enterprise security measures to protect the confidentiality and integrity of all legal records:
                </p>
                <ul className="list-disc space-y-2 pl-5 text-slate-600">
                  <li>
                    <strong className="text-navy">Encryption in Transit:</strong> All communications between the mobile app/web browser and our servers are encrypted using modern Transport Layer Security (TLS/HTTPS with SHA-256 encryption).
                  </li>
                  <li>
                    <strong className="text-navy">Encryption at Rest:</strong> Case records and uploaded client documents are stored in cloud data centers powered by Supabase infrastructure with full AES-256 encryption at rest.
                  </li>
                  <li>
                    <strong className="text-navy">Row-Level Security (RLS):</strong> The database enforces strict PostgreSQL Row-Level Security policies. Every database query validates the user&apos;s authenticated chamber ID and role, ensuring no advocate or firm can ever view or access another chamber&apos;s cases.
                  </li>
                  <li>
                    <strong className="text-navy">Access Control &amp; Audit Logs:</strong> Access is limited to authenticated chamber staff with role-based permissions (Super Admin, Chamber Admin, Advocate, Clerk).
                  </li>
                </ul>
              </section>

              {/* 4. Third-Party Infrastructure */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-navy">
                  <UserCheck className="h-5 w-5 text-gold" />
                  <h2 className="font-heading text-lg font-bold">4. Third-Party Service Providers</h2>
                </div>
                <p>
                  We partner only with reputable cloud infrastructure providers that maintain rigorous data security and SOC-2 / ISO-27001 compliance standards:
                </p>
                <ul className="list-disc space-y-2 pl-5 text-slate-600">
                  <li><strong className="text-navy">Supabase:</strong> Cloud database, authentication, and secure encrypted file storage.</li>
                  <li><strong className="text-navy">Vercel:</strong> Edge network hosting and application runtime.</li>
                  <li><strong className="text-navy">Web Push / Firebase:</strong> Delivering instant court date push notifications to your mobile device.</li>
                </ul>
              </section>

              {/* 5. Data Retention & Deletion */}
              <section className="space-y-4 rounded-xl border border-rose-100 bg-rose-50/30 p-5">
                <div className="flex items-center gap-2 text-navy">
                  <Trash2 className="h-5 w-5 text-rose-600" />
                  <h2 className="font-heading text-lg font-bold">5. Data Retention &amp; Permanent Deletion Rights</h2>
                </div>
                <p>
                  We retain case records and user information for as long as your law firm maintains an active subscription or account with MZM Daily Diary.
                </p>
                <p>
                  In compliance with the <strong>Google Play Data Safety Policy</strong>, users have the absolute right to request permanent deletion of their account and all associated personal and case data at any time.
                </p>
                <div className="mt-3">
                  <Link
                    href="/delete-account"
                    className="inline-flex items-center gap-2 rounded-lg bg-navy px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                  >
                    <span>Visit Account &amp; Data Deletion Portal</span>
                    &rarr;
                  </Link>
                </div>
              </section>

              {/* 6. Children's Privacy */}
              <section className="space-y-3">
                <h2 className="font-heading text-lg font-bold text-navy">6. Children&apos;s Privacy</h2>
                <p>
                  MZM Daily Diary is professional law practice software intended solely for licensed advocates, legal personnel, and adult clients. We do not knowingly collect personal information from individuals under the age of 18.
                </p>
              </section>

              {/* 7. Contact Information */}
              <section className="space-y-4 border-t border-slate-100 pt-6">
                <div className="flex items-center gap-2 text-navy">
                  <Phone className="h-5 w-5 text-gold" />
                  <h2 className="font-heading text-lg font-bold">7. Privacy Inquiries &amp; Contact Information</h2>
                </div>
                <p>
                  If you have any questions, concerns, or requests regarding this Privacy Policy or your legal data protection rights, please contact our Chamber Privacy Officer:
                </p>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-xs text-slate-700 space-y-2">
                  <p className="font-bold text-navy text-sm">MZM &amp; Associates (Advocates &amp; Legal Consultants)</p>
                  <p><strong>Office:</strong> Chamber No#27 Haroon Ur Rasheed Block F-8 Markaz Near PSO Pump Islamabad</p>
                  <p className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-gold" />
                    <span>Direct / WhatsApp: <a href="tel:+923455421753" className="text-navy font-semibold hover:underline">+92 345 5421753</a></span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-gold" />
                    <span>Email: <a href="mailto:admin@mzm.pk" className="text-navy font-semibold hover:underline">admin@mzm.pk</a> &bull; <a href="mailto:muhammad.zahid.muneer@outlook.com" className="text-navy font-semibold hover:underline">muhammad.zahid.muneer@outlook.com</a></span>
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </MarketingShell>
  );
}
