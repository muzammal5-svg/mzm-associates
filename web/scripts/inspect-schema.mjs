import { Client } from "pg";

const client = new Client({
  connectionString: "postgresql://postgres.zxxpsvhlekemgccrcwtg:muzammal571@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres",
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await client.connect();

  const colRes = await client.query(`
    SELECT column_name, data_type, udt_name 
    FROM information_schema.columns 
    WHERE table_name = 'cases' AND column_name IN ('representing', 'from', 'From');
  `);
  console.log("Column info in cases:", colRes.rows);

  const viewsRes = await client.query(`
    SELECT table_name 
    FROM information_schema.views 
    WHERE table_schema = 'public' AND view_definition ILIKE '%representing%';
  `);
  console.log("Views with representing:", viewsRes.rows.map(v => v.table_name));

  const funcRes = await client.query(`
    SELECT routine_name, routine_definition 
    FROM information_schema.routines 
    WHERE routine_schema = 'public' AND routine_definition ILIKE '%create_case%';
  `);
  console.log("Routines for create_case:", funcRes.rows.map(r => r.routine_name));

  await client.end();
}

run().catch(console.error);
