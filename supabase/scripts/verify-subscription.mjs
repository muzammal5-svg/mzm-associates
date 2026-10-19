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
  return Object.fromEntries(
    source.split(/\r?\n/).flatMap(line => {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
      if (!match || match[1].startsWith("#")) return [];
      return [[match[1], match[2].replace(/^(['"])(.*)\1$/, "$2")]];
    }),
  );
}

const env = parseEnv(await readFile(envPath, "utf8"));
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const admin = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
function clientFor(token) { return createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: `Bearer ${token}` } }, auth: { persistSession: false, autoRefreshToken: false } }); }
async function signIn(email, password) {
  const c = createClient(supabaseUrl, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await c.auth.signInWithPassword({ email, password });
  if (error) throw new Error(`signIn ${email}: ${error.message}`);
  return { token: data.session.access_token, userId: data.user.id };
}

let pass = 0, fail = 0;
function check(name, ok, detail) { if (ok) { pass++; console.log("PASS:", name, detail||""); } else { fail++; console.log("FAIL:", name, detail||""); } }

const expiredOwner = await signIn("owner-expired@demo.test", "Owner1234!");
const activeOwner = await signIn("owner-active@demo.test", "Owner1234!");
const graceOwner = await signIn("owner-grace@demo.test", "Owner1234!");
const superAdmin = await signIn("super@platform.test", "Super1234!");

const expiredClient = clientFor(expiredOwner.token);
const activeClient = clientFor(activeOwner.token);
const graceClient = clientFor(graceOwner.token);
const superClient = clientFor(superAdmin.token);

// expired cannot insert client
{
  const expiredFirmId = (await expiredClient.from("profiles").select("firm_id").eq("id", expiredOwner.userId).single()).data.firm_id;
  const { error } = await expiredClient.from("clients").insert({ firm_id: expiredFirmId, full_name: "Expired Test" });
  check("expired cannot insert client", !!error, error?.message);
}
// expired can read cases
{
  const { error } = await expiredClient.from("cases").select("id").limit(1);
  check("expired can read cases", !error, error?.message);
}

// active can insert case
{
  const firmId = (await activeClient.from("profiles").select("firm_id").eq("id", activeOwner.userId).single()).data.firm_id;
  let cl = await activeClient.from("clients").select("id").eq("firm_id", firmId).limit(1);
  if (!cl.data || !cl.data.length) {
    await activeClient.from("clients").insert({ firm_id: firmId, full_name: "Test Client" });
    cl = await activeClient.from("clients").select("id").eq("firm_id", firmId).limit(1);
  }
  let ct = await activeClient.from("case_types").select("id").eq("firm_id", firmId).limit(1);
  if (!ct.data || !ct.data.length) { await admin.from("case_types").insert({ firm_id: firmId, name: "Civil", requires_offence: false }); ct = await activeClient.from("case_types").select("id").eq("firm_id", firmId).limit(1); }
  const { error } = await activeClient.from("cases").insert({ firm_id: firmId, case_ref_no: "T1", plaintiff_name: "A", defendant_name: "B", representing: "plaintiff", client_id: cl.data?.[0]?.id, case_type_id: ct.data?.[0]?.id, status: "running" });
  check("active can insert case", !error, error?.message);
  if (!error) await admin.from("cases").delete().eq("case_ref_no", "T1").eq("firm_id", firmId);
}

// grace read-only
{
  const firmId = (await graceClient.from("profiles").select("firm_id").eq("id", graceOwner.userId).single()).data.firm_id;
  const { error } = await graceClient.from("clients").insert({ firm_id: firmId, full_name: "Grace Test" });
  check("grace cannot insert client", !!error, error?.message);
  const { error: readErr } = await graceClient.from("clients").select("id").limit(1);
  check("grace can read clients", !readErr, readErr?.message);
}

// update_subscription_states accepts p_today
{
  const { error } = await admin.rpc("update_subscription_states", { p_today: "2099-01-01" });
  check("update_subscription_states accepts p_today", !error, error?.message);
}

// user cannot change own role/firm
{
  const { error } = await activeClient.from("profiles").update({ role: "super_admin", firm_id: "00000000-0000-0000-0000-000000000099" }).eq("id", activeOwner.userId);
  check("user cannot change own role/firm", !!error, error?.message);
}

// profiles insert blocked
{
  const { error } = await activeClient.from("profiles").insert({ id: activeOwner.userId, firm_id: "f0000000-0000-0000-0000-000000000013", full_name: "x", role: "clerk" });
  check("profiles insert blocked", !!error, error?.message);
}

// cross-firm payments read
{
  const { data } = await activeClient.from("payments").select("id").eq("firm_id", "f0000000-0000-0000-0000-000000000013");
  check("cross-firm payments blocked", !data || data.length === 0, "");
}

// non-super cannot verify_payment
{
  const firmId = (await activeClient.from("profiles").select("firm_id").eq("id", activeOwner.userId).single()).data.firm_id;
  const planId = (await admin.from("plans").select("id").eq("code", "monthly").single()).data.id;
  const { data: pay } = await admin.from("payments").insert({ firm_id: firmId, plan_id: planId, amount_pkr: 1000, method: "bank_transfer", reference_no: "TESTREF", status: "pending", submitted_by: activeOwner.userId }).select().single();
  const { error } = await activeClient.rpc("verify_payment", { p_payment_id: pay.id, p_approve: true, p_note: "x" });
  check("non-super cannot verify_payment", !!error, error?.message);
  await admin.from("payments").delete().eq("id", pay.id);
}

// verify_payment extends from later of now/ends_at
{
  const firmId = (await activeClient.from("profiles").select("firm_id").eq("id", activeOwner.userId).single()).data.firm_id;
  const planId = (await admin.from("plans").select("id").eq("code", "monthly").single()).data.id;
  const future = new Date(Date.now() + 60*86400000).toISOString();
  await admin.from("subscriptions").update({ ends_at: future, status: "active" }).eq("firm_id", firmId);
  const { data: pay } = await admin.from("payments").insert({ firm_id: firmId, plan_id: planId, amount_pkr: 1000, method: "bank_transfer", reference_no: "TESTREF2", status: "pending", submitted_by: activeOwner.userId }).select().single();
  const beforeEnds = (await admin.from("subscriptions").select("ends_at").eq("firm_id", firmId).order("ends_at", { ascending: false }).limit(1).single()).data.ends_at;
  const { data: res, error } = await superClient.rpc("verify_payment", { p_payment_id: pay.id, p_approve: true, p_note: "ok" });
  const afterEnds = (await admin.from("subscriptions").select("ends_at").eq("firm_id", firmId).order("ends_at", { ascending: false }).limit(1).single()).data.ends_at;
  check("super admin verify_payment succeeds", !error, error?.message || JSON.stringify(res));
  check("verify_payment extends from later", new Date(afterEnds) > new Date(beforeEnds), `${beforeEnds} -> ${afterEnds}`);
  await admin.from("payments").delete().eq("id", pay.id);
}

// device registration
{
  const devClient = clientFor(activeOwner.token);
  await devClient.rpc("register_device", { p_device_id: "dev1", p_label: "d1", p_session_id: "s1" });
  await devClient.rpc("register_device", { p_device_id: "dev2", p_label: "d2", p_session_id: "s2" });
  await devClient.rpc("register_device", { p_device_id: "dev3", p_label: "d3", p_session_id: "s3" });
  const { data } = await admin.from("user_devices").select("device_id, revoked_at").eq("user_id", activeOwner.userId);
  const revoked = data?.filter(d => d.revoked_at);
  check("third device revokes oldest", revoked && revoked.length >= 1, JSON.stringify(data));
  await admin.from("user_devices").delete().eq("user_id", activeOwner.userId);
}

// renewal reminder idempotent
{
  const firmId = "f0000000-0000-0000-0000-000000000011";
  const ends = new Date(Date.now() + 7*86400000);
  await admin.from("subscriptions").update({ ends_at: ends.toISOString(), status: "active" }).eq("firm_id", firmId);
  const today = new Date().toISOString().slice(0,10);
  await admin.rpc("update_subscription_states", { p_today: today });
  await admin.rpc("update_subscription_states", { p_today: today });
  const { data } = await admin.from("billing_events").select("id").eq("firm_id", firmId).eq("event_type", "renewal_reminder");
  check("renewal reminder idempotent", (data?.length || 0) <= 1, `count=${data?.length}`);
}

// trial works then expires with p_today
{
  const trialOwner = await signIn("owner-trial@demo.test", "Owner1234!");
  const trialClient = clientFor(trialOwner.token);
  const trialFirmId = (await trialClient.from("profiles").select("firm_id").eq("id", trialOwner.userId).single()).data.firm_id;
  // ensure subscription active/trialing
  const trialEnds = new Date(Date.now() + 7*86400000);
  await admin.from("subscriptions").update({ status: "trialing", ends_at: trialEnds.toISOString(), grace_until: null }).eq("firm_id", trialFirmId);
  const { error: insErr } = await trialClient.from("clients").insert({ firm_id: trialFirmId, full_name: "Trial Client" });
  check("trial works (insert client)", !insErr, insErr?.message);
  if (!insErr) await admin.from("clients").delete().eq("full_name", "Trial Client").eq("firm_id", trialFirmId);
  const { data: sub } = await admin.from("subscriptions").select("ends_at").eq("firm_id", trialFirmId).order("ends_at", { ascending: false }).limit(1).single();
  const future = new Date(new Date(sub.ends_at).getTime() + 10*86400000).toISOString().slice(0,10);
  await admin.rpc("update_subscription_states", { p_today: future });
  const { data: sub2 } = await admin.from("subscriptions").select("status").eq("firm_id", trialFirmId).order("ends_at", { ascending: false }).limit(1).single();
  check("trial expires with p_today", sub2?.status === "expired" || sub2?.status === "grace", sub2?.status);
  const { error: insErr2 } = await trialClient.from("clients").insert({ firm_id: trialFirmId, full_name: "Trial Client 2" });
  check("expired trial cannot insert client", !!insErr2, insErr2?.message);
  // restore
  await admin.from("subscriptions").update({ status: "trialing", ends_at: trialEnds.toISOString(), grace_until: null }).eq("firm_id", trialFirmId);
}

// remove_member frees a seat
{
  const activeOwner2 = await signIn("owner-active@demo.test", "Owner1234!");
  const activeClient2 = clientFor(activeOwner2.token);
  const firmId = (await activeClient2.from("profiles").select("firm_id").eq("id", activeOwner2.userId).single()).data.firm_id;
  const { data: tmpUser } = await admin.auth.admin.createUser({ email: `seat-test-${Date.now()}@demo.test`, password: "SeatTest1234!", email_confirm: true });
  const memberId = tmpUser.user.id;
  const { error: insErr } = await admin.from("profiles").insert({ id: memberId, firm_id: firmId, full_name: "Seat Test", email: "seat-test@demo.test", role: "clerk", is_active: true });
  console.log("insert profile err:", insErr?.message);
  const usedBefore = (await admin.rpc("seats_used", { p_firm_id: firmId })).data;
  await activeClient2.rpc("remove_member", { p_user_id: memberId });
  const usedAfter = (await admin.rpc("seats_used", { p_firm_id: firmId })).data;
  check("remove_member frees a seat", usedAfter === usedBefore - 1, `${usedBefore} -> ${usedAfter}`);
  // non-owner cannot remove_member
  const lawyerUser = await signIn("lawyer@mzm.pk", "Lawyer1234!");
  const lawyerClient = clientFor(lawyerUser.token);
  const { error: rmErr } = await lawyerClient.rpc("remove_member", { p_user_id: memberId });
  check("non-owner cannot remove_member", !!rmErr, rmErr?.message);
  // cleanup
  await admin.from("profiles").delete().eq("id", memberId);
}

// create-member live proofs (deployed function)
{
  const fnUrl = supabaseUrl + "/functions/v1/create-member";
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  async function callCreate(token, body) {
    const res = await fetch(fnUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token, "apikey": anonKey },
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    return { status: res.status, json };
  }

  // restore active firm subscription (tests above may have expired it)
  const nowAct = new Date();
  await admin.from("subscriptions").delete().eq("firm_id", "f0000000-0000-0000-0000-000000000011");
  await admin.from("subscriptions").insert({ firm_id: "f0000000-0000-0000-0000-000000000011", plan_id: null, status: "active", starts_at: nowAct.toISOString(), ends_at: new Date(nowAct.getTime()+30*86400000).toISOString() });
  const ownerActive = await signIn("owner-active@demo.test", "Owner1234!");
  const firmId = (await (await fetch(supabaseUrl + "/rest/v1/profiles?id=eq." + ownerActive.userId + "&select=firm_id", { headers: { apikey: anonKey, Authorization: "Bearer " + ownerActive.token } })).json())[0].firm_id;

  // reset members (remove any temp clerks) via service role
  await admin.from("profiles").delete().eq("firm_id", firmId).neq("is_owner", true);

  // add up to limit (max_users 5, owner already 1 -> 4 more)
  // duplicate email rejected (owner email already exists)
  const rDup0 = await callCreate(ownerActive.token, { email: "owner-active@demo.test", full_name: "Dup", role: "clerk", temp_password: "TmpPass1234!" });
  check("duplicate email rejected", rDup0.status === 409 || rDup0.status === 400, "status=" + rDup0.status + " " + JSON.stringify(rDup0.json));

  const created = [];
  for (let i = 0; i < 4; i++) {
    const email = "tmp-member-" + i + "-" + Date.now() + "@demo.test";
    const r = await callCreate(ownerActive.token, { email, full_name: "Tmp " + i, role: "clerk", temp_password: "TmpPass1234!" });
    check("owner adds member " + (i + 1), r.status === 200, "status=" + r.status + " " + JSON.stringify(r.json));
    if (r.status === 200) created.push({ email, id: r.json.user_id });
  }
  // next should be denied (seat limit)
  const rLimit = await callCreate(ownerActive.token, { email: "tmp-overflow-" + Date.now() + "@demo.test", full_name: "Overflow", role: "clerk", temp_password: "TmpPass1234!" });
  check("seat limit denies next member", rLimit.status === 403 || rLimit.status === 409 || rLimit.status === 400, "status=" + rLimit.status + " " + JSON.stringify(rLimit.json));

  // role escalation denied
  for (const badRole of ["admin", "super_admin", "owner"]) {
    const r = await callCreate(ownerActive.token, { email: "esc-" + badRole + "-" + Date.now() + "@demo.test", full_name: "Esc", role: badRole, temp_password: "TmpPass1234!" });
    check("role escalation denied (" + badRole + ")", r.status === 400, "status=" + r.status);
  }


  // lawyer denied
  const lawyerUser = await signIn("lawyer@mzm.pk", "Lawyer1234!");
  const rLawyer = await callCreate(lawyerUser.token, { email: "lawyer-add-" + Date.now() + "@demo.test", full_name: "X", role: "clerk", temp_password: "TmpPass1234!" });
  check("lawyer cannot add member", rLawyer.status === 403, "status=" + rLawyer.status);

  // clerk denied (create a temp clerk? use existing? none in active firm; skip if no clerk token)
  // non-owner admin denied: create an admin profile in active firm via service role
  const { data: tmpAdminUser } = await admin.auth.admin.createUser({ email: "tmp-admin-" + Date.now() + "@demo.test", password: "TmpAdmin1234!", email_confirm: true });
  await admin.from("profiles").insert({ id: tmpAdminUser.user.id, firm_id: firmId, full_name: "Tmp Admin", email: tmpAdminUser.user.email, role: "admin", is_owner: false, is_active: true });
  const tmpAdminSignIn = await signIn(tmpAdminUser.user.email, "TmpAdmin1234!");
  const rAdmin = await callCreate(tmpAdminSignIn.token, { email: "admin-add-" + Date.now() + "@demo.test", full_name: "X", role: "clerk", temp_password: "TmpPass1234!" });
  check("non-owner admin cannot add member", rAdmin.status === 403, "status=" + rAdmin.status);

  // expired firm cannot add
  const expiredOwner = await signIn("owner-expired@demo.test", "Owner1234!");
  const rExpired = await callCreate(expiredOwner.token, { email: "expired-add-" + Date.now() + "@demo.test", full_name: "X", role: "clerk", temp_password: "TmpPass1234!" });
  check("expired firm cannot add member", rExpired.status === 403, "status=" + rExpired.status);

  // owner A cannot add to firm B: function uses caller firm, so passing firm_id is ignored; verify by calling as active owner and checking created member's firm
  if (created.length > 0) {
    const { data: prof } = await admin.from("profiles").select("firm_id").eq("email", created[0].email).single();
    check("owner A cannot add to firm B (firm derived from caller)", prof?.firm_id === firmId, prof?.firm_id);
  }

  // remove_member frees a seat
  if (created.length > 0) {
    const mid = created[0].id;
    const before = (await admin.rpc("seats_used", { p_firm_id: firmId })).data;
  await fetch(supabaseUrl + "/rest/v1/rpc/remove_member", { method: "POST", headers: { "Content-Type": "application/json", "Authorization": "Bearer " + ownerActive.token, "apikey": anonKey }, body: JSON.stringify({ p_user_id: mid }) });
    const after = (await admin.rpc("seats_used", { p_firm_id: firmId })).data;
    check("remove_member frees a seat (live)", after === before - 1, before + " -> " + after);
  }

  // cleanup temp users
  for (const c of created) {
    const { data: u } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const usr = u.users.find((x) => x.email === c.email);
    if (usr) await admin.auth.admin.deleteUser(usr.id);
  }
  await admin.from("profiles").delete().eq("firm_id", firmId).neq("is_owner", true);
  await admin.auth.admin.deleteUser(tmpAdminUser.user.id);
  // restore active firm members none
  console.log("create-member live proofs done");
}

// restore active firm subscription
{
  const firmId = (await activeClient.from("profiles").select("firm_id").eq("id", activeOwner.userId).single()).data.firm_id;
  const future = new Date(Date.now() + 30*86400000);
  await admin.from("subscriptions").update({ ends_at: future.toISOString(), status: "active", grace_until: null }).eq("firm_id", firmId);
  const firmId2 = "f0000000-0000-0000-0000-000000000011";
  const ends2 = new Date(Date.now() + 30*86400000);
  await admin.from("subscriptions").update({ ends_at: ends2.toISOString(), status: "active", grace_until: null }).eq("firm_id", firmId2);
}

console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);








