import { Client } from "pg";

const client = new Client({
  connectionString: "postgresql://postgres.zxxpsvhlekemgccrcwtg:muzammal571@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres",
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await client.connect();

  const v = await client.query(`
    SELECT pg_get_viewdef('v_cause_list'::regclass, true) as def;
  `);
  console.log("=== VIEW v_cause_list ===\n", v.rows[0].def);

  const f = await client.query(`
    SELECT pg_get_functiondef('create_case_with_first_hearing'::regproc) as def;
  `);
  console.log("=== FUNCTION create_case_with_first_hearing ===\n", f.rows[0].def);

  await client.end();
}

run().catch(console.error);
