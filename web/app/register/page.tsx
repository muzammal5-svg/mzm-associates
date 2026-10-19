"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firmName, setFirmName] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { data, error: signUpErr } = await supabase.auth.signUp({ email, password });
    if (signUpErr) { setError(signUpErr.message); setLoading(false); return; }
    const userId = data.user?.id;
    if (!userId) { setError("Check your email to confirm, then sign in."); setLoading(false); return; }
    const { error: rpcErr } = await (supabase as any).rpc("register_firm", { p_firm_name: firmName, p_full_name: fullName, p_phone: phone });
    if (rpcErr) { setError(rpcErr.message); setLoading(false); return; }
    router.replace("/");
  }

  return (
    <main className="min-h-dvh bg-offwhite flex items-center justify-center px-4">
      <form onSubmit={submit} className="card w-full max-w-md space-y-4">
        <h1 className="text-2xl font-heading font-bold">Register</h1>
        {error && <p className="text-danger text-sm">{error}</p>}
        <Input label="Email" type="email" value={email} onChange={(e:any)=>setEmail(e.target.value)} required />
        <Input label="Password" type="password" value={password} onChange={(e:any)=>setPassword(e.target.value)} required />
        <Input label="Firm name" value={firmName} onChange={(e:any)=>setFirmName(e.target.value)} required />
        <Input label="Full name" value={fullName} onChange={(e:any)=>setFullName(e.target.value)} required />
        <Input label="Phone" type="tel" value={phone} onChange={(e:any)=>setPhone(e.target.value)} />
        <Button type="submit" loading={loading} className="w-full">Register</Button>
        <p className="text-sm text-muted">Already have an account? <a href="/auth/sign-in" className="text-gold">Sign in</a></p>
      </form>
    </main>
  );
}
