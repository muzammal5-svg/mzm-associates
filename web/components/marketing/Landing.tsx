"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { PublicHeader } from "@/components/marketing/PublicHeader";
import { PublicFooter } from "@/components/marketing/PublicFooter";
import { Reveal } from "@/components/marketing/Reveal";
import { SITE, whatsappLink } from "@/lib/siteConfig";
import { REVIEWS } from "@/lib/reviews";
import { supabase } from "@/lib/supabase/client";

interface PlanRow {
  id: string;
  code: string;
  name: string;
  price_pkr: number;
  duration_months: number;
  max_users: number;
}

const CONTAINER = "max-w-[1200px] mx-auto px-4 md:px-6";
const SECTION   = "py-[72px] md:py-[112px]";

export function Landing() {
  const { t } = useTranslation();
  const [plans, setPlans] = useState<PlanRow[]>([]);

  useEffect(() => {
    let mounted = true;
    (supabase as any)
      .from("plans")
      .select("id, code, name, price_pkr, duration_months, max_users")
      .eq("is_active", true)
      .order("sort_order")
      .then(({ data }: { data: PlanRow[] | null }) => {
        if (mounted) setPlans(data ?? []);
      });
    return () => { mounted = false; };
  }, []);

  const trustBar = [
    t("marketing.trust1"), t("marketing.trust2"),
    t("marketing.trust3"), t("marketing.trust4"),
  ];

  const problems = [
    { problem: t("marketing.ps1Problem"), solution: t("marketing.ps1Solution") },
    { problem: t("marketing.ps2Problem"), solution: t("marketing.ps2Solution") },
    { problem: t("marketing.ps3Problem"), solution: t("marketing.ps3Solution") },
  ];

  const features = [
    { title: t("marketing.f1Title"), body: t("marketing.f1Body") },
    { title: t("marketing.f2Title"), body: t("marketing.f2Body") },
    { title: t("marketing.f3Title"), body: t("marketing.f3Body") },
    { title: t("marketing.f4Title"), body: t("marketing.f4Body") },
    { title: t("marketing.f5Title"), body: t("marketing.f5Body") },
    { title: t("marketing.f6Title"), body: t("marketing.f6Body") },
  ];

  const steps = [
    { title: t("marketing.s1Title"), body: t("marketing.s1Body") },
    { title: t("marketing.s2Title"), body: t("marketing.s2Body") },
    { title: t("marketing.s3Title"), body: t("marketing.s3Body") },
    { title: t("marketing.s4Title"), body: t("marketing.s4Body") },
  ];

  const security = [
    { title: t("marketing.sec1Title"), body: t("marketing.sec1Body") },
    { title: t("marketing.sec2Title"), body: t("marketing.sec2Body") },
    { title: t("marketing.sec3Title"), body: t("marketing.sec3Body") },
  ];

  const faqs = [
    { q: t("marketing.faq1Q"), a: t("marketing.faq1A") },
    { q: t("marketing.faq2Q"), a: t("marketing.faq2A") },
    { q: t("marketing.faq3Q"), a: t("marketing.faq3A") },
    { q: t("marketing.faq4Q"), a: t("marketing.faq4A") },
    { q: t("marketing.faq5Q"), a: t("marketing.faq5A") },
    { q: t("marketing.faq6Q"), a: t("marketing.faq6A") },
  ];

  return (
    <div className="min-h-dvh bg-offwhite">
      <PublicHeader overDark />

      {/* Hero — starts under the sticky header so it can be transparent over it */}
      <section className="relative overflow-hidden bg-navy-header text-white -mt-16 pt-16">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg viewBox="0 0 1200 600" className="w-full h-full" fill="none" stroke="white" aria-hidden="true">
            <line x1="0" y1="300" x2="1200" y2="300" strokeWidth="1" />
            <circle cx="600" cy="300" r="160" strokeWidth="1" />
            <circle cx="600" cy="300" r="240" strokeWidth="1" />
            <path d="M120 480 L240 360 L360 440 L480 320" strokeWidth="1" />
            <path d="M720 480 L840 360 L960 440 L1080 320" strokeWidth="1" />
          </svg>
        </div>
        <div className={`${CONTAINER} py-[72px] md:py-[112px] grid md:grid-cols-2 gap-12 items-center relative`}>
          <div>
            <h1 className="text-white font-heading font-bold leading-tight text-[36px] md:text-[56px]">
              {t("marketing.heroTitle")}
            </h1>
            <p className="mt-4 text-lg text-white/80">{t("marketing.heroSubtitle")}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/register" className="btn-primary h-[52px] px-7">{t("marketing.heroCta")}</Link>
              <Link href="/pricing"  className="btn-secondary h-[52px] px-7">{t("marketing.heroCta2")}</Link>
            </div>
            <p className="mt-4 text-sm text-white/60">{t("marketing.heroTrust")}</p>
          </div>
          <div className="relative flex justify-center md:justify-end">
            <div className="relative w-[280px] md:w-[320px] rounded-[2.5rem] border-4 border-white/20 bg-navy-600 p-3 shadow-lg animate-float">
              <Image
                src="/marketing/cause-list.webp"
                alt={t("marketing.f1Title")}
                width={640} height={1280}
                className="w-full rounded-[1.8rem]"
                priority
              />
            </div>
            <div className="absolute -top-2 -end-2 md:-end-6 bg-white text-navy text-xs font-semibold px-3 py-2 rounded-lg shadow-md">
              {t("marketing.floatCard1")}
            </div>
            <div className="absolute -bottom-4 -start-2 md:-start-6 bg-gold text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-md">
              {t("marketing.floatCard2")}
            </div>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="bg-white border-b border-border">
        <div className={`${CONTAINER} py-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center`}>
          {trustBar.map((item) => (
            <p key={item} className="text-sm font-medium text-muted">{item}</p>
          ))}
        </div>
      </section>

      {/* Problem -> solution */}
      <section className={CONTAINER + " " + SECTION}>
        <h2 className="text-3xl font-heading font-bold text-center text-navy">{t("marketing.psTitle")}</h2>
        <div className="mt-10 grid md:grid-cols-3 gap-6">
          {problems.map((p) => (
            <Reveal key={p.problem} className="card h-full">
              <p className="text-sm text-muted">{p.problem}</p>
              <div className="my-3 h-px bg-border" />
              <p className="font-semibold text-navy">{p.solution}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Features grid */}
      <section className="bg-white">
        <div className={CONTAINER + " " + SECTION}>
          <h2 className="text-3xl font-heading font-bold text-center text-navy">{t("marketing.featTitle")}</h2>
          <div className="mt-10 grid md:grid-cols-3 gap-6">
            {features.map((f) => (
              <Reveal key={f.title} className="card hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-navy">{f.title}</h3>
                <p className="text-sm text-muted mt-1">{f.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Alternating showcase rows */}
      <section className={CONTAINER + " " + SECTION}>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <Reveal>
            <h3 className="text-2xl font-heading font-bold text-navy">{t("marketing.row1Title")}</h3>
            <p className="mt-3 text-muted">{t("marketing.row1Body")}</p>
          </Reveal>
          <Reveal className="card p-2">
            <Image src="/marketing/reminders.webp" alt={t("marketing.row1Title")} width={640} height={480} className="w-full rounded-lg" loading="lazy" />
          </Reveal>
        </div>
        <div className="grid md:grid-cols-2 gap-12 items-center mt-16">
          <Reveal className="md:order-last card p-2">
            <Image src="/marketing/case-view.webp" alt={t("marketing.row2Title")} width={640} height={480} className="w-full rounded-lg" loading="lazy" />
          </Reveal>
          <Reveal>
            <h3 className="text-2xl font-heading font-bold text-navy">{t("marketing.row2Title")}</h3>
            <p className="mt-3 text-muted">{t("marketing.row2Body")}</p>
          </Reveal>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white">
        <div className={CONTAINER + " " + SECTION}>
          <h2 className="text-3xl font-heading font-bold text-center text-navy">{t("marketing.howTitle")}</h2>
          <div className="mt-10 grid md:grid-cols-4 gap-6 text-center">
            {steps.map((s, i) => (
              <Reveal key={s.title} className="card h-full">
                <div className="text-gold font-bold text-xl">{i + 1}</div>
                <p className="mt-2 font-semibold text-navy">{s.title}</p>
                <p className="mt-1 text-sm text-muted">{s.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing (from plans table) */}
      <section className={CONTAINER + " " + SECTION}>
        <h2 className="text-3xl font-heading font-bold text-center text-navy">{t("marketing.pricingTitle")}</h2>
        <div className="mt-10 grid md:grid-cols-3 gap-6">
          {plans.map((p) => (
            <div key={p.id} className="card text-center">
              <h3 className="text-xl font-semibold text-navy">{p.name}</h3>
              <p className="text-2xl font-bold mt-2 text-navy">Rs {p.price_pkr}</p>
              <p className="text-sm text-muted">
                {t("marketing.pricingDuration", { months: p.duration_months, users: p.max_users })}
              </p>
              <Link href={`/register?plan=${p.code}`} className="btn-primary mt-4 inline-block h-[52px] px-7">
                {t("marketing.choosePlan")}
              </Link>
            </div>
          ))}
        </div>
        <p className="text-center text-sm text-muted mt-4">{t("marketing.pricingNote")}</p>
      </section>

      {/* Reviews — hidden unless SHOW_REVIEWS (see docs/landing-content.md) */}
      {SITE.SHOW_REVIEWS && (
        <section className="bg-white">
          <div className={CONTAINER + " " + SECTION}>
            <h2 className="text-3xl font-heading font-bold text-center text-navy">{t("marketing.reviewsTitle")}</h2>
            <div className="mt-10 grid md:grid-cols-3 gap-6">
              {REVIEWS.map((r) => (
                <Reveal key={r.name} className="card h-full">
                  <p className="text-gold" aria-label={`${r.stars}/5`}>{"★".repeat(r.stars)}{"☆".repeat(5 - r.stars)}</p>
                  <p className="mt-2 text-navy">&ldquo;{r.quote}&rdquo;</p>
                  <p className="mt-3 text-sm font-semibold text-navy">{r.name} — {r.role}, {r.firm}</p>
                  {r.sample && <p className="mt-1 text-xs text-muted">{t("marketing.reviewSampleBadge")}</p>}
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Security & trust */}
      <section className={CONTAINER + " " + SECTION}>
        <h2 className="text-3xl font-heading font-bold text-center text-navy">{t("marketing.secTitle")}</h2>
        <div className="mt-10 grid md:grid-cols-3 gap-6 text-center">
          {security.map((s) => (
            <Reveal key={s.title} className="card h-full">
              <h3 className="font-semibold text-navy">{s.title}</h3>
              <p className="mt-2 text-sm text-muted">{s.body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white">
        <div className={`max-w-[800px] mx-auto px-4 md:px-6 ${SECTION}`}>
          <h2 className="text-3xl font-heading font-bold text-center text-navy">{t("marketing.faqTitle")}</h2>
          <div className="mt-10 space-y-4">
            {faqs.map((f) => (
              <details key={f.q} className="card group">
                <summary className="font-semibold cursor-pointer text-navy">{f.q}</summary>
                <p className="text-sm text-muted mt-2">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-navy-header text-white py-[72px] md:py-[112px] px-6 text-center">
        <h2 className="text-white text-3xl font-heading font-bold">{t("marketing.ctaTitle")}</h2>
        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          <Link href="/register" className="btn-primary h-[52px] px-7">{t("marketing.signUp")}</Link>
          <a href={whatsappLink()} className="btn-secondary h-[52px] px-7">{t("marketing.footerWhatsapp")}</a>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
