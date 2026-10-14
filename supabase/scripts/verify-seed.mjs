import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const { Client } = pg;
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '../..');
const envPath = path.resolve(repoRoot, 'web/.env.local');
const seedSqlPath = path.resolve(repoRoot, 'supabase/seed.sql');
const expectedProjectRef = 'zxxpsvhlekemgccrcwtg';

function parseEnv(content) {
  return Object.fromEntries(
    content.split(/\r?\n/).flatMap((line) => {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
      if (!match || match[1].startsWith('#')) return [];
      return [[match[1], match[2].replace(/^(['"])(.*)\1$/, '$2')]];
    }),
  );
}

function dateAtKarachi(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Karachi',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const map = Object.fromEntries(parts.filter((part) => part.type !== 'literal').map((part) => [part.type, part.value]));
  return `${map.year}-${map.month}-${map.day}`;
}

function addDays(date, days) {
  const result = new Date(`${date}T00:00:00+05:00`);
  result.setUTCDate(result.getUTCDate() + days);
  return dateAtKarachi(result);
}

async function getConnectionString() {
  const env = parseEnv(await fs.readFile(envPath, 'utf8'));
  if (env.SUPABASE_PROJECT_REF !== expectedProjectRef) {
    throw new Error('Refusing to verify seed: configured project is not the approved dev project.');
  }
  if (!env.SUPABASE_DB_PASSWORD) {
    throw new Error('Missing SUPABASE_DB_PASSWORD in web/.env.local');
  }
  return `postgresql://postgres.${expectedProjectRef}:${encodeURIComponent(env.SUPABASE_DB_PASSWORD)}@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres`;
}

async function getCounts(client) {
  const { rows: [counts] } = await client.query(`
    SELECT
      (SELECT count(*)::int FROM public.firms) AS firms,
      (SELECT count(*)::int FROM public.profiles) AS profiles,
      (SELECT count(*)::int FROM public.clients) AS clients,
      (SELECT count(*)::int FROM public.cases) AS cases,
      (SELECT count(*)::int FROM public.hearings) AS hearings,
      (SELECT count(*)::int FROM public.reminders) AS reminders
  `);
  return counts;
}

async function getMetrics(client, today) {
  const { rows: [metrics] } = await client.query(`
    WITH bounds AS (
      SELECT $1::date AS today, $1::date + 10 AS plus10, $1::date + 11 AS plus11
    )
    SELECT
      (SELECT count(*)::int FROM public.hearings h, bounds b WHERE h.next_date = b.today) AS next_date_today,
      (SELECT count(*)::int FROM public.hearings h, bounds b WHERE h.next_date BETWEEN b.today AND b.plus10) AS next_date_within_10,
      (SELECT count(*)::int FROM public.hearings h, bounds b WHERE h.next_date = b.plus10) AS next_date_plus10,
      (SELECT count(*)::int FROM public.hearings h, bounds b WHERE h.next_date = b.plus11) AS next_date_plus11,
      (SELECT count(*)::int FROM public.hearings h, bounds b WHERE h.next_date < b.today) AS next_date_past,
      (SELECT count(*)::int FROM public.hearings h, bounds b WHERE h.hearing_date = b.today) AS hearing_date_today,
      (SELECT count(*)::int FROM public.hearings h, bounds b WHERE h.hearing_date BETWEEN b.today AND b.plus10) AS hearing_date_within_10,
      (SELECT count(*)::int FROM public.hearings h, bounds b WHERE h.hearing_date = b.plus10) AS hearing_date_plus10,
      (SELECT count(*)::int FROM public.hearings h, bounds b WHERE h.hearing_date = b.plus11) AS hearing_date_plus11,
      (SELECT count(*)::int FROM public.hearings h, bounds b WHERE h.hearing_date < b.today) AS hearing_date_past,
      (SELECT count(*)::int FROM public.hearings WHERE next_date <= hearing_date) AS invalid_date_order,
      (SELECT count(*)::int FROM public.cases WHERE decision_date IS NOT NULL AND outcome IS NOT NULL) AS decided_cases,
      (SELECT count(*)::int FROM public.cases c WHERE NOT EXISTS
        (SELECT 1 FROM public.hearings h WHERE h.case_id = c.id)) AS cases_missing_hearing,
      (SELECT count(*)::int FROM public.cases c
        WHERE c.plaintiff_name ~ '[\\u0600-\\u06FF]' OR c.defendant_name ~ '[\\u0600-\\u06FF]') AS urdu_cases
  `, [today]);
  return metrics;
}

async function seedAtOffset(client, seedSql, offset) {
  await client.query('SELECT set_config($1, $2, false)', ['seed.today_offset_days', String(offset)]);
  await client.query(seedSql);
}

async function main() {
  const seedSql = await fs.readFile(seedSqlPath, 'utf8');
  const client = new Client({ connectionString: await getConnectionString(), ssl: { rejectUnauthorized: false } });
  const today = dateAtKarachi();
  let succeeded = true;
  let connected = false;

  try {
    await client.connect();
    connected = true;
    const runCounts = [];
    for (let run = 1; run <= 3; run += 1) {
      await seedAtOffset(client, seedSql, 0);
      runCounts.push(await getCounts(client));
      console.log(`RUN_${run}_COUNTS ${JSON.stringify(runCounts[run - 1])}`);
    }

    const countsIdentical = runCounts.every((counts) => JSON.stringify(counts) === JSON.stringify(runCounts[0]));
    console.log(`IDENTICAL ${countsIdentical}`);
    if (!countsIdentical) succeeded = false;

    const offsetMetrics = [];
    for (const offset of [0, 1, 0]) {
      await seedAtOffset(client, seedSql, offset);
      const anchor = addDays(today, offset);
      const metrics = await getMetrics(client, anchor);
      const result = {
        offset,
        anchor,
        next_date_today: Number(metrics.next_date_today),
        next_date_plus10: Number(metrics.next_date_plus10),
        next_date_plus11: Number(metrics.next_date_plus11),
        hearing_date_today: Number(metrics.hearing_date_today),
      };
      offsetMetrics.push(result);
      console.log(`OFFSET_${offset}_METRICS ${JSON.stringify(result)}`);
    }
    const offsetsReturned = JSON.stringify(offsetMetrics[0]) === JSON.stringify(offsetMetrics[2]);
    const offsetShifted = offsetMetrics[1].anchor === addDays(offsetMetrics[0].anchor, 1);
    console.log(`OFFSET_0_RETURNED ${offsetsReturned}`);
    console.log(`OFFSET_1_SHIFTED ${offsetShifted}`);
    if (!offsetsReturned || !offsetShifted) succeeded = false;

    const metrics = await getMetrics(client, today);
    const checks = [
      ['next_date_today', metrics.next_date_today, Number(metrics.next_date_today) >= 3],
      ['next_date_within_10', metrics.next_date_within_10, Number(metrics.next_date_within_10) >= 4],
      ['next_date_plus10', metrics.next_date_plus10, Number(metrics.next_date_plus10) >= 1],
      ['next_date_plus11', metrics.next_date_plus11, Number(metrics.next_date_plus11) >= 1],
      ['next_date_past', metrics.next_date_past, Number(metrics.next_date_past) >= 3],
      ['hearing_date_today', metrics.hearing_date_today, Number(metrics.hearing_date_today) >= 3],
      ['hearing_date_within_10', metrics.hearing_date_within_10, Number(metrics.hearing_date_within_10) >= 4],
      ['hearing_date_plus10', metrics.hearing_date_plus10, Number(metrics.hearing_date_plus10) >= 1],
      ['hearing_date_plus11', metrics.hearing_date_plus11, Number(metrics.hearing_date_plus11) >= 1],
      ['hearing_date_past', metrics.hearing_date_past, Number(metrics.hearing_date_past) >= 3],
      ['invalid_date_order', metrics.invalid_date_order, Number(metrics.invalid_date_order) === 0],
      ['urdu_case_party_names', metrics.urdu_cases, Number(metrics.urdu_cases) >= 3],
      ['decided_cases_with_data', metrics.decided_cases, Number(metrics.decided_cases) >= 3],
      ['every_case_has_hearing', metrics.cases_missing_hearing, Number(metrics.cases_missing_hearing) === 0],
    ];
    console.log(`METRICS ${JSON.stringify({ today, ...metrics })}`);
    for (const [label, value, ok] of checks) {
      console.log(`${label}=${ok ? 'PASS' : 'FAIL'} (${value})`);
      if (!ok) succeeded = false;
    }
  } finally {
    if (connected) {
      try {
        const { rows: generated } = await client.query('SELECT * FROM public.generate_reminders()');
        console.log(`GENERATE_REMINDERS_DEFAULT ${JSON.stringify(generated)}`);
        const { rows: [reminderCounts] } = await client.query(`
          SELECT
            count(*)::int AS total,
            count(*) FILTER (WHERE status = 'upcoming')::int AS upcoming
          FROM public.reminders
        `);
        console.log(`FINAL_REMINDER_COUNTS ${JSON.stringify(reminderCounts)}`);
        if (Number(reminderCounts.total) === 0 || Number(reminderCounts.upcoming) === 0) {
          succeeded = false;
        }
      } catch (error) {
        console.error(`REMINDER_GENERATION_FAIL: ${error.message}`);
        succeeded = false;
      }
    }
    await client.end();
  }

  if (!succeeded) process.exitCode = 1;
}

main().catch((error) => {
  console.error(`VERIFY_SEED_FAIL: ${error.message}`);
  process.exit(1);
});
