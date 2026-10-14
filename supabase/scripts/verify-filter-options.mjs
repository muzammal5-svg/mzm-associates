import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';
import pg from 'pg';
import { fetchHearingFilterOptions } from '../../web/lib/hearingFilterOptions.mjs';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '../..');
const envPath = path.resolve(repoRoot, 'web/.env.local');
const allowedProjectRef = 'zxxpsvhlekemgccrcwtg';
const testRows = 620;
const marker = 'FILTER_OPTIONS_VERIFY';
const { Client } = pg;

function parseEnv(source) {
  return Object.fromEntries(source.split(/\r?\n/).flatMap(line => {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    return match ? [[match[1], match[2].replace(/^(['"])(.*)\1$/, '$2')]] : [];
  }));
}

async function main() {
  const env = parseEnv(await fs.readFile(envPath, 'utf8'));
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const projectRef = env.SUPABASE_PROJECT_REF;
  const dbPassword = env.SUPABASE_DB_PASSWORD;
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (projectRef !== allowedProjectRef || !url?.includes(allowedProjectRef)) {
    throw new Error('Refusing to run: configured Supabase project is not the approved dev project.');
  }
  if (!dbPassword || !anonKey) throw new Error('Missing required dev environment values.');

  const connectionString = `postgresql://postgres.${projectRef}:${encodeURIComponent(dbPassword)}@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres`;
  const adminDb = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  const lawyer = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
  await adminDb.connect();
  let inserted = 0;
  try {
    const { error: loginError } = await lawyer.auth.signInWithPassword({
      email: 'lawyer@mzm.pk',
      password: 'Lawyer1234!',
    });
    if (loginError) throw new Error(`Lawyer login failed: ${loginError.message}`);

    await adminDb.query(
      `DELETE FROM public.hearings WHERE court_no LIKE $1 AND judge_name LIKE $2`,
      [`${marker}_COURT_%`, `${marker}_JUDGE_%`],
    );

    const baseline = await adminDb.query('SELECT count(*)::int AS count FROM public.hearings');
    console.log(`BASELINE_HEARINGS: ${baseline.rows[0].count}`);

    const insertedRows = await adminDb.query(`
      INSERT INTO public.hearings (
        case_id, firm_id, hearing_date, next_date, judge_name, court_no, created_by
      )
      SELECT
        c.id, c.firm_id, (now() AT TIME ZONE 'Asia/Karachi')::date,
        (now() AT TIME ZONE 'Asia/Karachi')::date + 1,
        $1 || '_JUDGE_' || g::text,
        $1 || '_COURT_' || g::text,
        p.id
      FROM generate_series(1, $2) AS g
      CROSS JOIN LATERAL (
        SELECT id, firm_id FROM public.cases
        WHERE status = 'running' AND deleted_at IS NULL
        ORDER BY created_at
        LIMIT 1
      ) AS c
      CROSS JOIN LATERAL (
        SELECT id FROM public.profiles WHERE role = 'lawyer' AND firm_id = c.firm_id
        ORDER BY created_at
        LIMIT 1
      ) AS p
      RETURNING id
    `, [marker, testRows]);
    inserted = insertedRows.rowCount ?? 0;
    console.log(`TEMP_HEARINGS_INSERTED: ${inserted}`);
    if (inserted !== testRows) throw new Error(`Expected ${testRows} temporary hearings, inserted ${inserted}.`);

const { courts: discoveredCourts, judges: discoveredJudges } = await fetchHearingFilterOptions(lawyer);
    const courts = new Set(discoveredCourts);
    const judges = new Set(discoveredJudges);

    const expectedCourts = Array.from({ length: testRows }, (_, i) => `${marker}_COURT_${i + 1}`);
    const expectedJudges = Array.from({ length: testRows }, (_, i) => `${marker}_JUDGE_${i + 1}`);
    const missingCourts = expectedCourts.filter(value => !courts.has(value));
    const missingJudges = expectedJudges.filter(value => !judges.has(value));
    console.log(`DISTINCT_TEST_COURTS_RETURNED: ${expectedCourts.length - missingCourts.length}/${testRows}`);
    console.log(`DISTINCT_TEST_JUDGES_RETURNED: ${expectedJudges.length - missingJudges.length}/${testRows}`);
    console.log(`MISSING_TEST_COURTS: ${missingCourts.length}`);
    console.log(`MISSING_TEST_JUDGES: ${missingJudges.length}`);
    if (missingCourts.length || missingJudges.length) throw new Error('Filter-option pagination omitted temporary values.');
  } finally {
    await adminDb.query(
      `DELETE FROM public.hearings WHERE court_no LIKE $1 AND judge_name LIKE $2`,
      [`${marker}_COURT_%`, `${marker}_JUDGE_%`],
    );
    const [remaining, hearingTotal] = await Promise.all([
      adminDb.query(
        'SELECT count(*)::int AS count FROM public.hearings WHERE court_no LIKE $1 AND judge_name LIKE $2',
        [`${marker}_COURT_%`, `${marker}_JUDGE_%`],
      ),
      adminDb.query('SELECT count(*)::int AS count FROM public.hearings'),
    ]);
    console.log(`TEMP_HEARINGS_AFTER_CLEANUP: ${remaining.rows[0].count}`);
    console.log(`HEARINGS_AFTER_CLEANUP: ${hearingTotal.rows[0].count}`);
    await lawyer.auth.signOut();
    await adminDb.end();
  }
}

main().catch(error => {
  console.error(`FILTER_OPTIONS_VERIFY_FAIL: ${error.message}`);
  process.exitCode = 1;
});
