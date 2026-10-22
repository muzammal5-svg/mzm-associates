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
    source.split(/\r?\n/).flatMap(line => {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
      if (!match || match[1].startsWith("#")) return [];
      return [[match[1], match[2].replace(/^(['"])(.*)\1$/, "$2")]];
    }),
  );
}

const targetEmail = process.argv[2]?.trim().toLowerCase();
if (!targetEmail || !targetEmail.includes("@")) {
  console.error("Usage: node supabase/scripts/create-super-admin.mjs <email> [password] [full_name]");
  process.exit(1);
}

const targetPassword = process.argv[3]?.trim();
const targetName = process.argv[4]?.trim() || "Super Admin";

let env = {};
try {
  env = parseEnv(await readFile(envPath, "utf8"));
} catch {
  // fallback to process.env
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Error: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

console.log(`Checking user: ${targetEmail}...`);

// 1. Check existing Auth user
const { data: userList, error: listErr } = await admin.auth.admin.listUsers();
if (listErr) {
  console.error("Failed to list users:", listErr.message);
  process.exit(1);
}

let user = userList.users.find(u => u.email?.toLowerCase() === targetEmail);

if (!user) {
  if (!targetPassword) {
    console.error(`User ${targetEmail} does not exist in Auth. Provide a password to create them:`);
    console.error(`  node supabase/scripts/create-super-admin.mjs ${targetEmail} <password> [full_name]`);
    process.exit(1);
  }

  const { data: newUser, error: createErr } = await admin.auth.admin.createUser({
    email: targetEmail,
    password: targetPassword,
    email_confirm: true,
    user_metadata: { full_name: targetName },
  });

  if (createErr || !newUser.user) {
    console.error("Failed to create auth user:", createErr?.message);
    process.exit(1);
  }

  user = newUser.user;
  console.log(`Created new auth user with ID: ${user.id}`);
} else {
  console.log(`Found existing auth user with ID: ${user.id}`);
}

// 2. Ensure profile exists and has role='super_admin'
const { data: existingProfile } = await admin
  .from("profiles")
  .select("*")
  .eq("id", user.id)
  .maybeSingle();

if (existingProfile) {
  const { error: updateErr } = await admin
    .from("profiles")
    .update({
      role: "super_admin",
      is_active: true,
      full_name: existingProfile.full_name || targetName,
    })
    .eq("id", user.id);

  if (updateErr) {
    console.error("Failed to update profile to super_admin:", updateErr.message);
    process.exit(1);
  }
  console.log(`Updated existing profile for ${targetEmail} to super_admin.`);
} else {
  const { error: insertErr } = await admin
    .from("profiles")
    .insert({
      id: user.id,
      email: targetEmail,
      full_name: targetName,
      role: "super_admin",
      is_active: true,
      is_owner: false,
    });

  if (insertErr) {
    console.error("Failed to insert super_admin profile:", insertErr.message);
    process.exit(1);
  }
  console.log(`Created profile for ${targetEmail} with role super_admin.`);
}

console.log("\nSUCCESS: User is configured as super_admin!");
console.log(`Email: ${targetEmail}`);
console.log("You can now sign in and access /admin.");
