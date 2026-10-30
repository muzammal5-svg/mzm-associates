"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import {
  Shield, Zap, Star, Check, ArrowRight, Scale, Users, Clock, Briefcase, MessageSquare,
} from "lucide-react";
import { PublicHeader } from "@/components/marketing/PublicHeader";
import { PublicFooter } from "@/components/marketing/PublicFooter";
import { Logo } from "@/components/shared/Logo";
import { Reveal } from "@/components/marketing/Reveal";
import { SITE, whatsappLink } from "@/lib/siteConfig";
import { REVIEWS } from "@/lib/reviews";
import { saasDb } from "@/lib/supabase/saas";
import type { PlanView } from "@/components/marketing/PlanCard";
import { HeroDashboard } from "@/components/marketing/HeroDashboard";
import { ReviewSlider } from "@/components/marketing/ReviewSlider";

const CONTAINER = "max-w-[1200px] mx-auto px-4 md:px-6";
const SECTION = "py-[80px] md:py-[120px]";

export function Landing() {
  const { t } = useTranslation();
  const [plans, setPlans] = useState<PlanView[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>("");

  useEffect(() => {
    let mounted = true;
    saasDb
      .plans()
      .select("id, code, name, price_pkr, duration_months, max_users")
      .eq("is_active", true)
      .order("sort_order")
      .then((result) => {
        if (!mounted) return;
        const rows = (result.data as unknown as PlanView[]) ?? [];
        setPlans(rows);
        const yearly = rows.find((p) => p.duration_months >= 12) ?? rows[0];
        if (yearly) setSelectedPlan(yearly.id);
      });
    return () => { mounted = false; };
  }, []);

  const baselineMonthly = useMemo(() => {
    if (plans.length === 0) return 0;
    return Math.min(
      ...plans.map((p) => Math.round(Number(p.price_pkr) / Math.max(1, p.duration_months)))
    );
  }, [plans]);

  return (
    <div className="min-h-dvh bg-[#0F1117]">
      <PublicHeader overDark />

      {/* ── HERO SECTION ── */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden bg-[#070B14]">
        {/* Background Image & Cinematic Gradient Overlays */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
          <Image
            src="/logo/ai-generated-law-books-gavel-and-scales-symbolizing-justice-on-a-table-generative-ai-photo.jpg"
            alt="Law books, gavel, and scales of justice"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center scale-105 filter brightness-[0.28] contrast-[1.15]"
          />

          {/* Directional & Radial Multi-Layer Gradients for Extreme Contrast */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#070B14] via-[#070B14]/90 to-[#070B14]/75 z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F1117] via-transparent to-[#070B14]/80 z-10" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gold/15 via-transparent to-transparent z-10" />

          {/* Subtle grid pattern overlay */}
          <svg
            className="absolute inset-0 w-full h-full opacity-[0.06] z-10"
            viewBox="0 0 1200 800"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern id="hero-grid" width="80" height="80" patternUnits="userSpaceOnUse">
                <path d="M 80 0 L 0 0 0 80" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="1200" height="800" fill="url(#hero-grid)" />
          </svg>

          {/* Atmospheric ambient glows */}
          <div className="absolute top-1/4 start-1/4 w-[480px] h-[480px] bg-gold/10 rounded-full blur-[140px] z-10" />
          <div className="absolute bottom-10 end-10 w-[420px] h-[420px] bg-blue-600/10 rounded-full blur-[140px] z-10" />
        </div>

        {/* Hero Content */}
        <div className={`${CONTAINER} relative z-20 py-20 md:py-28 lg:py-32 w-full`}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left: Text & Actions (7 cols) */}
            <div className="lg:col-span-7 space-y-7">
              {/* Badge */}
              <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-gradient-to-r from-gold/20 via-gold/10 to-transparent border border-gold/40 rounded-full w-fit shadow-md backdrop-blur-md">
                <Scale className="w-4 h-4 text-gold-400 animate-scale-sway" />
                <span className="text-xs sm:text-sm font-semibold text-gold-200 tracking-wide">
                  Pakistan&apos;s Leading Legal Practice Platform
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>

              {/* Heading */}
              <div className="space-y-4">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-heading font-bold text-white leading-[1.14] tracking-tight">
                  Run Your Law Practice with{" "}
                  <span className="bg-gradient-to-r from-gold-200 via-gold to-gold-400 bg-clip-text text-transparent drop-shadow-sm">
                    Precision &amp; Clarity
                  </span>
                </h1>
                <p className="text-base sm:text-lg text-white/75 leading-relaxed max-w-xl font-normal">
                  Purpose-built for Pakistani advocates, chambers, and corporate legal teams. Streamline daily cause lists, court diary hearings, client communications, and automated reminders with bank-grade security.
                </p>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-gradient-to-r from-gold to-gold-400 hover:from-gold-400 hover:to-gold text-black font-bold rounded-xl shadow-gold hover:shadow-gold-lg transition-all duration-200 active:scale-95 text-sm whitespace-nowrap"
                >
                  Start 7-Day Free Trial
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-white/20 hover:border-gold/50 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl backdrop-blur-sm transition-all duration-200 text-sm whitespace-nowrap"
                >
                  View Pricing
                </Link>
                <a
                  href={whatsappLink("Assalam-o-Alaikum, I want to learn more about MZM Case Management for my legal practice.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3.5 border border-emerald-500/30 hover:border-emerald-400/60 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-semibold rounded-xl backdrop-blur-sm transition-all duration-200 text-sm whitespace-nowrap"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <span>WhatsApp Inquiry</span>
                </a>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 text-xs sm:text-sm text-white/80 border-t border-white/10">
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-gold flex-shrink-0" />
                  <span>Supreme Court, High Courts &amp; District Bars</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-gold flex-shrink-0" />
                  <span>Automated Daily Cause Lists &amp; Hearings</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-gold flex-shrink-0" />
                  <span>Full Urdu &amp; English Bilingual Support</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-gold flex-shrink-0" />
                  <span>7-day free trial &bull; Subscription required after trial</span>
                </div>
              </div>
            </div>

            {/* Right: Interactive Product Preview (5 cols) */}
            <div className="lg:col-span-5 relative mt-6 lg:mt-0">
              <div className="absolute -inset-4 bg-gradient-to-tr from-gold/20 via-blue-500/15 to-gold/10 rounded-3xl blur-2xl opacity-60 pointer-events-none" />
              <div className="relative z-10">
                <HeroDashboard />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className={`${SECTION} bg-[#1a1f2e]/50 border-y border-white/5`}>
        <div className={CONTAINER}>
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading font-bold text-white mb-4">
              Everything You Need for Your Law Practice
            </h2>
            <p className="text-lg text-white/60 max-w-2xl mx-auto">
              Comprehensive tools designed specifically for legal professionals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Briefcase,
                title: "Case Management",
                desc: "Organize and track all cases with automated status updates and deadline management"
              },
              {
                icon: Users,
                title: "Client Portal",
                desc: "Give clients access to their case details with a secure, easy-to-use interface"
              },
              {
                icon: Clock,
                title: "Smart Reminders",
                desc: "Never miss important dates with intelligent reminder system"
              },
              {
                icon: Shield,
                title: "Data Security",
                desc: "Bank-level encryption and compliance with Pakistani legal requirements"
              },
              {
                icon: Zap,
                title: "Automation",
                desc: "Automate repetitive tasks and focus on what matters most"
              },
              {
                icon: Star,
                title: "Analytics",
                desc: "Get insights into your practice with comprehensive reporting"
              },
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <Reveal key={idx}>
                  <div className="bg-[#0F1117] border border-white/5 hover:border-gold/30 rounded-xl p-8 transition-all duration-300 hover:shadow-lg hover:shadow-gold/10">
                    <Icon className="w-12 h-12 text-gold mb-4" />
                    <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                    <p className="text-white/60">{feature.desc}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF ── */}
      <section className={`${SECTION} bg-[#0F1117]`}>
        <div className={CONTAINER}>
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading font-bold text-white mb-4">
              Trusted by Leading Law Firms
            </h2>
            <p className="text-lg text-white/60">
              Join hundreds of law firms already using MZM
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { number: "500+", label: "Active Law Firms" },
              { number: "50K+", label: "Cases Managed" },
              { number: "98%", label: "User Satisfaction" },
            ].map((stat, idx) => (
              <div key={idx} className="text-center p-8 bg-[#1a1f2e] border border-white/5 rounded-xl">
                <div className="text-5xl font-heading font-bold text-gold mb-2">{stat.number}</div>
                <div className="text-white/60">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Testimonials Slider */}
          <div className="mt-20">
            <div className="text-center mb-10">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-gold/10 text-gold-300 border border-gold/25 mb-3">
                <Star className="w-3.5 h-3.5 text-gold fill-gold" />
                <span>Advocate &amp; Chamber Testimonials</span>
              </span>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold text-white tracking-tight">
                What Senior Advocates &amp; Chamber Heads Say
              </h3>
              <p className="text-sm md:text-base text-white/60 max-w-xl mx-auto mt-2">
                Real feedback from legal professionals managing litigation, cause lists, and client cases across Pakistan.
              </p>
            </div>

            <ReviewSlider reviews={REVIEWS} />
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className={`${SECTION} bg-[#1a1f2e]/50 border-y border-white/5`}>
        <div className={CONTAINER}>
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading font-bold text-white mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-white/60">
              Choose the plan that fits your firm&apos;s needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.slice(0, 3).map((plan) => (
              <Reveal key={plan.id}>
                <div className="bg-[#0F1117] border border-white/10 hover:border-gold/50 rounded-xl p-8 transition-all duration-300">
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="mb-6">
                    <span className="text-4xl font-heading font-bold text-gold">
                      Rs {Number(plan.price_pkr).toLocaleString()}
                    </span>
                    <span className="text-white/60 text-sm ml-2">
                      / {plan.duration_months} months
                    </span>
                  </div>
                  <Link
                    href="/register"
                    className="w-full block text-center px-6 py-3 bg-gold text-black font-semibold rounded-lg hover:bg-gold/90 transition-all duration-200 mb-6"
                  >
                    Start 7-Day Free Trial
                  </Link>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-white/80">
                      <Check className="w-5 h-5 text-gold flex-shrink-0" />
                      <span>Up to {plan.max_users} users</span>
                    </li>
                    <li className="flex items-center gap-3 text-white/80">
                      <Check className="w-5 h-5 text-gold flex-shrink-0" />
                      <span>Full case management</span>
                    </li>
                    <li className="flex items-center gap-3 text-white/80">
                      <Check className="w-5 h-5 text-gold flex-shrink-0" />
                      <span>Client portal</span>
                    </li>
                    <li className="flex items-center gap-3 text-white/80">
                      <Check className="w-5 h-5 text-gold flex-shrink-0" />
                      <span>24/7 support</span>
                    </li>
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className={`${SECTION} bg-[#0F1117]`}>
        <div className={CONTAINER}>
          <div className="bg-gradient-to-r from-gold/20 to-blue-500/20 border border-white/10 rounded-2xl p-16 text-center">
            <h2 className="text-4xl font-heading font-bold text-white mb-4">
              Ready to Transform Your Law Practice?
            </h2>
            <p className="text-lg text-white/70 mb-3 max-w-2xl mx-auto">
              Get full access with a 7-day free trial. After your trial, simply choose an affordable subscription plan to continue managing your law firm without interruption.
            </p>
            <p className="text-sm font-semibold text-gold-300 mb-8">
              7-day full access &bull; Subscribe after trial &bull; No credit card required to start
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gold text-black font-semibold rounded-lg hover:bg-gold/90 transition-all duration-200 shadow-gold"
            >
              Start 7-Day Free Trial
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
