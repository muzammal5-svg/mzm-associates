import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';
import pg from 'pg';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '../..');
const { Client } = pg;
const envPath = path.resolve(repoRoot, 'web/.env.local');
const seedSqlPath = path.resolve(repoRoot, 'supabase/seed.sql');
const expectedProjectRef = 'zxxpsvhlekemgccrcwtg';
const firmId = 'f0000000-0000-0000-0000-000000000001';
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const suppliedUrl = args.find((arg) => arg.startsWith('--url='))?.slice('--url='.length);

const demoUsers = [
  { email: 'admin@mzm.pk', password: 'Admin1234!', fullName: 'Muhammad Zubair (Admin)', role: 'admin' },
  { email: 'lawyer@mzm.pk', password: 'Lawyer1234!', fullName: 'Advocate Kamran Hussain', role: 'lawyer' },
  { email: 'clerk@mzm.pk', password: 'Clerk1234!', fullName: 'Sana Clerk', role: 'clerk' },
];

function parseEnv(source) {
  return Object.fromEntries(
    source.split(/\r?\n/).flatMap((line) => {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
      if (!match || match[1].startsWith('#')) return [];
      return [[match[1], match[2].replace(/^(['"])(.*)\1$/, '$2')]];
    }),
  );
}

async function ensureDemoUsers(supabase, firmIdValue) {
  const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (listError) throw new Error(`Could not list existing users: ${listError.message}`);

  for (const demo of demoUsers) {
    const user = existingUsers.users.find((existing) => existing.email?.toLowerCase() === demo.email);
    const metadata = { full_name: demo.fullName, firm_id: firmIdValue, role: demo.role };

    let targetUser;
    if (user) {
      const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
        password: demo.password,
        email_confirm: true,
        user_metadata: { ...user.user_metadata, ...metadata },
      });
      if (error) throw new Error(`Could not update ${demo.email}: ${error.message}`);
      targetUser = data.user;
    } else {
      const { data, error } = await supabase.auth.admin.createUser({
        email: demo.email,
        password: demo.password,
        email_confirm: true,
        user_metadata: metadata,
      });
      if (error) throw new Error(`Could not create ${demo.email}: ${error.message}`);
      targetUser = data.user;
    }

    const { error: upsertProfileError } = await supabase.from('profiles').upsert({
      id: targetUser.id,
      firm_id: firmIdValue,
      full_name: demo.fullName,
      email: demo.email,
      role: demo.role,
      is_active: true,
    }, { onConflict: 'id' });

    if (upsertProfileError) {
      throw new Error(`Could not ensure profile for ${demo.email}: ${upsertProfileError.message}`);
    }
  }
}

async function runSeedSql(connectionString) {
  const seedSql = await fs.readFile(seedSqlPath, 'utf8');
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    await client.query(seedSql);
  } finally {
    await client.end();
  }
}

async function main() {
  if (dryRun) {
    const candidateUrl = suppliedUrl ?? parseEnv(await fs.readFile(envPath, 'utf8')).NEXT_PUBLIC_SUPABASE_URL;
    if (!candidateUrl?.includes(expectedProjectRef)) {
      console.error('REFUSED: dry-run URL does not contain the hard-coded approved project ref.');
      process.exitCode = 1;
      return;
    }
    console.log('DRY_RUN_OK: URL contains the hard-coded approved project ref; no data changed.');
    return;
  }

  const envText = await fs.readFile(envPath, 'utf8');
  const env = parseEnv(envText);
  const projectRef = env.SUPABASE_PROJECT_REF;
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
  const dbPassword = env.SUPABASE_DB_PASSWORD;

  if (!projectRef || !supabaseUrl || !serviceRoleKey || !dbPassword) {
    throw new Error('Missing required env values in web/.env.local');
  }

  if (projectRef !== expectedProjectRef || supabaseUrl !== `https://${expectedProjectRef}.supabase.co`) {
    throw new Error('Refusing to reset demo data: configured project is not the approved dev project.');
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  await ensureDemoUsers(supabase, firmId);

  const connectionString = `postgresql://postgres.${projectRef}:${encodeURIComponent(dbPassword)}@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres`;
  await runSeedSql(connectionString);

  const adminClient = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await adminClient.connect();
  const counts = await adminClient.query(`
    SELECT
      (SELECT count(*) FROM public.firms) AS firms,
      (SELECT count(*) FROM public.profiles) AS profiles,
      (SELECT count(*) FROM public.clients) AS clients,
      (SELECT count(*) FROM public.cases) AS cases,
      (SELECT count(*) FROM public.hearings) AS hearings,
      (SELECT count(*) FROM public.reminders) AS reminders;
  `);
  await adminClient.end();

  console.log(`OK demo state restored for ${projectRef}. Counts: ${JSON.stringify(counts.rows[0])}`);
}

main().catch((error) => {
  console.error(`RESET_DEMO_DATA_FAIL: ${error.message}`);
  process.exitCode = 1;
});
