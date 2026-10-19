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
function parseEnv(source) {
  return Object.fromEntries(source.split(/\r?\n/).flatMap(line => {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!match || match[1].startsWith("#")) return [];
    return [[match[1], match[2].replace(/^(['"])(.*)\1$/, "$2")]];
  }));
}
const env = parseEnv(await readFile(envPath, "utf8"));
const projectRef = env.SUPABASE_PROJECT_REF;
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
if (projectRef !== expectedProjectRef || supabaseUrl !== `https://${expectedProjectRef}.supabase.co`) throw new Error("Refusing to seed: not approved dev project.");
if (!serviceRoleKey) throw new Error("Missing service role key.");
const admin = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });

const superAdmin = { email: "super@platform.test", password: "Super1234!", fullName: "Platform Super Admin" };
let listed = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
let superUser = listed.data?.users?.find(u => u.email?.toLowerCase() === superAdmin.email);
if (!superUser) {
  const { data, error } = await admin.auth.admin.createUser({ email: superAdmin.email, password: superAdmin.password, email_confirm: true, user_metadata: { full_name: superAdmin.fullName, role: "super_admin" } });
  if (error) throw new Error(error.message);
  superUser = data.user;
} else {
  await admin.auth.admin.updateUserById(superUser.id, { password: superAdmin.password, email_confirm: true });
}
const platformFirmId = "00000000-0000-0000-0000-000000000099";
await admin.from("firms").upsert({ id: platformFirmId, name: "Platform Admin" }, { onConflict: "id" });
await admin.from("profiles").upsert({ id: superUser.id, firm_id: platformFirmId, full_name: superAdmin.fullName, email: superAdmin.email, role: "super_admin", is_owner: true, is_active: true }, { onConflict: "id" });
await admin.from("firms").update({ owner_id: superUser.id }).eq("id", platformFirmId);
console.log("Seeded super admin:", superAdmin.email);

const firms = [
  { id: "f0000000-0000-0000-0000-000000000010", name: "Trial Firm", state: "trial" },
  { id: "f0000000-0000-0000-0000-000000000011", name: "Active Firm", state: "active" },
  { id: "f0000000-0000-0000-0000-000000000012", name: "Grace Firm", state: "grace" },
  { id: "f0000000-0000-0000-0000-000000000013", name: "Expired Firm", state: "expired" },
];

for (const f of firms) {
  await admin.from("firms").upsert({ id: f.id, name: f.name }, { onConflict: "id" });
  const ownerEmail = `owner-${f.state}@demo.test`;
  let user = (await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })).data?.users?.find(u => u.email?.toLowerCase() === ownerEmail);
  if (!user) {
    const { data, error } = await admin.auth.admin.createUser({ email: ownerEmail, password: "Owner1234!", email_confirm: true, user_metadata: { full_name: `${f.name} Owner`, firm_id: f.id, role: "admin", is_owner: true } });
    if (error) throw new Error(error.message);
    user = data.user;
  } else {
    await admin.auth.admin.updateUserById(user.id, { password: "Owner1234!", email_confirm: true });
  }
  await admin.from("profiles").upsert({ id: user.id, firm_id: f.id, full_name: `${f.name} Owner`, email: ownerEmail, role: "admin", is_owner: true, is_active: true }, { onConflict: "id" });
  await admin.from("firms").update({ owner_id: user.id }).eq("id", f.id);

  const now = new Date();
  let status, ends, grace = null;
  if (f.state === "trial") { status = "trialing"; ends = new Date(now.getTime() + 7*86400000); }
  else if (f.state === "active") { status = "active"; ends = new Date(now.getTime() + 30*86400000); }
  else if (f.state === "grace") { status = "grace"; ends = new Date(now.getTime() - 1*86400000); grace = new Date(now.getTime() + 2*86400000); }
  else { status = "expired"; ends = new Date(now.getTime() - 10*86400000); }

  await admin.from("subscriptions").delete().eq("firm_id", f.id);
  await admin.from("subscriptions").insert({ firm_id: f.id, plan_id: null, status, starts_at: now.toISOString(), ends_at: ends.toISOString(), grace_until: grace ? grace.toISOString() : null, created_by: user.id });
  console.log("Seeded firm:", f.name, status);
}

console.log("Done. Owner password: Owner1234!, Super password: Super1234!");
