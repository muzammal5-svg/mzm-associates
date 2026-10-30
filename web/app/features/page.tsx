"use client";

import { useTranslation } from "react-i18next";
import {
  Briefcase, Users, Clock, FileText, Bell, Shield, Zap, BarChart3,
  Lock, Globe, Smartphone, CheckCircle
} from "lucide-react";
import { PublicHeader } from "@/components/marketing/PublicHeader";
import { PublicFooter } from "@/components/marketing/PublicFooter";
import { Reveal } from "@/components/marketing/Reveal";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const CONTAINER = "max-w-[1200px] mx-auto px-4 md:px-6";
const SECTION = "py-[80px] md:py-[120px]";

interface Feature {
  icon: React.ComponentType<{ className?: string }>;
  titleKey: string;
  descKey: string;
  benefits: string[];
}

export default function FeaturesPage() {
  const { t } = useTranslation();

  const features: Feature[] = [
    {
      icon: Briefcase,
      titleKey: "features.caseManagementTitle",
      descKey: "features.caseManagementDesc",
      benefits: ["caseList", "statusTracking", "documentStorage", "deadlineTracking"]
    },
    {
      icon: Users,
      titleKey: "features.clientPortalTitle",
      descKey: "features.clientPortalDesc",
      benefits: ["secureAccess", "caseUpdates", "documentSharing", "communication"]
    },
    {
      icon: Clock,
      titleKey: "features.remindersTitle",
      descKey: "features.remindersDesc",
      benefits: ["smartReminders", "pushNotifications", "emailAlerts", "customization"]
    },
    {
      icon: FileText,
      titleKey: "features.documentsTitle",
      descKey: "features.documentsDesc",
      benefits: ["centralizedStorage", "versionControl", "quickAccess", "organization"]
    },
    {
      icon: BarChart3,
      titleKey: "features.analyticsTitle",
      descKey: "features.analyticsDesc",
      benefits: ["practiceMetrics", "caseAnalytics", "clientInsights", "reporting"]
    },
    {
      icon: Lock,
      titleKey: "features.securityTitle",
      descKey: "features.securityDesc",
      benefits: ["encryption", "compliance", "dataBackup", "accessControl"]
    },
    {
      icon: Zap,
      titleKey: "features.automationTitle",
      descKey: "features.automationDesc",
      benefits: ["taskAutomation", "workflowOptimization", "timeTracking", "efficiency"]
    },
    {
      icon: Globe,
      titleKey: "features.multiLanguageTitle",
      descKey: "features.multiLanguageDesc",
      benefits: ["urduEnglish", "rtlSupport", "culturalAdaptation", "accessibility"]
    },
  ];

  // Fallback text for features
  const featureTexts: Record<string, { title: string; desc: string; benefits: Record<string, string> }> = {
    caseManagement: {
      title: "Case Management",
      desc: "Organize and track all cases with automated status updates and deadline management",
      benefits: {
        caseList: "Daily cause list",
        statusTracking: "Real-time status tracking",
        documentStorage: "Secure document storage",
        deadlineTracking: "Automatic deadline tracking"
      }
    },
    clientPortal: {
      title: "Client Portal",
      desc: "Give clients access to their case details with a secure, easy-to-use interface",
      benefits: {
        secureAccess: "Secure client access",
        caseUpdates: "Real-time case updates",
        documentSharing: "Document sharing",
        communication: "Direct communication"
      }
    },
    reminders: {
      title: "Smart Reminders",
      desc: "Never miss important dates with intelligent reminder system",
      benefits: {
        smartReminders: "Intelligent reminders",
        pushNotifications: "Push notifications",
        emailAlerts: "Email alerts",
        customization: "Custom schedules"
      }
    },
    documents: {
      title: "Document Management",
      desc: "Centralize all documents with version control and quick access",
      benefits: {
        centralizedStorage: "Centralized storage",
        versionControl: "Version control",
        quickAccess: "Quick access",
        organization: "Organized folders"
      }
    },
    analytics: {
      title: "Analytics & Reporting",
      desc: "Get insights into your practice with comprehensive reporting",
      benefits: {
        practiceMetrics: "Practice metrics",
        caseAnalytics: "Case analytics",
        clientInsights: "Client insights",
        reporting: "Custom reports"
      }
    },
    security: {
      title: "Security & Compliance",
      desc: "Bank-level encryption and compliance with Pakistani legal requirements",
      benefits: {
        encryption: "Bank-level encryption",
        compliance: "Legal compliance",
        dataBackup: "Automatic backups",
        accessControl: "Access controls"
      }
    },
    automation: {
      title: "Automation",
      desc: "Automate repetitive tasks and focus on what matters most",
      benefits: {
        taskAutomation: "Task automation",
        workflowOptimization: "Workflow optimization",
        timeTracking: "Time tracking",
        efficiency: "Increased efficiency"
      }
    },
    multiLanguage: {
      title: "Multi-Language Support",
      desc: "Full Urdu and English support with RTL formatting",
      benefits: {
        urduEnglish: "Urdu & English",
        rtlSupport: "RTL support",
        culturalAdaptation: "Cultural adaptation",
        accessibility: "Accessible design"
      }
    }
  };

  return (
    <div className="min-h-dvh bg-[#0F1117]">
      <PublicHeader overDark />

      {/* ── HERO ── */}
      <section className="relative min-h-[500px] flex items-center justify-center overflow-hidden bg-gradient-to-b from-black to-[#0F1117]">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-10" />
          <div className="absolute top-20 right-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        </div>

        <div className={`${CONTAINER} relative z-20 py-20 md:py-32 text-center`}>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-white leading-tight mb-6">
            Powerful Features Built for <span className="text-gold">Modern Legal Practice</span>
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Everything you need to manage cases, clients, and your entire law practice efficiently and securely.
          </p>
        </div>
      </section>

      {/* ── FEATURES GRID ── */}
      <section className={`${SECTION} bg-[#0F1117]`}>
        <div className={CONTAINER}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              const featureKey = Object.keys(featureTexts).find(key => 
                featureTexts[key].title === t(feature.titleKey, featureTexts[key].title)
              ) || Object.keys(featureTexts)[idx];
              const fallback = featureTexts[featureKey] || featureTexts.caseManagement;
              const title = t(feature.titleKey, fallback.title);
              const desc = t(feature.descKey, fallback.desc);

              return (
                <Reveal key={idx}>
                  <div className="bg-gradient-to-br from-[#1a1f2e] to-[#0F1117] border border-white/5 hover:border-gold/30 rounded-2xl p-8 transition-all duration-300 hover:shadow-lg hover:shadow-gold/10 group">
                    {/* Icon */}
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gold/20 to-blue-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-7 h-7 text-gold" />
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                    <p className="text-white/60 mb-6 leading-relaxed">{desc}</p>

                    {/* Benefits */}
                    <ul className="space-y-2">
                      {feature.benefits.map((benefit, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-white/70">
                          <CheckCircle className="w-4 h-4 text-gold flex-shrink-0" />
                          <span>{t(`features.benefit_${benefit}`, fallback.benefits[benefit] || benefit)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── COMPARISON TABLE ── */}
      <section className={`${SECTION} bg-[#1a1f2e]/50 border-y border-white/5`}>
        <div className={CONTAINER}>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
              {t("features.comparisonTitle", "Feature Comparison")}
            </h2>
            <p className="text-lg text-white/60">
              {t("features.comparisonSubtitle", "All plans include everything you need")}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-4 px-6 text-white font-semibold">{t("features.featureName", "Feature")}</th>
                  <th className="text-center py-4 px-6 text-white/70 font-semibold">{t("features.starter", "Starter")}</th>
                  <th className="text-center py-4 px-6 text-white/70 font-semibold">{t("features.professional", "Professional")}</th>
                  <th className="text-center py-4 px-6 text-gold font-semibold">{t("features.enterprise", "Enterprise")}</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { key: "caseManagement", label: "Case Management" },
                  { key: "clientPortal", label: "Client Portal" },
                  { key: "reminders", label: "Smart Reminders" },
                  { key: "documentStorage", label: "Document Storage" },
                  { key: "analytics", label: "Analytics" },
                  { key: "customization", label: "Customization" },
                  { key: "apiAccess", label: "API Access" },
                  { key: "support", label: "Priority Support" }
                ].map((feature, idx) => (
                  <tr key={idx} className="border-b border-white/5 hover:bg-white/2">
                    <td className="py-4 px-6 text-white font-medium">{t(`features.compare_${feature.key}`, feature.label)}</td>
                    <td className="py-4 px-6 text-center"><CheckCircle className="w-5 h-5 text-gold mx-auto" /></td>
                    <td className="py-4 px-6 text-center"><CheckCircle className="w-5 h-5 text-gold mx-auto" /></td>
                    <td className="py-4 px-6 text-center"><CheckCircle className="w-5 h-5 text-gold mx-auto" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={`${SECTION} bg-[#0F1117]`}>
        <div className={CONTAINER}>
          <div className="bg-gradient-to-r from-gold/20 to-blue-500/20 border border-white/10 rounded-2xl p-16 text-center">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
              {t("features.ctaTitle", "Ready to get started?")}
            </h2>
            <p className="text-lg text-white/60 mb-8 max-w-2xl mx-auto">
              {t("features.ctaDesc", "Join hundreds of law firms already using MZM")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gold text-black font-semibold rounded-lg hover:bg-gold/90 transition-all duration-200 text-sm"
              >
                {t("marketing.viewPlans", "View Plans")}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/30 text-white font-semibold rounded-lg hover:bg-white/5 transition-all duration-200 text-sm"
              >
                {t("marketing.startTrial", "Start Free Trial")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
