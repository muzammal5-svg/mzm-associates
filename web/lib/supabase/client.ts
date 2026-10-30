import { createClient } from "@supabase/supabase-js";
import type { Database, TablesInsert, TablesUpdate } from "@/types/supabase";

const rawUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL  ?? "";
const rawAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const IS_SUPABASE_CONFIGURED =
  !!rawUrl &&
  /^https?:\/\//i.test(rawUrl) &&
  rawUrl !== "https://placeholder.supabase.co" &&
  !rawUrl.includes("placeholder");

const supabaseUrl  = IS_SUPABASE_CONFIGURED ? rawUrl : "https://placeholder.supabase.co";
const supabaseAnon = IS_SUPABASE_CONFIGURED ? rawAnon : "placeholder-anon-key";

if (typeof window !== "undefined" && !IS_SUPABASE_CONFIGURED) {
  console.warn(
    "[MZM] Supabase not configured — copy .env.local.example → .env.local " +
    "and fill in NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY"
  );
}

/**
 * Typed singleton Supabase client.
 * All data access goes through this — no server actions or API routes.
 */
export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnon,
  {
    auth: {
      persistSession:    true,
      autoRefreshToken:  true,
      detectSessionInUrl: false,  // static export — handle redirects manually
    },
    global: {
      headers: { "x-app-name": "mzm-case-management" },
    },
  }
);

// ─── Typed table helpers ───────────────────────────────────────────────────────
// Shorthand so feature files don't need to type `supabase.from<Database[...]>`

export const db = {
  firms:         () => supabase.from("firms"),
  profiles:      () => supabase.from("profiles"),
  clients:       () => supabase.from("clients"),
  caseTypes:     () => supabase.from("case_types"),
  courts:        () => supabase.from("courts"),
  cases:         () => supabase.from("cases"),
  hearings:      () => supabase.from("hearings"),
  documents:     () => supabase.from("documents"),
  reminders:     () => supabase.from("reminders"),
  notifications: () => supabase.from("notifications"),
  deviceTokens:  () => supabase.from("device_tokens"),
  causeList:     () => supabase.from("v_cause_list"),
  caseNotes:             () => supabase.from("case_notes"),
  activityLog:           () => supabase.from("case_activity_log"),
  notifPrefs:            () => supabase.from("notification_preferences"),
  pushSubscriptions:     () => supabase.from("push_subscriptions"),
  caseLaws:              () => supabase.from("case_laws"),
} as const;

// ─── Storage helper ───────────────────────────────────────────────────────────

/** Get a signed URL for a private document (valid 60 min) */
export async function getSignedUrl(filePath: string): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from("documents")
    .createSignedUrl(filePath, 60 * 60);
  if (error) { console.error("[storage] getSignedUrl:", error.message); return null; }
  return data.signedUrl;
}

/** Upload a file to the private documents bucket under firm/{firmId}/{fileName} */
export async function uploadDocument(
  firmId: string,
  file: File,
  onProgress?: (pct: number) => void
): Promise<{ path: string }> {
  const ext  = file.name.split(".").pop();
  const path = `${firmId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { data, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  if (!data.session) throw new Error("You must be signed in to upload documents.");

  const encodedPath = path.split("/").map(encodeURIComponent).join("/");
  const uploadUrl = `${supabaseUrl}/storage/v1/object/documents/${encodedPath}`;
  await new Promise<void>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("POST", uploadUrl);
    request.setRequestHeader("apikey", supabaseAnon);
    request.setRequestHeader("Authorization", `Bearer ${data.session.access_token}`);
    request.setRequestHeader("Content-Type", file.type || "application/octet-stream");
    request.setRequestHeader("Cache-Control", "3600");
    request.setRequestHeader("x-upsert", "false");
    request.upload.addEventListener("progress", event => {
      if (event.lengthComputable) {
        onProgress?.(Math.round((event.loaded / event.total) * 100));
      }
    });
    request.addEventListener("load", () => {
      if (request.status >= 200 && request.status < 300) {
        onProgress?.(100);
        resolve();
        return;
      }
      reject(new Error(`Document upload failed with HTTP ${request.status}: ${request.responseText}`));
    });
    request.addEventListener("error", () => reject(new Error("Document upload network error.")));
    request.addEventListener("abort", () => reject(new Error("Document upload was cancelled.")));
    request.send(file);
  });
  return { path };
}

export const supabaseRaw = supabase;

/**
 * Typed update helpers that bypass the supabase-js v2 `never` inference bug
 * (occurs with `boolean` fields in strict TS mode).
 */
export const update = {
  profile: (id: string, data: TablesUpdate<"profiles">) =>
    supabaseRaw.from("profiles").update(data).eq("id", id),
  notification: (id: string, data: TablesUpdate<"notifications">) =>
    supabaseRaw.from("notifications").update(data).eq("id", id),
  notificationsAll: (data: TablesUpdate<"notifications">, filter: { is_read: boolean }) =>
    supabaseRaw.from("notifications").update(data).eq("is_read", filter.is_read),
  client: (id: string, data: TablesUpdate<"clients">) =>
    supabaseRaw.from("clients").update(data).eq("id", id),
  case_: (id: string, data: TablesUpdate<"cases">) =>
    supabaseRaw.from("cases").update(data).eq("id", id),
  hearing: (id: string, data: TablesUpdate<"hearings">) =>
    supabaseRaw.from("hearings").update(data).eq("id", id),
  reminder: (id: string, data: TablesUpdate<"reminders">) =>
    supabaseRaw.from("reminders").update(data).eq("id", id),
  notifPrefs: (userId: string, data: TablesUpdate<"notification_preferences">) =>
    supabaseRaw.from("notification_preferences").update(data).eq("user_id", userId),
  caseLaw: (id: string, data: TablesUpdate<"case_laws">) =>
    supabaseRaw.from("case_laws").update(data).eq("id", id),
} as const;

export const insert = {
  client:    (data: TablesInsert<"clients">) =>
    supabaseRaw.from("clients").insert(data).select().single(),
  document:  (data: TablesInsert<"documents">) =>
    supabaseRaw.from("documents").insert(data).select().single(),
  case_:     (data: TablesInsert<"cases">) =>
    supabaseRaw.from("cases").insert(data).select().single(),
  hearing:   (data: TablesInsert<"hearings">) =>
    supabaseRaw.from("hearings").insert(data).select().single(),
  caseNote:  (data: TablesInsert<"case_notes">) =>
    supabaseRaw.from("case_notes").insert(data).select().single(),
  caseType:  (data: TablesInsert<"case_types">) =>
    supabaseRaw.from("case_types").insert(data).select().single(),
  court:     (data: TablesInsert<"courts">) =>
    supabaseRaw.from("courts").insert(data).select().single(),
  caseLaw:   (data: TablesInsert<"case_laws">) =>
    supabaseRaw.from("case_laws").insert(data).select().single(),
} as const;
