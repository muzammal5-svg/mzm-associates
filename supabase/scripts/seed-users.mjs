import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "../..");
const envPath = resolve(repoRoot, "web/.env.local");
const require = createRequire(resolve(repoRoot, "web/package.json"));
const { createClient } = require("@supabase/supabase-js");
const expectedProjectRef = "zxxpsvhlekemgccrcwtg";
const firmId = "f0000000-0000-0000-0000-000000000001";

const demoUsers = [
  { email: "admin@mzm.pk", password: "Admin1234!", fullName: "Muhammad Zubair (Admin)", role: "admin" },
  { email: "lawyer@mzm.pk", password: "Lawyer1234!", fullName: "Advocate Kamran Hussain", role: "lawyer" },
  { email: "clerk@mzm.pk", password: "Clerk1234!", fullName: "Sana Clerk", role: "clerk" },
];

function parseEnv(source) {
  return Object.fromEntries(
    source.split(/\r?\n/).flatMap(line => {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
      if (!match || match[1].startsWith("#")) return [];
      return [[match[1], match[2].replace(/^(['"])(.*)\1$/, "$2")]];
    }),
  );
}

const env = parseEnv(await readFile(envPath, "utf8"));
const projectRef = env.SUPABASE_PROJECT_REF;
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (projectRef !== expectedProjectRef || supabaseUrl !== `https://${expectedProjectRef}.supabase.co`) {
  throw new Error("Refusing to seed users: configured Supabase project is not the approved dev project.");
}
if (!serviceRoleKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY is missing from web/.env.local.");

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { error: firmError } = await admin.from("firms").upsert({
  id: firmId,
  name: "MZM & Associates",
  subscription_status: "active",
  subscription_valid_till: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
}, { onConflict: "id" });
if (firmError) throw new Error(`Firm setup failed: ${firmError.message}`);

const { data: listed, error: listError } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
if (listError) throw new Error(`Could not list existing demo users: ${listError.message}`);

for (const demo of demoUsers) {
  let user = listed.users.find(existing => existing.email?.toLowerCase() === demo.email);
  const userMetadata = { full_name: demo.fullName, firm_id: firmId, role: demo.role };

  if (user) {
    const { data, error } = await admin.auth.admin.updateUserById(user.id, {
      password: demo.password,
      email_confirm: true,
      user_metadata: { ...user.user_metadata, ...userMetadata },
    });
    if (error) throw new Error(`Could not update ${demo.email}: ${error.message}`);
    user = data.user;
  } else {
    const { data, error } = await admin.auth.admin.createUser({
      email: demo.email,
      password: demo.password,
      email_confirm: true,
      user_metadata: userMetadata,
    });
    if (error) throw new Error(`Could not create ${demo.email}: ${error.message}`);
    user = data.user;
  }

  const { error: profileError } = await admin.from("profiles").upsert({
    id: user.id,
    firm_id: firmId,
    full_name: demo.fullName,
    email: demo.email,
    role: demo.role,
    is_active: true,
  }, { onConflict: "id" });
  if (profileError) throw new Error(`Could not ensure profile for ${demo.email}: ${profileError.message}`);

  console.log(`Seeded confirmed demo account: ${demo.email} (${demo.role})`);
}
