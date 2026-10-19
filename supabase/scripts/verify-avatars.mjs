import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "../..");
const require = createRequire(resolve(repoRoot, "web/package.json"));
const { createClient } = require("@supabase/supabase-js");
const expectedProjectRef = "zxxpsvhlekemgccrcwtg";

function parseEnv(source) {
  return Object.fromEntries(
    source.split(/\r?\n/).flatMap((line) => {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
      if (!match || match[1].startsWith("#")) return [];
      return [[match[1], match[2].replace(/^(['"])(.*)\1$/, "$2")]];
    }),
  );
}

const env = parseEnv(await readFile(resolve(repoRoot, "web/.env.local"), "utf8"));
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (
  env.SUPABASE_PROJECT_REF !== expectedProjectRef ||
  supabaseUrl !== `https://${expectedProjectRef}.supabase.co`
) {
  throw new Error("Refusing: configured Supabase project is not the approved dev project.");
}
if (!anonKey) throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY is missing from web/.env.local.");

const demoUsers = [
  { email: "admin@mzm.pk", password: "Admin1234!", role: "admin" },
  { email: "lawyer@mzm.pk", password: "Lawyer1234!", role: "lawyer" },
  { email: "clerk@mzm.pk", password: "Clerk1234!", role: "clerk" },
];

const BUCKET = "avatars";
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"];

// Build a small valid PNG as a Buffer
const PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjRNRwAAAABJRU5ErkJggg==";
const PNG_BUFFER = Buffer.from(PNG_BASE64, "base64");

// Build a small valid JPEG as a Buffer (SOI + APP0 + SOF0 + DHT + DQT + SOS + EOI minimal)
// Use a real 1x1 JPEG
const JPEG_HEX =
  "ffd8ffe000104a46494600010100000100010000ffdb004300080606070605080707070909080a0c140d0c0b0b0c1912130f141d1a1f1e1d1a1c1c20242e2720292c2d2d2c2832373b38363c4343434c525553544d5054574f5255555458585a60616162636465666768696a6b6c6d6e6f707172737475767778797a7b7c7d7e7f808182838485868788898a8b8c8d8e8f909192939495969798999a9b9c9d9e9fa0a1a2a3a4a5a6a7a8a9aaabacadaeafb0b1b2b3b4b5b6b7b8b9bbbcbdbebfc0c1c2c3c4c5c6c7c8c9cacbcccdcecfd0d1d2d3d4d5d6d7d8d9dadbdcdddedfe0e1e2e3e4e5e6e7e8e9eaebecedeeeff0f1f2f3f4f5f6f7f8f9fafbfcfdfeffc00011080001000103011100021101031101ffc4001f000001050101010101010000000000000000000000000001020304050607000000000000000001020304050607ffda000801010000010502ffd9";
const JPEG_BUFFER = Buffer.from(JPEG_HEX, "hex");

// Oversized buffer (>5MB)
const OVERSIZE_BUFFER = Buffer.alloc(6 * 1024 * 1024);

// Non-image file
const TEXT_BUFFER = Buffer.from("this is not an image file", "utf8");

let passed = 0;
let failed = 0;

function result(name, ok, detail = "") {
  if (ok) {
    passed++;
    console.log(`  PASS: ${name}${detail ? " — " + detail : ""}`);
  } else {
    failed++;
    console.log(`  FAIL: ${name}${detail ? " — " + detail : ""}`);
  }
}

async function main() {
  const clients = {}; // role -> { client, userId }

  // ── 1. Login as each role and get profile id ──
  console.log("\n=== 1. LOGIN & GET PROFILE IDS ===");
  for (const u of demoUsers) {
    const client = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: authData, error: authError } = await client.auth.signInWithPassword({
      email: u.email,
      password: u.password,
    });
    if (authError) {
      result(`Login ${u.email}`, false, authError.message);
      continue;
    }
    const { data: profile, error: profileError } = await client
      .from("profiles")
      .select("id,role")
      .eq("id", authData.user.id)
      .single();
    if (profileError) {
      result(`Profile ${u.email}`, false, profileError.message);
      continue;
    }
    clients[u.role] = { client, userId: profile.id, email: u.email };
    result(`Login ${u.email} (${u.role})`, true, `userId=${profile.id}`);
  }

  // ── 2. Each role uploads own jpg and png = SUCCESS ──
  console.log("\n=== 2. OWN AVATAR UPLOAD (jpg/png) = SUCCESS ===");
  for (const role of ["admin", "lawyer", "clerk"]) {
    const c = clients[role];
    if (!c) continue;
    for (const [label, buf, mime] of [
      ["jpg", JPEG_BUFFER, "image/jpeg"],
      ["png", PNG_BUFFER, "image/png"],
    ]) {
      const path = `${c.userId}/${crypto.randomUUID()}.${label}`;
      const { error } = await c.client.storage.from(BUCKET).upload(path, buf, {
        contentType: mime,
        upsert: false,
      });
      result(`${role} upload ${label.toUpperCase()}`, !error, error ? error.message : "uploaded to " + path);
      // Clean up: delete own upload
      await c.client.storage.from(BUCKET).remove([path]);
    }
  }

  // ── 3. User A overwrites/deletes user B's avatar = DENIED ──
  console.log("\n=== 3. CROSS-USER ACCESS = DENIED ===");
  const lawyer = clients.lawyer;
  const clerk = clients.clerk;
  const admin = clients.admin;

  if (lawyer && clerk) {
    // Lawyer tries to upload to clerk's folder
    const clerkPath = `${clerk.userId}/${crypto.randomUUID()}.png`;
    const { error: crossUpload } = await lawyer.client.storage.from(BUCKET).upload(clerkPath, PNG_BUFFER, {
      contentType: "image/png",
    });
    result("Lawyer uploads to clerk's folder", !!crossUpload, crossUpload ? crossUpload.message : "UNEXPECTED ALLOWED");

    // Lawyer tries to delete clerk's avatar (first upload one as clerk, then lawyer deletes)
    const clerkAvatar = `${clerk.userId}/clerk-avatar.png`;
    await clerk.client.storage.from(BUCKET).upload(clerkAvatar, PNG_BUFFER, { contentType: "image/png" });
    await lawyer.client.storage.from(BUCKET).remove([clerkAvatar]);
    const { error: dl1 } = await clerk.client.storage.from(BUCKET).download(`${clerk.userId}/clerk-avatar.png`);
    const stillThere1 = !dl1;
    result("Lawyer deletes clerk's avatar", stillThere1, stillThere1 ? "DENIED (file remains)" : "UNEXPECTED ALLOWED");
    await clerk.client.storage.from(BUCKET).remove([clerkAvatar]);
  }

  if (clerk && admin) {
    // Clerk tries to delete admin's avatar
    const adminAvatar = `${admin.userId}/admin-avatar.png`;
    await admin.client.storage.from(BUCKET).upload(adminAvatar, PNG_BUFFER, { contentType: "image/png" });
    await clerk.client.storage.from(BUCKET).remove([adminAvatar]);
    const { error: dl2 } = await admin.client.storage.from(BUCKET).download(`${admin.userId}/admin-avatar.png`);
    const stillThere2 = !dl2;
    result("Clerk deletes admin's avatar", stillThere2, stillThere2 ? "DENIED (file remains)" : "UNEXPECTED ALLOWED");
    await admin.client.storage.from(BUCKET).remove([adminAvatar]);
  }

  // ── 4. Oversized file rejected ──
  console.log("\n=== 4. OVERSIZED FILE (>5MB) = REJECTED ===");
  if (lawyer) {
    const overPath = `${lawyer.userId}/${crypto.randomUUID()}.png`;
    const { error: overErr } = await lawyer.client.storage.from(BUCKET).upload(overPath, OVERSIZE_BUFFER, {
      contentType: "image/png",
    });
    result("Oversized PNG (>5MB) rejected", !!overErr, overErr ? overErr.message : "UNEXPECTED ALLOWED");
  }

  // ── 5. Non-image file rejected ──
  console.log("\n=== 5. NON-IMAGE FILE = REJECTED ===");
  if (lawyer) {
    const textPath = `${lawyer.userId}/${crypto.randomUUID()}.exe`;
    const { error: textErr } = await lawyer.client.storage.from(BUCKET).upload(textPath, TEXT_BUFFER, {
      contentType: "application/x-msdownload",
    });
    result("Non-image (.exe) rejected", !!textErr, textErr ? textErr.message : "UNEXPECTED ALLOWED");
  }

  // ── Summary ──
  console.log(`\n=== SUMMARY: ${passed} passed, ${failed} failed ===`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("FATAL:", err.message);
  process.exit(1);
});

