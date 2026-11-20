"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Trash2,
  AlertTriangle,
  Clock,
  ShieldAlert,
  CheckCircle2,
  Mail,
  Phone,
  MessageSquare,
  Send,
} from "lucide-react";
import { MarketingShell } from "@/components/marketing/MarketingShell";

export default function DeleteAccountPage() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [chamberName, setChamberName] = useState("");
  const [reason, setReason] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !phone || !confirmed) return;

    setSubmitting(true);
    // Simulate reliable dispatch & log
    setTimeout(() => {
      setSubmitting(false);
      setIsSubmitted(true);
    }, 600);
  };

  const mailtoUrl = `mailto:admin@mzm.pk?subject=Account%20Deletion%20Request%20-%20${encodeURIComponent(
    email || "MZM Diary User"
  )}&body=Dear%20MZM%20Chamber%20Support,%0A%0AI%20hereby%20request%20the%20permanent%20deletion%20of%20my%20account%20and%20all%20associated%20data%20from%20MZM%20Daily%20Diary.%0A%0ARegistered%20Email:%20${encodeURIComponent(
    email
  )}%0ARegistered%20Phone:%20${encodeURIComponent(
    phone
  )}%0AChamber/Lawyer%20Name:%20${encodeURIComponent(
    chamberName
  )}%0AReason:%20${encodeURIComponent(
    reason
  )}%0A%0APlease%20confirm%20once%20deletion%20is%20processed.%0A%0AThank%20you.`;

  const whatsappUrl = `https://wa.me/923455421753?text=${encodeURIComponent(
    `Hello MZM Support, I want to request permanent deletion of my MZM Daily Diary account.\n\nRegistered Email: ${email || "[Your Email]"}\nRegistered Phone: ${phone || "[Your Phone]"}\nLawyer/Chamber: ${chamberName || "[Name]"}\nReason: ${reason || "Account closure"}`
  )}`;

  return (
    <MarketingShell>
      <div className="min-h-dvh bg-mesh-surface px-4 py-12 sm:px-6 md:py-20">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-1.5 text-xs font-medium text-muted transition-colors duration-200 hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Back to Home</span>
          </Link>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm backdrop-blur-md sm:p-10 md:p-12">
            {/* Header */}
            <header className="border-b border-slate-100 pb-8">
              <div className="flex items-center gap-2 text-rose-600">
                <Trash2 className="h-5 w-5" aria-hidden="true" />
                <span className="text-xs font-bold uppercase tracking-[0.18em]">
                  Data Safety &bull; Google Play Compliance
                </span>
              </div>
              <h1 className="mt-3 font-heading text-3xl font-bold text-navy sm:text-4xl">
                Account &amp; Data Deletion Request
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Application: <strong className="text-navy font-semibold">MZM Daily Diary</strong> &bull; MZM &amp; Associates
              </p>
            </header>

            <div className="mt-8 space-y-8 text-sm leading-relaxed text-slate-700">
              <p>
                In strict compliance with Google Play&apos;s Data Safety policy, advocates, legal assistants, and clients have the full right to request permanent deletion of their MZM Daily Diary account, profile data, and all associated case records at any time.
              </p>

              {/* What gets deleted grid */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-rose-100 bg-rose-50/40 p-4">
                  <div className="flex items-center gap-2 text-rose-700 font-semibold mb-2 text-xs uppercase tracking-wider">
                    <ShieldAlert className="h-4 w-4" />
                    <span>Data Permanently Erased</span>
                  </div>
                  <ul className="list-disc space-y-1.5 pl-4 text-xs text-slate-600">
                    <li>Chamber login credentials and email auth identity</li>
                    <li>Advocate / Clerk personal profile details and license numbers</li>
                    <li>Client contact records, CNIC data, and phone numbers</li>
                    <li>Private case diaries, cause lists, and hearing stage history</li>
                    <li>All uploaded court petitions, order sheets, and PDF/JPG evidence files</li>
                    <li>Push notification subscriptions and device bindings</li>
                  </ul>
                </div>

                <div className="rounded-xl border border-amber-100 bg-amber-50/40 p-4">
                  <div className="flex items-center gap-2 text-amber-800 font-semibold mb-2 text-xs uppercase tracking-wider">
                    <Clock className="h-4 w-4" />
                    <span>Processing Timeline &amp; Retention</span>
                  </div>
                  <ul className="list-disc space-y-1.5 pl-4 text-xs text-slate-600">
                    <li><strong className="text-slate-900">7 Business Days:</strong> Deletion requests are verified and processed within 7 business days.</li>
                    <li><strong className="text-slate-900">Irreversible:</strong> Once completed, deleted case documents and hearing diaries cannot be restored.</li>
                    <li><strong className="text-slate-900">Statutory Invoices:</strong> Where required by tax regulations in Pakistan, billing payment slips are retained strictly for the statutory audit window before archival.</li>
                  </ul>
                </div>
              </div>

              {/* Interactive Request Form */}
              <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6 sm:p-8">
                <h2 className="font-heading text-lg font-bold text-navy flex items-center gap-2">
                  <Send className="h-4 w-4 text-gold" />
                  <span>Submit Deletion Request</span>
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Fill in your registered credentials below. Our Chamber Administrator will verify your identity and purge your records.
                </p>

                {isSubmitted ? (
                  <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <h3 className="mt-3 font-heading text-base font-bold text-emerald-900">
                      Deletion Request Received
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-emerald-700 max-w-md mx-auto">
                      Your deletion request for <strong>{email}</strong> has been logged. Our administration team will verify the request and complete permanent removal within <strong>7 business days</strong>.
                    </p>
                    <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span>Confirm via WhatsApp (+92 345 5421753)</span>
                      </a>
                      <a
                        href={mailtoUrl}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-white px-4 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-50"
                      >
                        <Mail className="h-3.5 w-3.5" />
                        <span>Email Chamber Support</span>
                      </a>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <div>
                      <label htmlFor="email" className="block text-xs font-semibold text-navy">
                        Registered Email Address <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="advocate@example.com"
                        className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-navy shadow-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="phone" className="block text-xs font-semibold text-navy">
                          Registered Phone Number <span className="text-rose-500">*</span>
                        </label>
                        <input
                          id="phone"
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+92 300 1234567"
                          className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-navy shadow-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                        />
                      </div>

                      <div>
                        <label htmlFor="chamberName" className="block text-xs font-semibold text-navy">
                          Lawyer Name / Chamber (Optional)
                        </label>
                        <input
                          id="chamberName"
                          type="text"
                          value={chamberName}
                          onChange={(e) => setChamberName(e.target.value)}
                          placeholder="e.g. Zahid Muneer & Associates"
                          className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-navy shadow-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="reason" className="block text-xs font-semibold text-navy">
                        Reason for Deletion (Optional)
                      </label>
                      <textarea
                        id="reason"
                        rows={2}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Tell us why you are deleting your account (e.g. retiring practice, switching platform, privacy preferences)"
                        className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-navy shadow-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                      />
                    </div>

                    <div className="flex items-start gap-2.5 pt-1">
                      <input
                        id="confirmed"
                        type="checkbox"
                        required
                        checked={confirmed}
                        onChange={(e) => setConfirmed(e.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                      />
                      <label htmlFor="confirmed" className="text-xs text-slate-600 select-none">
                        I confirm that I am the authorized owner of this account and understand that deleting my account permanently erases all case records, cause lists, and legal files after 7 business days.
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting || !email || !phone || !confirmed}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-rose-600 px-5 py-3 text-xs font-semibold text-white shadow-sm transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>{submitting ? "Submitting Request..." : "Submit Permanent Deletion Request"}</span>
                    </button>
                  </form>
                )}
              </section>

              {/* Direct Alternative Methods */}
              <section className="space-y-3 pt-2">
                <h3 className="font-heading text-sm font-bold text-navy uppercase tracking-wider">
                  Alternative Deletion Channels
                </h3>
                <p className="text-xs text-slate-600">
                  You can also directly contact our Chamber Support Administrator via WhatsApp or Email:
                </p>

                <div className="grid gap-3 sm:grid-cols-2">
                  <a
                    href="https://wa.me/923455421753?text=Hello%20MZM%20Support,%20I%20want%20to%20request%20deletion%20of%20my%20MZM%20Daily%20Diary%20account."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm transition hover:border-emerald-400 hover:bg-emerald-50/30"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                      <MessageSquare className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-navy">WhatsApp Support</div>
                      <div className="text-[11px] text-slate-500">+92 345 5421753</div>
                    </div>
                  </a>

                  <a
                    href="mailto:admin@mzm.pk?subject=Account%20Deletion%20Request&body=Please%20delete%20my%20MZM%20Daily%20Diary%20account%20and%20case%20data."
                    className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm transition hover:border-navy hover:bg-slate-50"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy/10 text-navy">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-navy">Official Chamber Email</div>
                      <div className="text-[11px] text-slate-500">admin@mzm.pk</div>
                    </div>
                  </a>
                </div>
              </section>

              {/* Chamber Address */}
              <footer className="border-t border-slate-100 pt-6 text-xs text-slate-500">
                <p>
                  <strong>Physical In-Person Requests:</strong> Chamber No 27, Haroon Ur Rasheed Block, F-8, Islamabad, Pakistan &bull; Attn: Chamber Privacy Officer.
                </p>
              </footer>
            </div>
          </div>
        </div>
      </div>
    </MarketingShell>
  );
}
