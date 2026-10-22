"use client";

import { useState, useRef }   from "react";
import Image                  from "next/image";
import { useTranslation }     from "react-i18next";
import { Camera, Eye, EyeOff, Save } from "lucide-react";
import { useForm }            from "react-hook-form";
import { zodResolver }        from "@hookform/resolvers/zod";
import { z }                  from "zod";

import { AppShell }    from "@/components/layout/AppShell";
import { RouteGuard }  from "@/components/shared/RouteGuard";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input }       from "@/components/ui/Input";
import { Button }      from "@/components/ui/Button";
import { RoleBadge }   from "@/components/ui/Badge";
import { useMutationLock } from "@/components/shared/MutatingButton";
import { useToast }    from "@/components/ui/Toast";
import { useAuth }     from "@/providers/AuthProvider";
import { supabase, update } from "@/lib/supabase/client";

// ── Zod schemas ──────────────────────────────────────────────────────────────
const profileSchema = z.object({
  full_name: z.string().min(2, "Minimum 2 characters"),
  phone:     z.string().optional(),
});

const passwordSchema = z.object({
  current_password: z.string().min(1, "Required"),
  new_password:     z.string().min(8, "Minimum 8 characters"),
  confirm_password: z.string().min(8),
}).refine(d => d.new_password === d.confirm_password, {
  message: "Passwords do not match",
  path:    ["confirm_password"],
});

type ProfileForm   = z.infer<typeof profileSchema>;
type PasswordForm  = z.infer<typeof passwordSchema>;

