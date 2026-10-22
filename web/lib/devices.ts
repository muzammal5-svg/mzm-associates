import { supabase } from "@/lib/supabase/client";
import { saasRpc } from "@/lib/supabase/saas";

export async function registerDevice(deviceId: string, label: string) {
  const { data: { session } } = await supabase.auth.getSession();
  return saasRpc.registerDevice(deviceId, label, session?.access_token ?? null);
}

export async function checkDevice(deviceId: string) {
  return saasRpc.checkDeviceValid(deviceId);
}
