"use client";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import { useSubscriptionAccess } from "@/hooks/useSubscriptionAccess";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function MembersPage() {
  const { profile } = useAuth();
  const { state } = useSubscriptionAccess();
  const [members, setMembers] = useState<any[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("lawyer");
  const [tempPw, setTempPw] = useState("");
  const [msg, setMsg] = useState("");

  const isOwner = (profile as any)?.is_owner === true;

  const load = useCallback(async () => {
    const { data } = await (supabase as any).from("profiles").select("*").eq("firm_id", profile?.firm_id);
    setMembers(data ?? []);
    const { data: d } = await (supabase as any).from("user_devices").select("*").eq("firm_id", profile?.firm_id);
    setDevices(d ?? []);
    setDevices(d ?? []);
  }, [profile?.firm_id]);

  async function addMember(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    setTempPw("");
    const password = Math.random().toString(36).slice(-10) + "A1!";
    const { data, error } = await (supabase as any).functions.invoke("create-member", {
      body: { email, full_name: fullName, role, temp_password: password },
    });
    if (error) { setMsg(error.message); return; }
    setTempPw(data?.temp_password ?? password);
    setEmail(""); setFullName("");
    load();
  }

  async function removeMember(id: string) {
    await (supabase as any).rpc("remove_member", { p_user_id: id });
    load();
  }

  async function revokeDevice(id: string) {
    await (supabase as any).rpc("revoke_device", { p_device_id: id });
    load();
  }

  if (!isOwner) {
    return <main className="min-h-dvh bg-offwhite px-6 py-12"><h1 className="text-2xl font-heading font-bold">Members</h1><p className="text-muted mt-2">Owner only.</p></main>;
  }

  const used = state?.seats_used ?? members.length;
  const max = state?.seats_max ?? 5;

  return (
    <main className="min-h-dvh bg-offwhite px-6 py-12 max-w-3xl mx-auto">
      <h1 className="text-2xl font-heading font-bold">Members</h1>
      <div className="card mt-4">
        <p>Seats: {used}/{max}</p>
        <div className="h-2 bg-navy-100 rounded mt-2"><div className="h-2 bg-gold rounded" style={{ width: `${(used/max)*100}%` }} /></div>
      </div>

      <form onSubmit={addMember} className="card mt-6 space-y-3">
        <h2 className="font-semibold">Add member</h2>
        <Input label="Email" type="email" value={email} onChange={(e:any)=>setEmail(e.target.value)} required />
        <Input label="Full name" value={fullName} onChange={(e:any)=>setFullName(e.target.value)} required />
        <select className="input" value={role} onChange={(e)=>setRole(e.target.value)}>
          <option value="lawyer">Lawyer</option>
          <option value="clerk">Clerk</option>
        </select>
        {msg && <p className="text-sm text-danger">{msg}</p>}
        {tempPw && <p className="text-sm text-success">Temp password: {tempPw} (copy now)</p>}
        <Button type="submit" className="w-full">Add member</Button>
      </form>

      <div className="card mt-6">
        <h2 className="font-semibold">Members</h2>
        {members.map((m) => (
          <div key={m.id} className="flex items-center justify-between py-2 border-b border-border">
            <span>{m.full_name} ({m.role}) {m.must_change_password ? "· must change password" : ""}</span>
            {m.id !== profile?.id && <Button size="xs" variant="danger" onClick={() => removeMember(m.id)}>Remove</Button>}
          </div>
        ))}
      </div>

      <div className="card mt-6">
        <h2 className="font-semibold">Devices</h2>
        {devices.map((d) => (
          <div key={d.id} className="flex items-center justify-between py-2 border-b border-border">
            <span>{d.device_label} {d.revoked_at ? "(revoked)" : ""}</span>
            {!d.revoked_at && <Button size="xs" onClick={() => revokeDevice(d.id)}>Revoke</Button>}
          </div>
        ))}
      </div>
    </main>
  );
}


