import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface NotificationRow {
  id: string;
  user_id: string;
  title: string;
  body: string;
  ref_type: string | null;
  ref_id: string | null;
}

interface WebSubscriptionRow {
  id: string;
  endpoint: string;
  p256dh: string;
  auth_key: string;
}

interface DeviceTokenRow {
  token: string;
  user_id: string;
}

interface ServiceAccount {
  client_email: string;
  private_key: string;
  token_uri: string;
}

function base64Url(value: Uint8Array): string {
  let binary = "";
  for (const byte of value) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function pemToBytes(pem: string): Uint8Array {
  const contents = pem.replace(/\\n/g, "\n").replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g, "");
  return Uint8Array.from(atob(contents), char => char.charCodeAt(0));
}

async function getFcmAccessToken(account: ServiceAccount): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(new TextEncoder().encode(JSON.stringify({ alg: "RS256", typ: "JWT" })));
  const claim = base64Url(new TextEncoder().encode(JSON.stringify({
    iss: account.client_email,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: account.token_uri,
    iat: now,
    exp: now + 3600,
  })));
  const unsigned = `${header}.${claim}`;
  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToBytes(account.private_key),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(unsigned));
  const assertion = `${unsigned}.${base64Url(new Uint8Array(signature))}`;
  const response = await fetch(account.token_uri, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  if (!response.ok) throw new Error(`FCM OAuth token request failed (${response.status}).`);
  const tokenResponse = await response.json();
  return tokenResponse.access_token as string;
}

function targetUrl(notification: Pick<NotificationRow, "ref_type" | "ref_id">): string {
  if (notification.ref_type === "case" && notification.ref_id) {
    return `/cases/view?id=${encodeURIComponent(notification.ref_id)}`;
  }
  if (notification.ref_type === "hearing" && notification.ref_id) {
    return `/reminders`;
  }
  return "/reminders";
}

