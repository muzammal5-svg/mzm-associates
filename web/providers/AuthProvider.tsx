"use client";

import {
  createContext, useContext, useEffect,
  useState, useCallback, type ReactNode,
} from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase, IS_SUPABASE_CONFIGURED } from "@/lib/supabase/client";
import { canUseWebPush, enableWebPush, disableWebPush, getWebPushSubscriptionEndpoint } from "@/lib/push";
import type { Profile, Firm } from "@/types/supabase";

interface AuthContextValue {
  user:           User    | null;
  session:        Session | null;
  profile:        Profile | null;
  firm:           Firm    | null;
  loading:        boolean;
  profileLoading: boolean;
  configured:     boolean;
  unreadCount:    number;          // unread notifications count
  reminderCount:  number;
  refreshProfile: () => Promise<void>;
  refreshCounts:  () => Promise<void>;
  signOut:        () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user:           null,
  session:        null,
  profile:        null,
  firm:           null,
  loading:        true,
  profileLoading: true,
  configured:     false,
  unreadCount:    0,
  reminderCount:  0,
  refreshProfile: async () => {},
  refreshCounts:  async () => {},
  signOut:        async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,        setUser]        = useState<User    | null>(null);
  const [session,     setSession]     = useState<Session | null>(null);
  const [profile,     setProfile]     = useState<Profile | null>(null);
  const [firm,        setFirm]        = useState<Firm    | null>(null);
  const [loading,     setLoading]     = useState(IS_SUPABASE_CONFIGURED);
  const [profileLoading, setProfileLoading] = useState(IS_SUPABASE_CONFIGURED);
  const [unreadCount, setUnreadCount] = useState(0);
  const [reminderCount, setReminderCount] = useState(0);

  // ── Fetch profile row ────────────────────────────────────────────────────
  const fetchProfile = useCallback(async (userId: string) => {
    setProfileLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      if (error) throw error;
      if (!data) throw new Error("The signed-in user has no profile.");
      const profileData = data as import("@/types/supabase").Profile | null;
      if (profileData) {
        setProfile(profileData);
        const { data: firmData, error: firmError } = await supabase
          .from("firms")
          .select("*")
          .eq("id", profileData.firm_id)
          .single();
        if (firmError) throw firmError;
        setFirm((firmData as import("@/types/supabase").Firm | null) ?? null);
      }
    } catch (error) {
      setProfile(null);
      setFirm(null);
      throw error;
    } finally {
      setProfileLoading(false);
    }
  }, []);

  // ── Fetch unread notification count ──────────────────────────────────────
  const refreshCounts = useCallback(async () => {
    if (!IS_SUPABASE_CONFIGURED) return;
    try {
      const [{ count: unread, error: notificationsError }, { count: upcoming, error: remindersError }] = await Promise.all([
        supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("is_read", false),
        supabase
        .from("reminders")
        .select("id", { count: "exact", head: true })
        .eq("status", "upcoming"),
      ]);
      if (notificationsError) console.error("[notifications] count:", notificationsError.message);
      if (remindersError) console.error("[reminders] count:", remindersError.message);
      setUnreadCount(unread ?? 0);
      setReminderCount(upcoming ?? 0);
    } catch (error) {
      console.error("[notifications] refresh counts:", error);
    }
  }, []);

  // ── Public: re-fetch profile (after photo/name update) ───────────────────
  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfile(user.id);
  }, [user, fetchProfile]);

  // ── Register / remove device token (push) on sign-in / sign-out ───────────
  const registerDeviceToken = useCallback(async (userId: string) => {
    if (!IS_SUPABASE_CONFIGURED || !canUseWebPush()) return;
    try {
      const endpoint = await getWebPushSubscriptionEndpoint();
      if (!endpoint) {
        // Try to subscribe (requires user to have granted notification permission
        // and the VAPID public key to be configured).
        await enableWebPush(userId);
        const ep = await getWebPushSubscriptionEndpoint();
        if (!ep) return;
      }
      // Upsert into device_tokens (platform 'web') so the send-push Edge Function
      // can target this device via FCM/device-token path as well.
      const { error } = await supabase.from("device_tokens").upsert({
        user_id: userId,
        token: await getWebPushSubscriptionEndpoint() ?? "",
        platform: "web",
      }, { onConflict: "token" });
      if (error) console.error("[device_token] upsert:", error.message);
    } catch (error) {
      // Non-fatal: push registration is optional.
      console.error("[device_token] register:", error);
    }
  }, []);

  const removeDeviceToken = useCallback(async (userId: string) => {
    if (!IS_SUPABASE_CONFIGURED || !userId) return;
    try {
      await supabase.from("device_tokens").delete().eq("user_id", userId);
    } catch (error) {
      console.error("[device_token] remove:", error);
    }
  }, []);

  // ── Auth state listener ───────────────────────────────────────────────────
  useEffect(() => {
    if (!IS_SUPABASE_CONFIGURED) {
      setLoading(false);
      setProfileLoading(false);
      return;
    }

    void (async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        setSession(data.session);
        setUser(data.session?.user ?? null);
        if (data.session?.user) {
          await fetchProfile(data.session.user.id);
          await refreshCounts();
          await registerDeviceToken(data.session.user.id);
        } else {
          setProfile(null);
          setFirm(null);
          setProfileLoading(false);
        }
      } catch (error) {
        console.error("[auth] session/profile load:", error);
        setProfileLoading(false);
      } finally {
        setLoading(false);
      }
    })();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        if (newSession?.user) {
          setProfileLoading(true);
          setLoading(false);
          void fetchProfile(newSession.user.id)
            .then(refreshCounts)
            .then(() => registerDeviceToken(newSession.user.id))
            .catch(error => console.error("[auth] profile load:", error));
        } else {
          setProfile(null);
          setFirm(null);
          setUnreadCount(0);
          setReminderCount(0);
          setProfileLoading(false);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchProfile, refreshCounts, registerDeviceToken]);

  // ── Poll unread count every 60 s when user is active ─────────────────────
  useEffect(() => {
    if (!user || !IS_SUPABASE_CONFIGURED) return;
    const id = setInterval(refreshCounts, 60_000);
    return () => clearInterval(id);
  }, [user, refreshCounts]);

  useEffect(() => {
    if (!user || !IS_SUPABASE_CONFIGURED) return;
    const channel = supabase
      .channel(`notification-badges:${user.id}`)
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${user.id}`,
      }, () => { void refreshCounts(); })
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "reminders",
        filter: `user_id=eq.${user.id}`,
      }, () => { void refreshCounts(); })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [user, refreshCounts]);

  const signOut = useCallback(async () => {
    if (user) await removeDeviceToken(user.id);
    await supabase.auth.signOut();
    setProfile(null);
    setFirm(null);
    setUnreadCount(0);
    setReminderCount(0);
  }, [user, removeDeviceToken]);

  return (
    <AuthContext.Provider value={{
      user, session, profile, firm, loading, profileLoading,
      configured: IS_SUPABASE_CONFIGURED,
      unreadCount, reminderCount, refreshProfile, refreshCounts, signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
