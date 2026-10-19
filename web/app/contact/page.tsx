"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function ContactPage() {
  const [phone, setPhone] = useState("");
  useEffect(() => {
    (supabase as any).from("app_settings").select("value").eq("key", "whatsapp_number").single().then(({ data }: any) => setPhone((data?.value as string) || ""));
  }, []);
  const num = phone.replace(/[^0-9]/g, "");
  return (
    <main className="min-h-dvh bg-offwhite px-6 py-12 max-w-3xl mx-auto">
      <h1 className="text-2xl font-heading font-bold">Contact</h1>
      <p className="mt-4 text-muted">WhatsApp:</p>
      <a href={`https://wa.me/${num}`} className="btn-primary mt-2 inline-block">Chat on WhatsApp</a>
    </main>
  );
}