Deno.serve(async request => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed." }, { status: 405, headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const authorization = request.headers.get("Authorization") ?? "";
  if (!supabaseUrl || !anonKey || !serviceRoleKey || !authorization.startsWith("Bearer ")) {
    return Response.json({ error: "Push service is not configured or request is unauthorized." }, { status: 401, headers: corsHeaders });
  }

  const isServiceRole = authorization === `Bearer ${serviceRoleKey}`;
  const callerClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let callerId: string | null = null;
  if (!isServiceRole) {
    const { data, error } = await callerClient.auth.getUser();
    if (error || !data.user) {
      return Response.json({ error: "A valid user session is required." }, { status: 401, headers: corsHeaders });
    }
    callerId = data.user.id;
  }

  let body: { notification_ids?: string[]; test?: boolean };
  try {
    const parsed = await request.json();
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return Response.json({ error: "Request body must be a JSON object." }, { status: 400, headers: corsHeaders });
    }
    body = parsed as { notification_ids?: string[]; test?: boolean };
  } catch {
    return Response.json({ error: "Request body must be valid JSON." }, { status: 400, headers: corsHeaders });
  }

  const testPush = body.test === true;
  if (body.notification_ids !== undefined && !Array.isArray(body.notification_ids)) {
    return Response.json({ error: "notification_ids must be an array." }, { status: 400, headers: corsHeaders });
  }
  if (!testPush && !isServiceRole && (!Array.isArray(body.notification_ids) || body.notification_ids.length === 0)) {
    return Response.json({ error: "notification_ids are required." }, { status: 400, headers: corsHeaders });
  }
  if (body.notification_ids && body.notification_ids.length > 100) {
    return Response.json({ error: "At most 100 notifications can be dispatched at once." }, { status: 400, headers: corsHeaders });
  }
  if (body.notification_ids && !body.notification_ids.every(id => typeof id === "string" && id.length > 0)) {
    return Response.json({ error: "notification_ids must contain non-empty strings." }, { status: 400, headers: corsHeaders });
  }
  if (testPush && !callerId) {
    return Response.json({ error: "Test pushes must be requested by a signed-in user." }, { status: 403, headers: corsHeaders });
  }

  let notifications: NotificationRow[] = [];
  if (!testPush) {
    let query = adminClient.from("notifications").select("id,user_id,title,body,ref_type,ref_id");
    if (body.notification_ids?.length) query = query.in("id", body.notification_ids);
    else query = query.is("push_dispatched_at", null)
      .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order("created_at")
      .limit(100);
    if (callerId) query = query.eq("user_id", callerId);
    const { data, error } = await query;
    if (error) return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
    notifications = (data ?? []) as NotificationRow[];
  }

  const userIds = testPush ? [callerId!] : [...new Set(notifications.map(item => item.user_id))];
  if (userIds.length === 0) {
    return Response.json({ processed: 0, sent: 0, failed: 0 }, { headers: corsHeaders });
  }
  const [{ data: webSubscriptions, error: webError }, { data: deviceTokens, error: tokenError }] = await Promise.all([
    adminClient.from("push_subscriptions").select("id,endpoint,p256dh,auth_key").in("user_id", userIds),
    adminClient.from("device_tokens").select("token,user_id").in("user_id", userIds),
  ]);
  if (webError || tokenError) {
    return Response.json({ error: webError?.message ?? tokenError?.message }, { status: 500, headers: corsHeaders });
  }

  const subscriptionsByUser = new Map<string, WebSubscriptionRow[]>();
  const tokensByUser = new Map<string, DeviceTokenRow[]>();
  for (const row of webSubscriptions ?? []) {
    const entries = subscriptionsByUser.get(row.user_id) ?? [];
    entries.push(row);
    subscriptionsByUser.set(row.user_id, entries);
  }
  for (const row of deviceTokens ?? []) {
    const entries = tokensByUser.get(row.user_id) ?? [];
    entries.push(row);
    tokensByUser.set(row.user_id, entries);
  }

  const vapidPublic = Deno.env.get("VAPID_PUBLIC_KEY");
  const vapidPrivate = Deno.env.get("VAPID_PRIVATE_KEY");
  const vapidSubject = Deno.env.get("VAPID_SUBJECT") ?? "mailto:admin@mzm.pk";
  if (vapidPublic && vapidPrivate) webpush.setVapidDetails(vapidSubject, vapidPublic, vapidPrivate);

  const firebaseProjectId = Deno.env.get("FIREBASE_PROJECT_ID");
  const serviceAccountJson = Deno.env.get("FIREBASE_SERVICE_ACCOUNT");
  let fcmToken: string | null = null;
  if (firebaseProjectId && serviceAccountJson) {
    try {
      fcmToken = await getFcmAccessToken(JSON.parse(serviceAccountJson) as ServiceAccount);
    } catch (error) {
      return Response.json({ error: error instanceof Error ? error.message : "FCM authentication failed." }, { status: 502, headers: corsHeaders });
    }
  }

  let sent = 0;
  let failed = 0;
  const dispatchRows = testPush
    ? [{ id: "", user_id: callerId!, title: "MZM test notification", body: "Browser push is working.", ref_type: null, ref_id: null }]
    : notifications;

  for (const notification of dispatchRows) {
    const payload = {
      title: notification.title,
      body: notification.body,
      icon: "/icons/icon-192.png",
      data: { url: targetUrl(notification) },
    };
    let delivered = false;
    const urgent = /today|tomorrow|in [123] days/i.test(notification.title);

    for (const subscription of subscriptionsByUser.get(notification.user_id) ?? []) {
      try {
        await webpush.sendNotification({
          endpoint: subscription.endpoint,
          keys: { p256dh: subscription.p256dh, auth: subscription.auth_key },
        }, JSON.stringify(payload), { urgency: urgent ? "high" : "normal" });
        delivered = true;
        sent++;
      } catch (error) {
        failed++;
        const statusCode = (error as { statusCode?: number }).statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await adminClient.from("push_subscriptions").delete().eq("id", subscription.id);
        }
        console.error("[send-push] Web Push delivery failed:", error);
      }
    }

    if (fcmToken && firebaseProjectId) {
      for (const token of tokensByUser.get(notification.user_id) ?? []) {
        const response = await fetch(`https://fcm.googleapis.com/v1/projects/${firebaseProjectId}/messages:send`, {
          method: "POST",
          headers: { Authorization: `Bearer ${fcmToken}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            message: {
              token: token.token,
              notification: { title: notification.title, body: notification.body },
              data: { url: targetUrl(notification) },
              android: { priority: urgent ? "HIGH" : "NORMAL" },
              webpush: { headers: { Urgency: urgent ? "high" : "normal" } },
            },
          }),
        });
        if (response.ok) {
          delivered = true;
          sent++;
        } else {
          failed++;
          console.error("[send-push] FCM delivery failed:", response.status, await response.text());
        }
      }
    }

    if (!testPush && delivered) {
      const { error } = await adminClient.from("notifications")
        .update({ push_dispatched_at: new Date().toISOString() })
        .eq("id", notification.id);
      if (error) {
        failed++;
        console.error("[send-push] Failed marking notification dispatched:", error.message);
      }
    }
  }

  if (testPush && sent === 0) {
    return Response.json({
      error: failed ? "Test push could not be delivered; check the VAPID configuration." : "No push subscription is registered for this browser.",
      sent,
      failed,
    }, { status: 502, headers: corsHeaders });
  }
  return Response.json({ processed: dispatchRows.length, sent, failed }, { headers: corsHeaders });
});
