import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const envPath = path.resolve(repoRoot, 'web/.env.local');
const projectRef = 'zxxpsvhlekemgccrcwtg';
const roles = ['clerk', 'lawyer', 'admin'];
const tag = `DELETE_POLICY_VERIFY_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

function parseEnv(source) {
  return Object.fromEntries(source.split(/\r?\n/).flatMap(line => {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    return match ? [[match[1], match[2].replace(/^(['"])(.*)\1$/, '$2')]] : [];
  }));
}

function resultLine(label, allowed, detail) {
  console.log(`${label} ${allowed ? 'SUCCEEDED' : 'DENIED'} (${detail})`);
}

async function main() {
  const env = parseEnv(await fs.readFile(envPath, 'utf8'));
  if (env.SUPABASE_PROJECT_REF !== projectRef || !env.NEXT_PUBLIC_SUPABASE_URL?.includes(projectRef)) {
    throw new Error('wrong project configured');
  }
  const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!anonKey || !env.SUPABASE_SERVICE_ROLE_KEY) throw new Error('required Supabase keys are missing');

  const users = new Map();
  const fixturePaths = [];
  const fixtureIds = [];
  const errors = [];
  let tempFirmId;
  let tempUserId;
  let tempEmail;

  try {
    const profiles = {};
    for (const role of roles) {
      const email = `${role}@mzm.pk`;
      const password = process.env[`VERIFY_${role.toUpperCase()}_PASSWORD`];
      if (!password) throw new Error(`VERIFY_${role.toUpperCase()}_PASSWORD is required`);
      const client = createClient(env.NEXT_PUBLIC_SUPABASE_URL, anonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      users.set(role, client);
      const { data, error } = await client.auth.signInWithPassword({ email, password });
      if (error || !data.user) throw new Error(`${role} JWT login failed`);
      const { data: profile, error: profileError } = await admin.from('profiles')
        .select('id,firm_id,role').eq('id', data.user.id).single();
      if (profileError || profile.role !== role) throw new Error(`${role} profile verification failed`);
      profiles[role] = profile;
    }

    const firstFirmId = profiles.admin.firm_id;
    if (profiles.clerk.firm_id !== firstFirmId || profiles.lawyer.firm_id !== firstFirmId) {
      throw new Error('demo clerk/lawyer/admin are not in the same firm');
    }
    const { data: clientRow, error: clientError } = await admin.from('clients')
      .select('id').eq('firm_id', firstFirmId).limit(1).single();
    if (clientError) throw new Error('no fixture client in target firm');

    const { data: firm, error: firmError } = await admin.from('firms').insert({
      name: `${tag} second firm`, subscription_status: 'active',
    }).select('id').single();
    if (firmError) throw new Error('temporary second firm creation failed');
    tempFirmId = firm.id;

    tempEmail = `${tag.toLowerCase()}@example.invalid`;
    const tempPassword = crypto.randomBytes(32).toString('base64url');
    const { data: newUser, error: userError } = await admin.auth.admin.createUser({
      email: tempEmail,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { full_name: `${tag} lawyer`, firm_id: tempFirmId, role: 'lawyer' },
    });
    if (userError || !newUser.user) throw new Error('temporary second-firm lawyer creation failed');
    tempUserId = newUser.user.id;
    const { data: secondProfile, error: secondProfileError } = await admin.from('profiles')
      .select('id,firm_id,role').eq('id', tempUserId).single();
    if (secondProfileError || secondProfile.firm_id !== tempFirmId || secondProfile.role !== 'lawyer') {
      throw new Error('temporary second-firm lawyer profile verification failed');
    }
    const crossFirm = createClient(env.NEXT_PUBLIC_SUPABASE_URL, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { error: secondLoginError } = await crossFirm.auth.signInWithPassword({ email: tempEmail, password: tempPassword });
    if (secondLoginError) throw new Error('temporary second-firm lawyer JWT login failed');
    users.set('second_firm_lawyer', crossFirm);

    const fixtures = {};
    for (const role of roles) {
      const filePath = `${firstFirmId}/${tag}_${role}.pdf`;
      fixturePaths.push(filePath);
      const { error: uploadError } = await admin.storage.from('documents').upload(
        filePath, Buffer.from('%PDF-1.4\n% temporary delete verification\n'), { contentType: 'application/pdf' },
      );
      if (uploadError) throw new Error(`${role} fixture upload failed`);
      const { data: doc, error: insertError } = await admin.from('documents').insert({
        firm_id: firstFirmId, client_id: clientRow.id, name: `${tag}_${role}.pdf`, file_path: filePath,
        mime: 'application/pdf', size: 37, uploaded_by: profiles[role].id,
      }).select('id').single();
      if (insertError) throw new Error(`${role} fixture row creation failed`);
      fixtureIds.push(doc.id);
      fixtures[role] = { filePath, id: doc.id };
    }

    for (const role of roles) {
      const client = users.get(role);
      const fixture = fixtures[role];
      const { error: storageError } = await client.storage.from('documents').remove([fixture.filePath]);
      const { data: deleted, error: rowError } = await client.from('documents').delete({ count: 'exact' })
        .eq('id', fixture.id).select('id');
      const { data: remaining, error: checkError } = await admin.from('documents')
        .select('id').eq('id', fixture.id).maybeSingle();
      const { data: listed, error: listError } = await admin.storage.from('documents')
        .list(firstFirmId, { search: `${tag}_${role}.pdf` });
      if (rowError || checkError || listError) throw new Error(`${role} delete verification query failed`);
      const storageRemains = (listed ?? []).some(item => item.name === `${tag}_${role}.pdf`);
      const storageAllowed = !storageRemains;
      const rowAllowed = (deleted ?? []).length === 1 && !remaining;
      resultLine(`${role.toUpperCase()}_STORAGE_DELETE`, storageAllowed,
        `remaining=${storageRemains ? 1 : 0}${storageError ? ', storage_error=RLS-filtered-or-denied' : ''}`);
      resultLine(`${role.toUpperCase()}_DOCUMENT_ROW_DELETE`, rowAllowed,
        `affected=${(deleted ?? []).length}, remaining=${remaining ? 1 : 0}`);
      const expected = role !== 'clerk';
      if (storageAllowed !== expected) errors.push(`${role} storage mismatch`);
      if (rowAllowed !== expected) errors.push(`${role} row mismatch`);
    }

    const targetPath = `${firstFirmId}/${tag}_cross_target.pdf`;
    fixturePaths.push(targetPath);
    const { error: targetUploadError } = await admin.storage.from('documents').upload(
      targetPath, Buffer.from('%PDF-1.4\n% cross-firm delete target\n'), { contentType: 'application/pdf' },
    );
    if (targetUploadError) throw new Error('cross-firm target upload failed');
    const { data: targetRow, error: targetInsertError } = await admin.from('documents').insert({
      firm_id: firstFirmId, client_id: clientRow.id, name: `${tag}_cross_target.pdf`, file_path: targetPath,
      mime: 'application/pdf', size: 33, uploaded_by: profiles.lawyer.id,
    }).select('id').single();
    if (targetInsertError) throw new Error('cross-firm target row creation failed');
    fixtureIds.push(targetRow.id);
    const target = { filePath: targetPath, id: targetRow.id };
    const secondFirmClient = users.get('second_firm_lawyer');
    const { error: crossStorageError } = await secondFirmClient.storage.from('documents').remove([target.filePath]);
    const { data: crossDeleted, error: crossRowError } = await secondFirmClient.from('documents')
      .delete({ count: 'exact' }).eq('id', target.id).select('id');
    const { data: targetRemaining, error: targetCheckError } = await admin.from('documents')
      .select('id').eq('id', target.id).maybeSingle();
    const { data: targetObjects, error: targetListError } = await admin.storage.from('documents')
      .list(firstFirmId, { search: `${tag}_cross_target.pdf` });
    if (crossRowError || targetCheckError || targetListError) throw new Error('cross-firm verification query failed');
    const targetObjectRemains = (targetObjects ?? []).some(item => item.name === `${tag}_cross_target.pdf`);
    const crossStorageDenied = !!targetObjectRemains;
    const crossRowDenied = (crossDeleted ?? []).length === 0 && !!targetRemaining;
    resultLine('SECOND_FIRM_LAWYER_STORAGE_DELETE', !crossStorageDenied,
      `target_remains=${targetObjectRemains ? 1 : 0}${crossStorageError ? ', storage_error=RLS-filtered-or-denied' : ''}`);
    resultLine('SECOND_FIRM_LAWYER_DOCUMENT_ROW_DELETE', !crossRowDenied,
      `affected=${(crossDeleted ?? []).length}, target_remains=${targetRemaining ? 1 : 0}`);
    if (!crossStorageDenied || !crossRowDenied) errors.push('cross-firm lawyer was able to delete first-firm document');
  } finally {
    if (fixturePaths.length) await admin.storage.from('documents').remove(fixturePaths);
    if (fixtureIds.length) await admin.from('documents').delete().in('id', fixtureIds);

    if (tempUserId) {
      const { error } = await admin.auth.admin.deleteUser(tempUserId);
      if (error) errors.push('temporary user cleanup failed');
    }
    if (tempFirmId) {
      const { error } = await admin.from('firms').delete().eq('id', tempFirmId);
      if (error) errors.push('temporary firm cleanup failed');
    }

    const { data: remainingRows } = fixtureIds.length
      ? await admin.from('documents').select('id').in('id', fixtureIds) : { data: [] };
    let remainingObjects = 0;
    if (fixturePaths.length) {
      const firmFolder = fixturePaths[0].split('/')[0];
      const { data: items } = await admin.storage.from('documents').list(firmFolder, { search: tag });
      remainingObjects = (items ?? []).filter(item => item.name.includes(tag)).length;
    }
    const { data: remainingFirm } = tempFirmId
      ? await admin.from('firms').select('id').eq('id', tempFirmId).maybeSingle() : { data: null };
    const { data: remainingProfile } = tempUserId
      ? await admin.from('profiles').select('id').eq('id', tempUserId).maybeSingle() : { data: null };
    let remainingUser = false;
    if (tempUserId) {
      const { data } = await admin.auth.admin.getUserById(tempUserId);
      remainingUser = !!data?.user;
    }
    console.log(`CLEANUP_REMAINING_DOCUMENT_ROWS ${remainingRows?.length ?? 0}`);
    console.log(`CLEANUP_REMAINING_STORAGE_OBJECTS ${remainingObjects}`);
    console.log(`TEMP_FIRM_REMOVED ${remainingFirm ? 'NO' : 'YES'}`);
    console.log(`TEMP_USER_REMOVED ${remainingUser || remainingProfile ? 'NO' : 'YES'}`);
    for (const client of users.values()) await client.auth.signOut();
  }

  if (errors.length) {
    console.log(`DOCUMENT_DELETE_POLICY_FAIL ${errors.join('; ')}`);
    process.exitCode = 1;
  } else {
    console.log('DOCUMENT_DELETE_POLICY_MATCHES_RULE clerk=denied lawyer=allowed admin=allowed second_firm_lawyer=denied');
  }
}

main().catch(error => {
  console.error(`DOCUMENT_DELETE_VERIFY_ERROR ${error.message}`);
  process.exitCode = 1;
});
