"use client";

import { useState }          from "react";
import Link                  from "next/link";
import { useTranslation }    from "react-i18next";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { supabase, IS_SUPABASE_CONFIGURED } from "@/lib/supabase/client";
import { Logo }  from "@/components/shared/Logo";
import { BRAND } from "@/lib/brand";

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!IS_SUPABASE_CONFIGURED) return;
    setError(null);
    setLoading(true);
    try {
      const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (err) setError(err.message);
      else     setSent(true);
    } catch { setError(t("auth.networkError")); }
    finally  { setLoading(false); }
  }

  return (
    <div className="min-h-dvh bg-navy flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-modal overflow-hidden animate-fade-in">
        <div className="h-1 bg-gold" />
        <div className="p-7 space-y-6">

          <div className="flex flex-col items-center gap-2">
            <Logo size="md" variant="mark" />
            <h1 className="text-lg font-heading font-semibold text-navy">{t("auth.resetPassword")}</h1>
          </div>

          {sent ? (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <CheckCircle className="w-12 h-12 text-success" />
              <p className="text-sm text-navy-400">{t("auth.resetSent")}</p>
              <Link href="/auth/sign-in" className="btn-primary px-6">
                {t("auth.backToLogin")}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <p className="text-sm text-navy-400">{t("auth.resetEmailLabel")}</p>
              <div className="space-y-1.5">
                <label htmlFor="reset-email" className="label">{t("auth.email")}</label>
                <div className="relative">
                  <Mail className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-300 pointer-events-none" />
                  <input
                    id="reset-email" type="email" autoComplete="email" required
                    value={email} onChange={e => setEmail(e.target.value)}
                    placeholder={t("auth.emailPlaceholder")}
                    disabled={loading}
                    className="input ps-9"
                  />
                </div>
              </div>
              {error && <p role="alert" className="text-danger text-xs">{error}</p>}
              <button
                type="submit"
                disabled={loading || !email}
                className="btn-primary w-full"
              >
                {loading ? t("common.loading") : t("auth.resetPassword")}
              </button>
            </form>
          )}

          <div className="text-center">
            <Link href="/auth/sign-in" className="flex items-center justify-center gap-1 text-xs text-gold hover:underline">
              <ArrowLeft className="w-3.5 h-3.5" /> {t("auth.backToLogin")}
            </Link>
            <Link href="/register" className="text-xs text-navy-400 hover:text-gold hover:underline">
              {t("marketing.signUp")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
