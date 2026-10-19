import { supabase } from "@/lib/supabase/client";

export async function registerDevice(deviceId: string, label: string) {
  const { data: { session } } = await supabase.auth.getSession();
  return (supabase as any).rpc("register_device", { p_device_id: deviceId, p_label: label, p_session_id: session?.access_token ?? null });
}

export async function checkDevice(deviceId: string) {
  return (supabase as any).rpc("check_device_valid", { p_device_id: deviceId });
}
