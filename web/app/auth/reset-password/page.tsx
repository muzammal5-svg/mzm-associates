"use client";

import { useState, useEffect }  from "react";
import { useRouter }            from "next/navigation";
import { useTranslation }       from "react-i18next";
import { Eye, EyeOff, CheckCircle } from "lucide-react";
import { supabase }             from "@/lib/supabase/client";
import { Logo }                 from "@/components/shared/Logo";

export default function ResetPasswordPage() {
  const { t }  = useTranslation();
  const router = useRouter();

  const [newPwd,    setNewPwd]    = useState("");
  const [confirmPwd,setConfirmPwd]= useState("");
  const [showPwd,   setShowPwd]   = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [done,      setDone]      = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  // Supabase sends the session via URL hash on email-link redirect
  useEffect(() => {
    supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        // Session is now active — allow form submission
      }
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPwd.length < 8) { setError(t("profile.passwordMin")); return; }
    if (newPwd !== confirmPwd) { setError(t("profile.passwordMatch")); return; }
    setError(null);
    setLoading(true);
    try {
      const { error: err } = await supabase.auth.updateUser({ password: newPwd });
      if (err) setError(err.message);
      else { setDone(true); setTimeout(() => router.replace("/"), 2000); }
    } catch { setError(t("auth.networkError")); }
    finally { setLoading(false); }
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

          {done ? (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <CheckCircle className="w-12 h-12 text-success" />
              <p className="text-sm font-semibold text-navy">{t("profile.passwordChanged")}</p>
              <p className="text-xs text-navy-500">{t("common.loading")}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="space-y-1.5">
                <label htmlFor="new-password" className="label text-navy-700">{t("profile.newPassword")}</label>
                <div className="relative">
                  <input
                    id="new-password" type={showPwd ? "text" : "password"}
                    autoComplete="new-password" required minLength={8}
                    value={newPwd} onChange={e => setNewPwd(e.target.value)}
                    className="input pe-10" disabled={loading}
                  />
                  <button type="button" onClick={() => setShowPwd(v => !v)}
                    className="absolute end-3 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy p-0.5"
                    aria-label={showPwd ? t("auth.hidePassword") : t("auth.showPassword")}
                  >
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="confirm-password" className="label text-navy-700">{t("profile.confirmPassword")}</label>
                <input
                  id="confirm-password" type="password" autoComplete="new-password" required
                  value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)}
                  className="input" disabled={loading}
                />
              </div>
              {error && <p role="alert" className="text-danger text-xs font-medium">{error}</p>}
              <button type="submit" disabled={loading || !newPwd || !confirmPwd} className="btn-primary w-full">
                {loading ? t("common.loading") : t("common.save")}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
