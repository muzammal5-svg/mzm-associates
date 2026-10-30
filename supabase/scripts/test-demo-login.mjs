import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "../..");
const require = createRequire(resolve(repoRoot, "web/package.json"));
const { createClient } = require("@supabase/supabase-js");
const expectedProjectRef = "zxxpsvhlekemgccrcwtg";
const firmId = "f0000000-0000-0000-0000-000000000001";

function parseEnv(source) {
  return Object.fromEntries(
    source.split(/\r?\n/).flatMap(line => {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
      if (!match || match[1].startsWith("#")) return [];
      return [[match[1], match[2].replace(/^(['"])(.*)\1$/, "$2")]];
    }),
  );
}

const env = parseEnv(await readFile(resolve(repoRoot, "web/.env.local"), "utf8"));
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (env.SUPABASE_PROJECT_REF !== expectedProjectRef || supabaseUrl !== `https://${expectedProjectRef}.supabase.co`) {
  throw new Error("Refusing login test: configured Supabase project is not the approved dev project.");
}
if (!anonKey) throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY is missing from web/.env.local.");

const demoUsers = [
  { email: "super@platform.test", password: "Super1234!", role: "super_admin", firmId: "00000000-0000-0000-0000-000000000099" },
  { email: "admin@mzm.pk", password: "Admin1234!", role: "admin", firmId },
  { email: "lawyer@mzm.pk", password: "Lawyer1234!", role: "lawyer", firmId },
  { email: "clerk@mzm.pk", password: "Clerk1234!", role: "clerk", firmId },
];

for (const demo of demoUsers) {
  const client = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: authData, error: authError } = await client.auth.signInWithPassword({
    email: demo.email,
    password: demo.password,
  });
  if (authError) throw new Error(`Login failed for ${demo.email}: ${authError.message}`);

  const { data: profile, error: profileError } = await client
    .from("profiles")
    .select("id,role,firm_id")
    .eq("id", authData.user.id)
    .single();
  if (profileError) throw new Error(`Own-profile read failed for ${demo.email}: ${profileError.message}`);
  if (profile.role !== demo.role || profile.firm_id !== demo.firmId) {
    throw new Error(`Role/firm mismatch for ${demo.email} (got role=${profile.role}, firm=${profile.firm_id}).`);
  }

  console.log(`PASS ${demo.email}: authenticated, own profile readable, role=${profile.role}, firm verified`);
  await client.auth.signOut();
}
