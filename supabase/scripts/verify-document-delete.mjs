import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const envPath = path.resolve(repoRoot, 'web/.env.local');
const users = [
  { role: 'clerk', email: 'clerk@mzm.pk', password: 'Clerk1234!' },
  { role: 'lawyer', email: 'lawyer@mzm.pk', password: 'Lawyer1234!' },
  { role: 'admin', email: 'admin@mzm.pk', password: 'Admin1234!' },
];
function parseEnv(source) {
  return Object.fromEntries(source.split(/\r?\n/).flatMap(line => {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    return m ? [[m[1], m[2].replace(/^(['"])(.*)\1$/, '$2')]] : [];
  }));
}
async function main() {
  const env = parseEnv(await fs.readFile(envPath, 'utf8'));
  const projectRef = 'zxxpsvhlekemgccrcwtg';
  if (env.SUPABASE_PROJECT_REF !== projectRef || !env.NEXT_PUBLIC_SUPABASE_URL?.includes(projectRef)) throw new Error('wrong project');
  const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession:false, autoRefreshToken:false } });
  const clients = new Map(), paths = [], ids = [], errors = [];
  const tag = 'DELETE_POLICY_VERIFY_' + Date.now();
  try {
    const profiles = {};
    for (const user of users) {
      const client = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth: { persistSession:false, autoRefreshToken:false } });
      clients.set(user.role, client);
      const { data, error } = await client.auth.signInWithPassword({ email:user.email, password:user.password });
      if (error || !data.user) throw new Error(user.role + ' JWT login failed');
      const { data: profile, error: profileError } = await admin.from('profiles').select('id,firm_id,role').eq('id',data.user.id).single();
      if (profileError || profile.role !== user.role) throw new Error(user.role + ' profile verification failed');
      profiles[user.role] = profile;
    }
    const firmId = profiles.admin.firm_id;
    const { data: clientRow, error: clientError } = await admin.from('clients').select('id').eq('firm_id',firmId).limit(1).single();
    if (clientError) throw new Error('no fixture client');
    for (const user of users) {
      const filePath = firmId + '/' + tag + '_' + user.role + '.pdf';
      paths.push(filePath);
      const { error: uploadError } = await admin.storage.from('documents').upload(filePath,Buffer.from([37,80,68,70,45,49,46,52,10,37,32,116,101,109,112,32,100,101,108,101,116,101,32,112,111,108,105,99,121]),{contentType:'application/pdf'});
      if (uploadError) throw new Error('fixture upload failed: ' + uploadError.message + ' (status ' + uploadError.statusCode + ')');
      const { data: doc, error: insertError } = await admin.from('documents').insert({
        firm_id:firmId, client_id:clientRow.id, name:tag+'_'+user.role+'.pdf', file_path:filePath,
        mime:'application/pdf', size:36, uploaded_by:profiles[user.role].id,
      }).select('id').single();
      if (insertError) throw new Error('fixture row insert failed');
      ids.push(doc.id);
    }
    for (const user of users) {
      const client = clients.get(user.role), index = users.findIndex(u=>u.role===user.role);
      const { error: storageError } = await client.storage.from('documents').remove([paths[index]]);
      const { data: deleted, error: rowError } = await client.from('documents').delete({count:'exact'}).eq('id',ids[index]).select('id');
      const { data: remaining, error: checkError } = await admin.from('documents').select('id').eq('id',ids[index]).maybeSingle();
      if (rowError || checkError) throw new Error(user.role+' delete verification query failed');
      const folder = paths[index].split('/')[0], fileName = paths[index].split('/')[1];
      const { data: listed, error: listError } = await admin.storage.from('documents').list(folder,{search:fileName});
      if (listError) throw new Error('storage state verification failed');
      const objectRemains = (listed??[]).some(item=>item.name===fileName);
      const storageOk = !objectRemains, rowOk = (deleted?.length??0)===1 && !remaining;
      console.log(user.role.toUpperCase()+'_STORAGE_DELETE '+(storageOk?'SUCCEEDED':'DENIED')+' (remaining='+(objectRemains?1:0)+')');
      console.log(user.role.toUpperCase()+'_DOCUMENT_ROW_DELETE '+(rowOk?'SUCCEEDED':'DENIED')+' (affected='+(deleted?.length??0)+', remaining='+(remaining?1:0)+')');
      const expected = user.role !== 'clerk';
      if (storageOk !== expected) errors.push(user.role+' storage mismatch');
      if (rowOk !== expected) errors.push(user.role+' row mismatch');
    }
  } finally {
    if (paths.length) await admin.storage.from('documents').remove(paths);
    if (ids.length) await admin.from('documents').delete().in('id',ids);
    const { data: remaining } = paths.length ? await admin.from('documents').select('id').in('file_path',paths) : {data:[]};
    const fixtureFolder = paths[0]?.split('/')[0];
    const { data: leftovers } = fixtureFolder ? await admin.storage.from('documents').list(fixtureFolder,{search:'DELETE_POLICY_VERIFY_'}) : {data:[]};
    console.log('CLEANUP_REMAINING_DOCUMENT_ROWS '+(remaining?.length??0));
    console.log('CLEANUP_REMAINING_STORAGE_OBJECTS '+(leftovers??[]).filter(item=>item.name.includes('DELETE_POLICY_VERIFY_')).length);
    for (const client of clients.values()) await client.auth.signOut();
  }
  if (errors.length) { console.log('DOCUMENT_DELETE_POLICY_FAIL '+errors.join('; ')); process.exitCode=1; }
  else console.log('DOCUMENT_DELETE_POLICY_MATCHES_RULE clerk=denied lawyer=allowed admin=allowed');
}
main().catch(error=>{ console.error('DOCUMENT_DELETE_VERIFY_ERROR '+error.message); process.exitCode=1; });
