"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, Search } from "lucide-react";
import { PublicHeader } from "@/components/marketing/PublicHeader";
import { PublicFooter } from "@/components/marketing/PublicFooter";
import { Reveal } from "@/components/marketing/Reveal";
import Link from "next/link";

const CONTAINER = "max-w-[1200px] mx-auto px-4 md:px-6";
const SECTION = "py-[80px] md:py-[120px]";

interface FAQItem {
  category: string;
  questions: Array<{
    q: string;
    a: string;
  }>;
}

export default function FAQPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const faqs: FAQItem[] = [
    {
      category: "General",
      questions: [
        {
          q: t("faq.q1") || "What is MZM?",
          a: t("faq.a1") || "MZM is a comprehensive law practice management platform designed specifically for Pakistani law firms."
        },
        {
          q: t("faq.q2") || "Who can use MZM?",
          a: t("faq.a2") || "MZM is perfect for solo practitioners, small law firms, and large enterprises managing multiple cases and clients."
        },
        {
          q: t("faq.q3") || "Is there a free trial?",
          a: t("faq.a3") || "Yes! We offer a 7-day free trial with full access to all features. After 7 days, subscribe to a plan to continue managing your firm. No credit card required to start."
        },
      ]
    },
    {
      category: "Features",
      questions: [
        {
          q: t("faq.q4") || "What is case management?",
          a: t("faq.a4") || "Case management in MZM lets you organize all case details, documents, and deadlines in one secure location."
        },
        {
          q: t("faq.q5") || "How do reminders work?",
          a: t("faq.a5") || "MZM sends automated reminders via push notifications, email, and SMS for important dates and deadlines."
        },
        {
          q: t("faq.q6") || "Can clients see their cases?",
          a: t("faq.a6") || "Yes, clients have secure access to a portal showing their case status, documents, and communication history."
        },
        {
          q: t("faq.q7") || "Does it support Urdu?",
          a: t("faq.a7") || "Yes! MZM has full Urdu language support with proper RTL formatting and culturally adapted features."
        },
      ]
    },
    {
      category: "Pricing",
      questions: [
        {
          q: t("faq.q8") || "How is pricing calculated?",
          a: t("faq.a8") || "Our pricing is simple: you pay per month based on the plan you choose. No hidden fees or surprise charges."
        },
        {
          q: t("faq.q9") || "Can I change plans?",
          a: t("faq.a9") || "Absolutely. Upgrade or downgrade your plan anytime. Changes take effect immediately."
        },
        {
          q: t("faq.q10") || "What payment methods do you accept?",
          a: t("faq.a10") || "We accept bank transfers, JazzCash, Easypaisa, and other major payment methods in Pakistan."
        },
        {
          q: t("faq.q11") || "Is there a money-back guarantee?",
          a: t("faq.a11") || "We offer a full refund within 7 days if you're not satisfied with our service."
        },
      ]
    },
    {
      category: "Security & Support",
      questions: [
        {
          q: t("faq.q12") || "How secure is my data?",
          a: t("faq.a12") || "We use bank-level encryption, regular backups, and comply with international security standards."
        },
        {
          q: t("faq.q13") || "What support do you offer?",
          a: t("faq.a13") || "We provide 24/7 support via WhatsApp, email, and our help center. Premium plans include priority support."
        },
        {
          q: t("faq.q14") || "Can I export my data?",
          a: t("faq.a14") || "Yes, you can export all your data anytime in standard formats. Your data belongs to you."
        },
        {
          q: t("faq.q15") || "Is there a learning curve?",
          a: t("faq.a15") || "No! MZM is designed to be intuitive. We provide tutorials and support to help you get started quickly."
        },
      ]
    },
  ];

  // Filter FAQs based on search
  const filteredFaqs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(
      item => 
        item.q.toLowerCase().includes(search.toLowerCase()) ||
        item.a.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  const toggleQuestion = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="min-h-dvh bg-[#0F1117]">
      <PublicHeader overDark />

      {/* ── HERO ── */}
      <section className="relative min-h-[400px] flex items-center justify-center overflow-hidden bg-gradient-to-b from-black to-[#0F1117]">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-10" />
          <div className="absolute top-20 right-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
        </div>

        <div className={`${CONTAINER} relative z-20 py-20 md:py-32 text-center`}>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-white leading-tight mb-6">
            Frequently Asked <span className="text-gold">Questions</span>
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Find answers to common questions about MZM features, pricing, and support
          </p>
        </div>
      </section>

      {/* ── SEARCH ── */}
      <section className={`${SECTION} bg-[#0F1117]`}>
        <div className={CONTAINER}>
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
              <input
                type="text"
                placeholder={t("faq.searchPlaceholder") || "Search FAQs..."}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#1a1f2e] border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:border-gold/50 transition-colors"
              />
            </div>
          </div>

          {/* FAQs by Category */}
          <div className="max-w-4xl mx-auto space-y-12">
            {filteredFaqs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-white/60 text-lg">{t("faq.noResults") || "No results found"}</p>
              </div>
            ) : (
              filteredFaqs.map((category, catIdx) => (
                <Reveal key={catIdx}>
                  <div>
                    <h2 className="text-2xl font-heading font-bold text-gold mb-6">{category.category}</h2>
                    <div className="space-y-4">
                      {category.questions.map((item, idx) => {
                        const uniqueId = `${catIdx}-${idx}`;
                        const isOpen = openId === uniqueId;

                        return (
                          <button
                            key={uniqueId}
                            onClick={() => toggleQuestion(uniqueId)}
                            className="w-full text-left"
                          >
                            <div className="bg-[#1a1f2e] border border-white/5 hover:border-gold/30 rounded-xl p-6 transition-all duration-300 group">
                              <div className="flex items-start gap-4">
                                <ChevronDown
                                  className={`w-5 h-5 text-gold mt-1 flex-shrink-0 transition-transform duration-300 ${
                                    isOpen ? "rotate-180" : ""
                                  }`}
                                />
                                <h3 className="text-lg font-semibold text-white group-hover:text-gold transition-colors">
                                  {item.q}
                                </h3>
                              </div>

                              {isOpen && (
                                <div className="mt-4 ml-9 pt-4 border-t border-white/5">
                                  <p className="text-white/70 leading-relaxed">{item.a}</p>
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </Reveal>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ── CONTACT CTA ── */}
      <section className="py-16 bg-[#1a1f2e]/50 border-t border-white/5">
        <div className={CONTAINER}>
          <div className="bg-gradient-to-r from-gold/20 to-blue-500/20 border border-white/10 rounded-2xl p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-white mb-3">
              {t("faq.stillNeed") || "Still have questions?"}
            </h2>
            <p className="text-white/60 mb-6">
              {t("faq.contactUs") || "Contact our support team for help."}
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-3 bg-gold text-black font-semibold rounded-lg hover:bg-gold/90 transition-all duration-200"
            >
              {t("faq.contactSupport") || "Contact Support"}
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
