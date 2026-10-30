"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { MessageSquare, Mail, MapPin, Phone, Send, CheckCircle } from "lucide-react";
import { PublicHeader } from "@/components/marketing/PublicHeader";
import { PublicFooter } from "@/components/marketing/PublicFooter";
import { Reveal } from "@/components/marketing/Reveal";

const CONTAINER = "max-w-[1200px] mx-auto px-4 md:px-6";
const SECTION = "py-[80px] md:py-[120px]";

interface FormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export default function ContactPage() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    subject: "General Inquiry",
    message: ""
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Simulate form submission (in production, connect to backend API)
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSubmitted(true);
      setFormData({ name: "", email: "", phone: "", subject: "General Inquiry", message: "" });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setLoading(false);
    }
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
            Get in <span className="text-gold">Touch</span>
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Have questions? Our support team is here to help. Reach out anytime.
          </p>
        </div>
      </section>

      {/* ── CONTACT CHANNELS ── */}
      <section className={`${SECTION} bg-[#0F1117]`}>
        <div className={CONTAINER}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* WhatsApp */}
            <Reveal>
              <div className="bg-[#1a1f2e] border border-white/5 hover:border-gold/30 rounded-2xl p-8 text-center transition-all duration-300 group">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-400/20 to-green-600/20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <MessageSquare className="w-7 h-7 text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{t("contact.whatsapp") || "WhatsApp"}</h3>
                <p className="text-white/60 text-sm mb-4">
                  {t("contact.whatsappDesc") || "Chat with us on WhatsApp for quick support"}
                </p>
                <a
                  href="https://wa.me/923001234567"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-all duration-200 text-sm"
                >
                  {t("contact.chatNow") || "Chat Now"}
                </a>
              </div>
            </Reveal>

            {/* Email */}
            <Reveal>
              <div className="bg-[#1a1f2e] border border-white/5 hover:border-gold/30 rounded-2xl p-8 text-center transition-all duration-300 group">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-400/20 to-blue-600/20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Mail className="w-7 h-7 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{t("contact.email") || "Email"}</h3>
                <p className="text-white/60 text-sm mb-4">
                  {t("contact.emailDesc") || "Send us an email and we'll respond within 24 hours"}
                </p>
                <a
                  href="mailto:support@mzm.app"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-blue-400 text-blue-400 font-semibold rounded-lg hover:bg-blue-400/10 transition-all duration-200 text-sm"
                >
                  {t("contact.sendEmail") || "Send Email"}
                </a>
              </div>
            </Reveal>

            {/* Office */}
            <Reveal>
              <div className="bg-[#1a1f2e] border border-white/5 hover:border-gold/30 rounded-2xl p-8 text-center transition-all duration-300 group">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gold/20 to-gold/40 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <MapPin className="w-7 h-7 text-gold" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{t("contact.office") || "Office"}</h3>
                <p className="text-white/60 text-sm mb-4">
                  {t("contact.officeDesc") || "Visit our office in Lahore"}
                </p>
                <p className="text-white font-semibold text-sm">
                  {t("contact.officeAddress") || "123 Main Street, Lahore"}
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── CONTACT FORM ── */}
      <section className={`${SECTION} bg-[#1a1f2e]/50 border-y border-white/5`}>
        <div className={CONTAINER}>
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-heading font-bold text-white mb-3">
                {t("contact.sendMessage") || "Send us a message"}
              </h2>
              <p className="text-white/60">
                {t("contact.formDesc") || "Fill out the form below and we'll get back to you shortly"}
              </p>
            </div>

            <Reveal>
              <div className="bg-[#0F1117] border border-white/5 rounded-2xl p-8 md:p-10">
                {submitted && (
                  <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <p className="text-green-400 text-sm">
                      {t("contact.success") || "Thank you! We'll get back to you soon."}
                    </p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      {t("contact.name") || "Full Name"} *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full bg-[#1a1f2e] border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-gold/50 transition-colors"
                      placeholder={t("contact.namePlaceholder") || "Your name"}
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      {t("contact.emailLabel") || "Email Address"} *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full bg-[#1a1f2e] border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-gold/50 transition-colors"
                      placeholder={t("contact.emailPlaceholder") || "your@email.com"}
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      {t("contact.phone") || "Phone Number"}
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full bg-[#1a1f2e] border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-gold/50 transition-colors"
                      placeholder={t("contact.phonePlaceholder") || "+92 300 1234567"}
                    />
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      {t("contact.subject") || "Subject"} *
                    </label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full bg-[#1a1f2e] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold/50 transition-colors"
                    >
                      <option value="General Inquiry">{t("contact.generalInquiry") || "General Inquiry"}</option>
                      <option value="Billing">{t("contact.billing") || "Billing"}</option>
                      <option value="Technical Support">{t("contact.technicalSupport") || "Technical Support"}</option>
                      <option value="Feature Request">{t("contact.featureRequest") || "Feature Request"}</option>
                      <option value="Enterprise">{t("contact.enterprise") || "Enterprise"}</option>
                    </select>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      {t("contact.message") || "Message"} *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      className="w-full bg-[#1a1f2e] border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-gold/50 transition-colors resize-none"
                      placeholder={t("contact.messagePlaceholder") || "Tell us how we can help..."}
                    />
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-gold text-black font-semibold rounded-lg hover:bg-gold/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        {t("contact.sending") || "Sending..."}
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        {t("contact.send") || "Send Message"}
                      </>
                    )}
                  </button>
                </form>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
