import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });

    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    // caller profile
    const { data: profile } = await admin.from("profiles").select("firm_id, is_owner, role").eq("id", user.id).single();
    if (!profile || !profile.is_owner) {
      return new Response(JSON.stringify({ error: "Only firm owner can add members" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const body = await req.json();
    const { email, full_name, role, temp_password } = body;
    if (!email || !full_name || !role || !temp_password) {
      return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (!["lawyer", "clerk"].includes(role)) {
      return new Response(JSON.stringify({ error: "Invalid role" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (temp_password.length < 8) {
      return new Response(JSON.stringify({ error: "Weak password" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // active access check
    const { data: access } = await admin.rpc("has_active_access", { p_firm_id: profile.firm_id });
    if (!access) {
      return new Response(JSON.stringify({ error: "Firm has no active access" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // seat limit
    const { data: used } = await admin.rpc("seats_used", { p_firm_id: profile.firm_id });
    const { data: limit } = await admin.rpc("seat_limit", { p_firm_id: profile.firm_id });
    if (used >= limit) {
      return new Response(JSON.stringify({ error: "Seat limit reached" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // email unique
    const { data: existing } = await admin.from("profiles").select("id").eq("email", email).maybeSingle();
    if (existing) {
      return new Response(JSON.stringify({ error: "Email already in use" }), { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // create auth user
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      password: temp_password,
      email_confirm: true,
      user_metadata: { full_name, firm_id: profile.firm_id, role, is_owner: false },
    });
    if (createErr) {
      return new Response(JSON.stringify({ error: createErr.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // profile
    await admin.from("profiles").insert({
      id: created.user.id,
      firm_id: profile.firm_id,
      full_name,
      email,
      role,
      is_owner: false,
      must_change_password: true,
      is_active: true,
    });

    // revoke devices? not needed

    return new Response(JSON.stringify({ user_id: created.user.id, temp_password }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