// ── Profile page component ───────────────────────────────────────────────────
function ProfilePage() {
  const { t }                       = useTranslation();
  const { profile, firm, refreshProfile } = useAuth();
  const toast                       = useToast();
  const { lock, canMutate } = useMutationLock();
  const fileRef                     = useRef<HTMLInputElement>(null);

  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showCurrent,    setShowCurrent]    = useState(false);
  const [showNew,        setShowNew]        = useState(false);

  // ── Profile form ──────────────────────────────────────────────────────────
  const {
    register: regProfile,
    handleSubmit: handleProfile,
    formState: { errors: profileErrors, isSubmitting: savingProfile },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile?.full_name ?? "",
      phone:     profile?.phone     ?? "",
    },
  });

  async function onSaveProfile(data: ProfileForm) {
    if (!profile || !canMutate) return;
    const { error } = await update.profile(profile.id, {
      full_name: data.full_name,
      phone:     data.phone ?? null,
    });

    if (error) toast.error(t("common.error"), error.message);
    else {
      await refreshProfile();
      toast.success(t("profile.saved"));
    }
  }

  // ── Password form ─────────────────────────────────────────────────────────
  const {
    register: regPwd,
    handleSubmit: handlePwd,
    reset: resetPwd,
    formState: { errors: pwdErrors, isSubmitting: savingPwd },
  } = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });

  async function onChangePassword(data: PasswordForm) {
    // Re-authenticate first
    const { error: authErr } = await supabase.auth.signInWithPassword({
      email:    profile?.email ?? "",
      password: data.current_password,
    });
    if (authErr) { toast.error(t("common.error"), t("auth.invalidCreds")); return; }

    const { error } = await supabase.auth.updateUser({ password: data.new_password });
    if (error) toast.error(t("common.error"), error.message);
    else { resetPwd(); toast.success(t("profile.passwordChanged")); }
  }

  // ── Photo upload ──────────────────────────────────────────────────────────
  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !profile || !canMutate) return;

    // ── Client-side validation ────────────────────────────────────────────
    const MAX_SIZE = 5 * 1024 * 1024; // 5 MB (matches avatars bucket limit)
    const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
    if (!ALLOWED.includes(file.type)) {
      toast.error(t("profile.photoUploadError"), t("profile.invalidFileType"));
      return;
    }
    if (file.size > MAX_SIZE) {
      toast.error(t("profile.photoUploadError"), t("profile.fileTooLarge"));
      return;
    }

    setUploadingPhoto(true);
    try {
      const ext  = (file.name.split(".").pop() ?? "jpg").replace(/[^a-zA-Z0-9]/g, "");
      const path = `${profile.id}/${crypto.randomUUID()}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, cacheControl: "3600" });
      if (upErr) { toast.error(t("profile.photoUploadError"), upErr.message); return; }

      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
      const { error: updateErr } = await update.profile(profile.id, { photo_url: urlData.publicUrl });

      if (updateErr) toast.error(t("profile.photoUploadError"), updateErr.message);
      else { await refreshProfile(); toast.success(t("profile.photoUploaded")); }
    } finally { setUploadingPhoto(false); }
  }

  return (
    <AppShell pageTitle={t("profile.title")} showBack>
      <div className="max-w-xl mx-auto space-y-6">

        {/* ── Avatar ── */}
        <Card className="flex flex-col items-center gap-4 py-6">
          <div className="relative">
            {profile?.photo_url ? (
              <Image
                src={profile.photo_url}
                alt={profile.full_name}
                width={88} height={88}
                className="w-22 h-22 rounded-full object-cover border-4 border-white shadow-card"
                unoptimized
              />
            ) : (
              <div className="w-22 h-22 rounded-full bg-gold/15 border-4 border-white shadow-card flex items-center justify-center">
                <span className="text-gold text-3xl font-bold leading-none">
                  {profile?.full_name?.charAt(0)?.toUpperCase() ?? "?"}
                </span>
              </div>
            )}
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploadingPhoto}
              aria-label={t("profile.changePhoto")}
              {...lock}
              className="absolute bottom-0 end-0 w-8 h-8 rounded-full bg-gold text-white flex items-center justify-center shadow-card hover:bg-gold-600 transition-colors disabled:opacity-50"
            >
              <Camera className="w-4 h-4" />
            </button>
            <input
              ref={fileRef} type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={handlePhotoChange}
              disabled={!canMutate}
            />
          </div>
          <div className="text-center">
            <p className="font-heading font-semibold text-navy text-lg">{profile?.full_name}</p>
            <p className="text-sm text-navy-400">{profile?.email}</p>
            <div className="flex items-center justify-center gap-2 mt-1">
              {profile?.role && <RoleBadge role={profile.role} />}
              {firm && (
                <span className="text-xs text-navy-300">{firm.name}</span>
              )}
            </div>
          </div>
        </Card>

        {/* ── Edit profile ── */}
        <Card>
          <CardHeader>
            <CardTitle>{t("profile.edit")}</CardTitle>
          </CardHeader>
          <form onSubmit={handleProfile(onSaveProfile)} className="space-y-4">
            <Input
              label={t("profile.fullName")}
              required
              error={profileErrors.full_name?.message}
              {...regProfile("full_name")}
            />
            <Input
              label={t("profile.phone")}
              type="tel"
              error={profileErrors.phone?.message}
              hint={t("common.optional")}
              {...regProfile("phone")}
            />
            <Input
              label={t("profile.email")}
              type="email"
              defaultValue={profile?.email ?? ""}
              disabled
              hint="Email cannot be changed here."
            />
            <Button
              type="submit"
              {...lock}
              loading={savingProfile}
              leftIcon={<Save className="w-4 h-4" />}
              fullWidth
            >
              {t("common.save")}
            </Button>
          </form>
        </Card>

        {/* ── Change password ── */}
        <Card>
          <CardHeader>
            <CardTitle>{t("profile.changePassword")}</CardTitle>
          </CardHeader>
          <form onSubmit={handlePwd(onChangePassword)} className="space-y-4">
            <div className="relative">
              <Input
                label={t("profile.currentPassword")}
                type={showCurrent ? "text" : "password"}
                autoComplete="current-password"
                error={pwdErrors.current_password?.message}
                required
                {...regPwd("current_password")}
              />
              <button
                type="button"
                aria-label={showCurrent ? t("auth.hidePassword") : t("auth.showPassword")}
                onClick={() => setShowCurrent(v => !v)}
                className="absolute end-3 bottom-2.5 text-navy-300 hover:text-navy"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="relative">
              <Input
                label={t("profile.newPassword")}
                type={showNew ? "text" : "password"}
                autoComplete="new-password"
                error={pwdErrors.new_password?.message}
                required
                {...regPwd("new_password")}
              />
              <button
                type="button"
                aria-label={showNew ? t("auth.hidePassword") : t("auth.showPassword")}
                onClick={() => setShowNew(v => !v)}
                className="absolute end-3 bottom-2.5 text-navy-300 hover:text-navy"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <Input
              label={t("profile.confirmPassword")}
              type="password"
              autoComplete="new-password"
              error={pwdErrors.confirm_password?.message}
              required
              {...regPwd("confirm_password")}
            />
            <Button type="submit" loading={savingPwd} variant="secondary" fullWidth>
              {t("profile.changePassword")}
            </Button>
          </form>
        </Card>

      </div>
    </AppShell>
  );
}

export default function ProfilePageRoute() {
  return <RouteGuard><ProfilePage /></RouteGuard>;
}
