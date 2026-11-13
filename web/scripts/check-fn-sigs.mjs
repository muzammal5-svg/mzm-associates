import pg from 'pg';
const { Client } = pg;
const client = new Client({ connectionString: 'postgresql://postgres.zxxpsvhlekemgccrcwtg:muzammal571@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres' });
await client.connect();
const r = await client.query(`SELECT proname, pg_get_function_result(p.oid) as return_type, pg_get_function_arguments(p.oid) as args FROM pg_proc p WHERE proname IN ('register_device','check_device_valid')`);
console.log(JSON.stringify(r.rows, null, 2));
await client.end();
