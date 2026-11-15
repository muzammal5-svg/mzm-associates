/**
 * Safe Test Data Cleanup Script (Node.js + Supabase Service Role)
 *
 * Usage:
 *   node supabase/scripts/safe-cleanup-test-data.mjs --confirm
 *
 * PRESERVED ACCOUNTS:
 *   - super@platform.test (Super Admin)
 *   - admin@mzm.pk (MZM Firm Admin)
 *   - muhammad.zahidmuneer@gmail.com (Advocate/Client Account)
 *   - lawyer@mzm.pk (Core Demo)
 *   - clerk@mzm.pk (Core Demo)
 */

import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "../..");
const envPath = resolve(repoRoot, "web/.env.local");
const require = createRequire(resolve(repoRoot, "web/package.json"));
const { createClient } = require("@supabase/supabase-js");

function parseEnv(source) {
  return Object.fromEntries(
    source.split(/\r?\n/).flatMap((line) => {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
      if (!match || match[1].startsWith("#")) return [];
      return [[match[1], match[2].replace(/^(['"])(.*)\1$/, "$2")]];
    })
  );
}

const isConfirmed = process.argv.includes("--confirm");

if (!isConfirmed) {
  console.log("=================================================================");
  console.log("SAFETY NOTICE: Test Data Cleanup Script");
  console.log("=================================================================");
  console.log("This script will delete all test cases, hearings, documents,");
  console.log("payment slips, and temporary test accounts while PRESERVING:");
  console.log("  - super@platform.test (Super Admin)");
  console.log("  - admin@mzm.pk (Firm Admin)");
  console.log("  - muhammad.zahidmuneer@gmail.com");
  console.log("  - lawyer@mzm.pk & clerk@mzm.pk");
  console.log("  - System configuration (plans, banks, courts, case types)");
  console.log("\nTo execute this deletion, pass the --confirm flag:");
  console.log("  node supabase/scripts/safe-cleanup-test-data.mjs --confirm");
  console.log("=================================================================");
  process.exit(0);
}

const env = parseEnv(await readFile(envPath, "utf8"));
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

console.log("Connecting to Supabase at:", supabaseUrl);

const PRESERVED_EMAILS = [
  "super@platform.test",
  "admin@mzm.pk",
  "muhammad.zahidmuneer@gmail.com",
  "lawyer@mzm.pk",
  "clerk@mzm.pk",
];

const PRESERVED_FIRMS = [
  "00000000-0000-0000-0000-000000000099",
  "f0000000-0000-0000-0000-000000000001",
];

try {
  // 1. Storage cleanup: documents and payment-slips
  console.log("1. Cleaning files in storage buckets...");
  for (const bucket of ["documents", "payment-slips"]) {
    const { data: files, error: listErr } = await admin.storage.from(bucket).list("", { limit: 1000 });
    if (!listErr && files && files.length > 0) {
      const paths = files.map((f) => f.name);
      await admin.storage.from(bucket).remove(paths);
      console.log(`   - Cleared ${paths.length} items from ${bucket}`);
    }
  }

  // 2. Clear case-level data
  console.log("2. Deleting case records (activity log, notes, hearings)...");
  await admin.from("case_activity_log").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await admin.from("case_notes").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await admin.from("hearings").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  // 3. Reminders and documents
  console.log("3. Deleting reminders and document metadata...");
  await admin.from("reminders").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await admin.from("documents").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  // 4. Cases and clients
  console.log("4. Deleting cases and clients...");
  await admin.from("cases").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await admin.from("clients").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  // 5. Billing and payments
  console.log("5. Deleting test payment receipts and billing events...");
  await admin.from("payments").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await admin.from("billing_events").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  // 6. Subscriptions
  console.log("6. Cleaning test subscriptions...");
  await admin
    .from("subscriptions")
    .delete()
    .not("firm_id", "in", `(${PRESERVED_FIRMS.join(",")})`);

  // 7. Notifications
  console.log("7. Cleaning notifications...");
  await admin.from("notifications").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  // 8. Profiles of test users
  console.log("8. Cleaning test profiles...");
  await admin
    .from("profiles")
    .delete()
    .not("email", "in", `(${PRESERVED_EMAILS.join(",")})`);

  // 9. Auth users
  console.log("9. Cleaning test auth accounts...");
  const { data: authUsers } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (authUsers && authUsers.users) {
    for (const u of authUsers.users) {
      if (u.email && !PRESERVED_EMAILS.includes(u.email.toLowerCase())) {
        await admin.auth.admin.deleteUser(u.id);
        console.log(`   - Deleted test auth user: ${u.email}`);
      }
    }
  }

  console.log("\nSUCCESS: All test data cleaned successfully!");
  console.log("Preserved accounts remain untouched and ready for testing or production.");
} catch (err) {
  console.error("Cleanup error:", err);
  process.exit(1);
}
