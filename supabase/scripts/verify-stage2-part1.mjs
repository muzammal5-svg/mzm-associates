import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "../..");
const require = createRequire(resolve(repoRoot, "web/package.json"));
const { createClient } = require("@supabase/supabase-js");
const projectRef = "zxxpsvhlekemgccrcwtg";
const firmId = "f0000000-0000-0000-0000-000000000001";
const otherFirmId = "e0000000-0000-0000-0000-000000000001";
const caseTypeId = "c7000000-0000-0000-0000-000000000002";
const clientId = "c1000000-0000-0000-0000-000000000001";
const demoUsers = [
  { email: "admin@mzm.pk", password: "Admin1234!", role: "admin" },
  { email: "lawyer@mzm.pk", password: "Lawyer1234!", role: "lawyer" },
  { email: "clerk@mzm.pk", password: "Clerk1234!", role: "clerk" },
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

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function todayKarachi() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Karachi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function dateOffset(date, days) {
  const result = new Date(`${date}T00:00:00.000Z`);
  result.setUTCDate(result.getUTCDate() + days);
  return result.toISOString().slice(0, 10);
}

const env = parseEnv(await readFile(resolve(repoRoot, "web/.env.local"), "utf8"));
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
assert(
  env.SUPABASE_PROJECT_REF === projectRef &&
    supabaseUrl === `https://${projectRef}.supabase.co`,
  "Refusing verification: configured Supabase project is not the approved dev project.",
);
assert(anonKey && serviceRoleKey, "Required Supabase keys are missing from web/.env.local.");

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const clients = {};
const fixtureIds = {
  cases: [],
  hearings: [],
  documents: [],
  storage: [],
  users: [],
};
const results = [];
let oldClerkProfile = null;
let oldAdminPreference = null;

async function check(name, action) {
  try {
    const evidence = await action();
    results.push({ name, pass: true, evidence });
    console.log(`PASS ${name}: ${evidence}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected verification error";
    results.push({ name, pass: false, evidence: message });
    console.error(`FAIL ${name}: ${message}`);
  }
}

async function requireOk(result, context) {
  if (result.error) throw new Error(`${context}: ${result.error.message}`);
  return result.data;
}

async function createCase({
  ref = `S2-${crypto.randomUUID()}`,
  status = "running",
  outcome = null,
  decisionDate = null,
  courtNo = "S2-COURT",
  typeId = caseTypeId,
} = {}) {
  const id = crypto.randomUUID();
  await requireOk(await admin.from("cases").insert({
    id,
    firm_id: firmId,
    client_id: clientId,
    case_ref_no: ref,
    plaintiff_name: "Stage Two Verification",
    defendant_name: "Test Respondent",
    From: "plaintiff",
    case_type_id: typeId,
    status,
    decision_date: decisionDate,
    outcome,
    decision_notes: status === "decided" ? "Verification fixture" : null,
    court_no: courtNo,
    created_by: clients.admin.user.id,
    assigned_to: clients.lawyer.user.id,
  }), "Create verification case");
  fixtureIds.cases.push(id);
  return { id, ref };
}

async function createHearing(caseId, {
  hearingDate = todayKarachi(),
  nextDate = null,
  currentProceeding = null,
  createdAt = new Date().toISOString(),
} = {}) {
  const id = crypto.randomUUID();
  await requireOk(await admin.from("hearings").insert({
    id,
    case_id: caseId,
    firm_id: firmId,
    hearing_date: hearingDate,
    next_date: nextDate,
    current_proceeding: currentProceeding,
    created_by: clients.admin.user.id,
    created_at: createdAt,
  }), "Create verification hearing");
  fixtureIds.hearings.push(id);
  return id;
}

async function cleanFixtures() {
  if (oldClerkProfile) {
    await clients.admin.client.from("profiles").update({
      role: oldClerkProfile.role,
      firm_id: oldClerkProfile.firm_id,
      is_active: oldClerkProfile.is_active,
    }).eq("id", clients.clerk?.user.id ?? "");
  }
  if (oldAdminPreference) {
    if (oldAdminPreference.exists) {
      await admin.from("notification_preferences").upsert(oldAdminPreference.row, { onConflict: "user_id" });
    } else if (clients.admin) {
      await admin.from("notification_preferences").delete().eq("user_id", clients.admin.user.id);
    }
  }
  if (fixtureIds.storage.length) {
    await admin.storage.from("documents").remove(fixtureIds.storage.filter(item => item.bucket === "documents").map(item => item.path));
    await admin.storage.from("avatars").remove(fixtureIds.storage.filter(item => item.bucket === "avatars").map(item => item.path));
  }
  if (fixtureIds.cases.length) {
    await admin.from("reminders").delete().in("case_id", fixtureIds.cases);
    await admin.from("notifications").delete().in("ref_id", fixtureIds.cases);
    await admin.from("case_activity_log").delete().in("case_id", fixtureIds.cases);
    await admin.from("documents").delete().in("case_id", fixtureIds.cases);
    await admin.from("hearings").delete().in("case_id", fixtureIds.cases);
    await admin.from("cases").delete().in("id", fixtureIds.cases);
  }
  for (const userId of fixtureIds.users) {
    await admin.from("profiles").delete().eq("id", userId);
    await admin.auth.admin.deleteUser(userId);
  }
  await admin.from("firms").delete().eq("id", otherFirmId);
}

try {
  const setupAdmin = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const adminDemo = demoUsers.find(user => user.role === "admin");
  const { error: setupLoginError } = await setupAdmin.auth.signInWithPassword(adminDemo);
  assert(!setupLoginError, `Admin setup login failed${setupLoginError ? `: ${setupLoginError.message}` : ""}`);
  const { data: clerkBeforeSetup, error: clerkSetupReadError } = await admin.from("profiles")
    .select("role,firm_id,is_active").eq("email", "clerk@mzm.pk").single();
  assert(!clerkSetupReadError && clerkBeforeSetup, "Could not inspect demo clerk profile.");
  if (clerkBeforeSetup.role !== "clerk" || clerkBeforeSetup.firm_id !== firmId || !clerkBeforeSetup.is_active) {
    await requireOk(await setupAdmin.from("profiles").update({
      role: "clerk",
      firm_id: firmId,
      is_active: true,
    }).eq("email", "clerk@mzm.pk"), "Restore demo clerk baseline with admin JWT");
  }
  await setupAdmin.auth.signOut();

  for (const demo of demoUsers) {
    const client = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await client.auth.signInWithPassword(demo);
    assert(!error && data.user, `Login failed for ${demo.email}${error ? `: ${error.message}` : ""}`);
    const { data: profile, error: profileError } = await client
      .from("profiles").select("id,firm_id,role,is_active").eq("id", data.user.id).single();
    assert(!profileError && profile, `Profile read failed for ${demo.email}`);
    assert(profile.firm_id === firmId && profile.role === demo.role && profile.is_active, `Unexpected profile for ${demo.email}`);
    clients[demo.role] = { client, user: data.user, profile };
  }
  console.log("PASS JWT setup: admin, lawyer, and clerk signed in with anon key and read their own profiles");

  await check("C profile escalation and admin scope", async () => {
    oldClerkProfile = { ...clients.clerk.profile };
    for (const patch of [
      { role: "admin" },
      { firm_id: otherFirmId },
      { is_active: false },
    ]) {
      const { error } = await clients.lawyer.client.from("profiles")
        .update(patch).eq("id", clients.lawyer.user.id);
      const { data: unchanged, error: readError } = await clients.lawyer.client
        .from("profiles").select("role,firm_id,is_active").eq("id", clients.lawyer.user.id).single();
      assert(!readError, "Could not re-read lawyer profile after escalation attempt.");
      if (!error && Object.keys(patch).some(key => unchanged[key] !== clients.lawyer.profile[key])) {
        throw new Error(`Lawyer escalation unexpectedly changed ${Object.keys(patch)[0]}.`);
      }
      assert(
        unchanged.role === "lawyer" && unchanged.firm_id === firmId && unchanged.is_active,
        `Lawyer escalation changed profile field ${Object.keys(patch)[0]}.`,
      );
    }

    await requireOk(await admin.from("firms").upsert({
      id: otherFirmId, name: "Stage Two External Fixture", subscription_status: "active",
    }, { onConflict: "id" }), "Create external test firm");
    const { data: externalUser, error: userError } = await admin.auth.admin.createUser({
      email: `stage2-${crypto.randomUUID()}@example.invalid`,
      password: `Verify-${crypto.randomUUID()}-Aa1!`,
      email_confirm: true,
      user_metadata: { firm_id: otherFirmId, role: "lawyer", full_name: "External verification profile" },
    });
    assert(!userError && externalUser.user, `Could not create external test account${userError ? `: ${userError.message}` : ""}`);
    fixtureIds.users.push(externalUser.user.id);

    await requireOk(await clients.admin.client.from("profiles")
      .update({ role: "lawyer" }).eq("id", clients.clerk.user.id), "Admin change own-firm role");
    const { data: promoted } = await admin.from("profiles").select("role").eq("id", clients.clerk.user.id).single();
    assert(promoted.role === "lawyer", "Admin could not change an own-firm user's role.");
    await requireOk(await clients.admin.client.from("profiles").update({ role: "clerk" }).eq("id", clients.clerk.user.id), "Restore clerk role");
    const { error: crossFirmError } = await clients.admin.client.from("profiles")
      .update({ role: "admin" }).eq("id", externalUser.user.id);
    const { data: externalProfile } = await admin.from("profiles").select("role")
      .eq("id", externalUser.user.id).single();
    assert(crossFirmError || externalProfile.role === "lawyer", "Admin changed an outside-firm role.");
    await admin.from("profiles").delete().eq("id", externalUser.user.id);
    return "lawyer's role/firm/active escalation left all values unchanged; admin changed own-firm clerk role; outside-firm role remained lawyer";
  });

  await check("D storage buckets and RLS", async () => {
    const { data: buckets, error } = await admin.storage.listBuckets();
    assert(!error, `Could not list storage buckets${error ? `: ${error.message}` : ""}`);
    assert(buckets.some(bucket => bucket.id === "documents" && !bucket.public), "Private documents bucket missing.");
    assert(buckets.some(bucket => bucket.id === "avatars" && bucket.public), "Public avatars bucket missing.");
    const bytes = new Blob(["%PDF-1.4 stage2 verification"], { type: "application/pdf" });
    const ownDoc = `${firmId}/verify-${crypto.randomUUID()}.pdf`;
    await requireOk(await clients.lawyer.client.storage.from("documents").upload(ownDoc, bytes), "Upload own-firm document");
    fixtureIds.storage.push({ bucket: "documents", path: ownDoc });
    const externalDoc = `${otherFirmId}/verify-${crypto.randomUUID()}.pdf`;
    await requireOk(await admin.storage.from("documents").upload(externalDoc, bytes), "Create external-firm document fixture");
    fixtureIds.storage.push({ bucket: "documents", path: externalDoc });
    const attemptedCrossWrite = `${otherFirmId}/verify-write-${crypto.randomUUID()}.pdf`;
    const crossWrite = await clients.lawyer.client.storage.from("documents").upload(attemptedCrossWrite, bytes);
    assert(crossWrite.error, "Cross-firm document write unexpectedly succeeded.");
    const crossRead = await clients.lawyer.client.storage.from("documents").download(externalDoc);
    assert(crossRead.error, "Cross-firm document read unexpectedly succeeded.");
    const clerkDelete = await clients.clerk.client.storage.from("documents").remove([ownDoc]);
    const clerkDeleteResult = await admin.storage.from("documents").download(ownDoc);
    assert(!clerkDeleteResult.error, `Clerk unexpectedly deleted a firm document${clerkDelete.error ? `: ${clerkDelete.error.message}` : ""}.`);

    const ownAvatar = `${clients.lawyer.user.id}/verify-${crypto.randomUUID()}.png`;
    const avatar = new Blob(["avatar fixture"], { type: "image/png" });
    await requireOk(await clients.lawyer.client.storage.from("avatars").upload(ownAvatar, avatar), "Upload own avatar");
    fixtureIds.storage.push({ bucket: "avatars", path: ownAvatar });
    const otherAvatar = `${clients.admin.user.id}/verify-${crypto.randomUUID()}.png`;
    const avatarWrite = await clients.lawyer.client.storage.from("avatars").upload(otherAvatar, avatar);
    assert(avatarWrite.error, "User wrote to another user's avatar path.");
    const avatarRead = await clients.lawyer.client.storage.from("avatars").download(ownAvatar);
    assert(!avatarRead.error, "Public avatar read failed.");
    return "documents private, avatars public; own-firm document and own-avatar uploads pass; cross-firm read/write, clerk delete, and foreign avatar write denied";
  });

  await check("E atomic case creation", async () => {
    const successRef = `S2-CREATE-${crypto.randomUUID()}`;
    const caseResult = await requireOk(await clients.lawyer.client.rpc("create_case_with_first_hearing", {
      p_case: {
        client_id: clientId,
        case_ref_no: successRef,
        plaintiff_name: "Atomic create check",
        defendant_name: "Respondent",
        From: "plaintiff",
        case_type_id: caseTypeId,
      },
      p_first_hearing: { hearing_date: todayKarachi(), next_date: dateOffset(todayKarachi(), 4) },
    }), "Atomic case create RPC");
    const created = Array.isArray(caseResult) ? caseResult[0] : caseResult;
    fixtureIds.cases.push(created.id);
    const { data: hearing, error: hearingError } = await admin.from("hearings")
      .select("id").eq("case_id", created.id).maybeSingle();
    assert(!hearingError && hearing, "RPC did not create the first hearing.");

    const failedRef = `S2-CREATE-FAIL-${crypto.randomUUID()}`;
    const { error: expectedFailure } = await clients.lawyer.client.rpc("create_case_with_first_hearing", {
      p_case: {
        client_id: clientId,
        case_ref_no: failedRef,
        plaintiff_name: "Atomic rollback check",
        defendant_name: "Respondent",
        From: "plaintiff",
        case_type_id: caseTypeId,
      },
      p_first_hearing: { hearing_date: "not-a-date" },
    });
    assert(expectedFailure, "Invalid first hearing unexpectedly succeeded.");
    const { data: orphan } = await admin.from("cases").select("id").eq("case_ref_no", failedRef).maybeSingle();
    assert(!orphan, "Failed transaction left an orphan case.");
    return `case ${created.id} and first hearing created together; forced invalid-date failure left no case`;
  });

  await check("F atomic hearing update and date guard", async () => {
    const fixture = await createCase({ ref: `S2-HEARING-${crypto.randomUUID()}` });
    const oldDate = dateOffset(todayKarachi(), -30);
    const oldHearing = await createHearing(fixture.id, {
      hearingDate: oldDate,
      currentProceeding: null,
    });
    const { error: badDateError } = await clients.lawyer.client.rpc("update_hearing", {
      p_hearing_id: oldHearing,
      p_current_proceeding: "Should roll back",
      p_next_proceeding: null,
      p_next_date: oldDate,
      p_serial_no: null,
      p_judge_name: null,
      p_court_no: null,
    });
    assert(badDateError, "Next date equal to hearing date was accepted.");
    const { data: afterFailure } = await admin.from("hearings")
      .select("id,current_proceeding").eq("case_id", fixture.id);
    assert(afterFailure.length === 1 && afterFailure[0].current_proceeding === null, "Failed update left partial hearing changes.");

    const nextDate = dateOffset(todayKarachi(), 12);
    const { data: newRow, error } = await clients.lawyer.client.rpc("update_hearing", {
      p_hearing_id: oldHearing,
      p_current_proceeding: "Evidence recorded",
      p_next_proceeding: "Cross examination",
      p_next_date: nextDate,
      p_serial_no: "S2",
      p_judge_name: null,
      p_court_no: null,
    });
    assert(!error, `Valid update_hearing failed${error ? `: ${error.message}` : ""}`);
    const returned = Array.isArray(newRow) ? newRow[0] : newRow;
    if (returned?.id) fixtureIds.hearings.push(returned.id);
    const { data: rows } = await admin.from("hearings").select("id,current_proceeding,next_date").eq("case_id", fixture.id);
    assert(rows.length === 2 && rows.find(row => row.id === oldHearing)?.current_proceeding === "Evidence recorded", "Old hearing was not completed or new hearing missing.");
    assert(rows.some(row => row.next_date === nextDate), "New hearing next date is incorrect.");
    return `valid update created second hearing and completed old row; equal-date rejection left one unchanged row`;
  });

  await check("G deterministic latest view and decided filters", async () => {
    const sameDateCase = await createCase({ ref: `S2-LATEST-${crypto.randomUUID()}` });
    const sharedDate = dateOffset(todayKarachi(), -5);
    await createHearing(sameDateCase.id, { hearingDate: sharedDate, createdAt: "2026-01-01T00:00:00Z" });
    const newestId = await createHearing(sameDateCase.id, { hearingDate: sharedDate, createdAt: "2026-01-02T00:00:00Z" });
    const { data: latestRows, error: viewError } = await clients.lawyer.client.from("v_cause_list")
      .select("hearing_id,is_latest_hearing").eq("case_id", sameDateCase.id);
    assert(!viewError, `Could not query v_cause_list${viewError ? `: ${viewError.message}` : ""}`);
    assert(latestRows.filter(row => row.is_latest_hearing).length === 1, "Same-date hearings did not produce exactly one latest row.");
    assert(latestRows.find(row => row.is_latest_hearing)?.hearing_id === newestId, "Latest row did not use created_at tie-break.");

    const year = Number(todayKarachi().slice(0, 4)) - 1;
    const filterRefs = [];
    for (let i = 0; i < 21; i += 1) {
      const fixture = await createCase({
        ref: `S2-FILTER-${i}-${crypto.randomUUID()}`,
        status: "decided",
        outcome: "settled",
        decisionDate: `${year}-06-15`,
        courtNo: "S2-FILTER-COURT",
      });
      filterRefs.push(fixture.id);
    }
    const filteredQuery = () => clients.admin.client.from("cases")
      .select("id", { count: "exact" })
      .eq("status", "decided")
      .eq("outcome", "settled")
      .gte("decision_date", `${year}-01-01`)
      .lt("decision_date", `${year + 1}-01-01`)
      .eq("case_type_id", caseTypeId)
      .ilike("court_no", "%S2-FILTER-COURT%");
    const first = await filteredQuery().range(0, 19);
    const second = await filteredQuery().range(20, 39);
    assert(!first.error && !second.error, "Filtered decided query failed.");
    assert(first.count === 21 && first.data.length === 20 && second.data.length === 1, "Combined server filters did not persist across page boundaries.");
    assert(second.data.every(row => filterRefs.includes(row.id)), "Page two contains a non-matching fixture.");
    return `same-date latest=true count is 1 (created_at tie-break honored); combined outcome/year/type/court query count=21, page 1=20, page 2=1`;
  });

  await check("H reopen logs one reason-bearing activity", async () => {
    const fixture = await createCase({
      ref: `S2-REOPEN-${crypto.randomUUID()}`,
      status: "decided",
      outcome: "won",
      decisionDate: dateOffset(todayKarachi(), -2),
    });
    const reason = `Verification reopen ${crypto.randomUUID()}`;
    const { data, error } = await clients.admin.client.rpc("reopen_case", {
      p_case_id: fixture.id,
      p_reason: reason,
    });
    assert(!error, `reopen_case failed${error ? `: ${error.message}` : ""}`);
    const returned = Array.isArray(data) ? data[0] : data;
    assert(returned?.status === "running", "Reopen RPC did not return running status.");
    const { data: events, error: eventError } = await admin.from("case_activity_log")
      .select("id,summary,meta").eq("case_id", fixture.id).eq("event", "case_reopened");
    assert(!eventError && events.length === 1, "Reopen must create exactly one activity entry.");
    assert(events[0].summary.includes(reason) && events[0].meta?.reason === reason, "Reopen reason missing from activity.");
    return `reopened case has exactly one case_reopened row; reason present in summary and meta`;
  });

  await check("I atomic mark-decided workflow", async () => {
    const fixture = await createCase({ ref: `S2-DECIDE-${crypto.randomUUID()}` });
    const hearingId = await createHearing(fixture.id, {
      hearingDate: dateOffset(todayKarachi(), -4),
      nextDate: dateOffset(todayKarachi(), 5),
    });
    const reminder = await requireOk(await admin.from("reminders").insert({
      firm_id: firmId,
      case_id: fixture.id,
      hearing_id: hearingId,
      user_id: clients.admin.user.id,
      remind_date: dateOffset(todayKarachi(), -5),
      next_date: dateOffset(todayKarachi(), 5),
      status: "upcoming",
      urgency: "medium",
    }).select("id").single(), "Create decision reminder");
    const { error } = await clients.admin.client.rpc("mark_case_decided", {
      p_case_id: fixture.id,
      p_decision_date: todayKarachi(),
      p_outcome: "won",
      p_decision_notes: "Atomic decision verification",
      p_document: null,
    });
    assert(!error, `mark_case_decided failed${error ? `: ${error.message}` : ""}`);
    const { data: caseRow } = await admin.from("cases").select("status").eq("id", fixture.id).single();
    const { data: reminderRow } = await admin.from("reminders").select("status").eq("id", reminder.id).single();
    const { data: activity } = await admin.from("case_activity_log")
      .select("id").eq("case_id", fixture.id).eq("event", "case_decided");
    assert(caseRow.status === "decided" && reminderRow.status === "dismissed" && activity.length === 1, "Decision state, reminder, or activity mismatch.");

    const failedFixture = await createCase({
      ref: `S2-DECIDE-ROLLBACK-${crypto.randomUUID()}`,
      status: "decided",
      outcome: "lost",
      decisionDate: todayKarachi(),
    });
    const path = `${firmId}/verify-rollback-${crypto.randomUUID()}.pdf`;
    const { error: rejected } = await clients.admin.client.rpc("mark_case_decided", {
      p_case_id: failedFixture.id,
      p_decision_date: todayKarachi(),
      p_outcome: "won",
      p_document: { name: "Rollback file", file_path: path, mime: "application/pdf", size: "32" },
    });
    assert(rejected, "Already-decided case unexpectedly accepted decision.");
    const { data: rolledBackDocument } = await admin.from("documents").select("id").eq("file_path", path).maybeSingle();
    assert(!rolledBackDocument, "Failed decision left its document metadata row.");
    const { data: decisionEvents } = await admin.from("case_activity_log")
      .select("id").eq("case_id", failedFixture.id).eq("event", "case_decided");
    assert(decisionEvents.length === 0, "Failed decision left activity log entry.");
    return `successful decision dismissed reminder and wrote one activity; rejected decision left no document metadata or activity`;
  });

  await check("generate_reminders 10/11-day boundary", async () => {
    const today = todayKarachi();
    const tenDayCase = await createCase({ ref: `S2-REM-10-${crypto.randomUUID()}` });
    const elevenDayCase = await createCase({ ref: `S2-REM-11-${crypto.randomUUID()}` });
    const tenHearing = await createHearing(tenDayCase.id, {
      hearingDate: dateOffset(today, -20),
      nextDate: dateOffset(today, 10),
    });
    const elevenHearing = await createHearing(elevenDayCase.id, {
      hearingDate: dateOffset(today, -20),
      nextDate: dateOffset(today, 11),
    });
    const { data: preference, error: prefError } = await admin.from("notification_preferences")
      .select("*").eq("user_id", clients.admin.user.id).maybeSingle();
    assert(!prefError, "Could not read admin notification preference.");
    oldAdminPreference = preference ? { exists: true, row: preference } : { exists: false };
    await requireOk(await admin.from("notification_preferences").upsert({
      ...(preference ?? {}),
      user_id: clients.admin.user.id,
      firm_id: firmId,
      remind_days_before: 10,
      notify_reminders: true,
    }, { onConflict: "user_id" }), "Set verification reminder window");
    const { error } = await clients.admin.client.rpc("generate_reminders", {
      p_firm_id: firmId,
      p_today: today,
    });
    assert(!error, `generate_reminders failed${error ? `: ${error.message}` : ""}`);
    const lookup = async hearingId => {
      const { data, error: queryError } = await admin.from("reminders")
        .select("id,status").eq("hearing_id", hearingId).eq("user_id", clients.admin.user.id).maybeSingle();
      assert(!queryError, "Could not query generated reminder.");
      return data;
    };
    assert((await lookup(tenHearing))?.status === "upcoming", "No upcoming reminder for exactly 10 days.");
    assert(!(await lookup(elevenHearing)), "Reminder created outside the configured 10-day window.");
    await clients.admin.client.rpc("generate_reminders", { p_firm_id: firmId, p_today: today });
    const { data: tenRows } = await admin.from("reminders").select("id")
      .eq("hearing_id", tenHearing).eq("user_id", clients.admin.user.id);
    assert(tenRows.length === 1, "Second run duplicated the 10-day reminder.");
    return `p_today=${today}; +10 days produced one upcoming reminder after two runs; +11 days produced none`;
  });

  await check("J auth/profile loading gate", async () => {
    const [guard, provider, routeGuard] = await Promise.all([
      readFile(resolve(repoRoot, "web/hooks/useRequireAuth.ts"), "utf8"),
      readFile(resolve(repoRoot, "web/providers/AuthProvider.tsx"), "utf8"),
      readFile(resolve(repoRoot, "web/components/shared/RouteGuard.tsx"), "utf8"),
    ]);
    assert(guard.includes("loading || (configured && !!user && profileLoading)"), "Guard does not wait for profile fetch.");
    assert(guard.includes("if (!profile) { router.replace(redirectTo); return; }"), "Guard does not redirect when profile is missing.");
    assert(provider.includes("await fetchProfile(data.session.user.id)") && provider.includes("finally {\n        setLoading(false);"), "Initial auth loading ends before profile fetch.");
    assert(routeGuard.includes("if (loading) return"), "RouteGuard renders children before guard is ready.");
    return "source assertions confirm session/profile wait, missing-profile redirect, and protected children remain behind loader";
  });
} finally {
  await cleanFixtures();
}

const failures = results.filter(result => !result.pass);
console.log(`\nStage 2 Part 1 verification: ${results.length - failures.length}/${results.length} checks passed.`);
if (failures.length) process.exitCode = 1;
