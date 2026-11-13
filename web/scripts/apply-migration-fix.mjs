import pg from 'pg';
import fs from 'fs';
const { Client } = pg;
const client = new Client({ connectionString: 'postgresql://postgres.zxxpsvhlekemgccrcwtg:muzammal571@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres' });
await client.connect();
const sql = fs.readFileSync('../supabase/migrations/20261113000000_fix_account_deletion_and_device_limit.sql', 'utf8');
try {
  await client.query(sql);
  console.log('Migration applied OK');
} catch (e) {
  console.error('Error:', e.message);
}
await client.end();
