import { supabase, supabaseRaw } from "@/lib/supabase/client";

function decodeVapidKey(key: string): ArrayBuffer {
  const padding = "=".repeat((4 - key.length % 4) % 4);
  const base64 = (key + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  const decoded = Uint8Array.from(raw, character => character.charCodeAt(0));
  const buffer = new ArrayBuffer(decoded.length);
  new Uint8Array(buffer).set(decoded);
  return buffer;
}

export function canUseWebPush(): boolean {
  return typeof window !== "undefined"
    && "Notification" in window
    && "serviceWorker" in navigator
    && "PushManager" in window;
}

export async function getWebPushSubscriptionEndpoint(): Promise<string | null> {
  if (!canUseWebPush()) return null;
  const registration = await navigator.serviceWorker.getRegistration("/");
  const subscription = await registration?.pushManager.getSubscription();
  return subscription?.endpoint ?? null;
}

export async function enableWebPush(userId: string): Promise<void> {
  if (!canUseWebPush()) throw new Error("This browser does not support Web Push.");
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!publicKey) throw new Error("NEXT_PUBLIC_VAPID_PUBLIC_KEY is not configured.");

  const permission = await Notification.requestPermission();
  if (permission !== "granted") throw new Error("Browser notification permission was not granted.");

  await navigator.serviceWorker.register("/sw.js");
  const readyRegistration = await navigator.serviceWorker.ready;
  const subscription = await readyRegistration.pushManager.getSubscription()
    ?? await readyRegistration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: decodeVapidKey(publicKey),
    });
  const json = subscription.toJSON();
  const p256dh = json.keys?.p256dh;
  const auth = json.keys?.auth;
  if (!p256dh || !auth) throw new Error("Browser did not provide valid push subscription keys.");

  const { error } = await supabaseRaw
    .from("push_subscriptions")
    .upsert({
      user_id: userId,
      endpoint: subscription.endpoint,
      p256dh,
      auth_key: auth,
      user_agent: navigator.userAgent,
    }, { onConflict: "endpoint" });
  if (error) throw error;
}

export async function disableWebPush(userId: string): Promise<void> {
  if (!canUseWebPush()) return;
  const registration = await navigator.serviceWorker.getRegistration("/");
  const subscription = await registration?.pushManager.getSubscription();
  if (!subscription) return;

  const { error } = await supabaseRaw
    .from("push_subscriptions")
    .delete()
    .eq("user_id", userId)
    .eq("endpoint", subscription.endpoint);
  if (error) throw error;
  await subscription.unsubscribe();
}

export async function sendTestPush(): Promise<void> {
  const { error } = await supabase.functions.invoke("send-push", {
    body: { test: true },
  });
  if (error) throw error;
}
