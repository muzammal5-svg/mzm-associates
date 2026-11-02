import { supabase } from "./client";
import type {
  Plan,
  Subscription,
  Payment,
  PaymentAccount,
  UserDevice,
  AppSetting,
  BillingEvent,
  PaymentMethod,
} from "@/types/saas";

export const saasDb = {
  plans: () => supabase.from("plans" as any),
  subscriptions: () => supabase.from("subscriptions" as any),
  payments: () => supabase.from("payments" as any),
  paymentAccounts: () => supabase.from("payment_accounts" as any),
  userDevices: () => supabase.from("user_devices" as any),
  appSettings: () => supabase.from("app_settings" as any),
  billingEvents: () => supabase.from("billing_events" as any),
};

export const saasRpc = {
  async registerFirm(
    firmName: string,
    fullName: string,
    phone: string,
    locationData?: {
      city?: string;
      district?: string;
      tehsil?: string;
      location?: string;
      province?: string;
    }
  ) {
    const { city, district, tehsil, location, province } = locationData ?? {};
    let res = await (supabase as any).rpc("register_firm", {
      p_firm_name: firmName,
      p_full_name: fullName,
      p_phone: phone,
      p_city: city || null,
      p_district: district || null,
      p_tehsil: tehsil || null,
      p_location: location || null,
      p_province: province || null,
    });

    // Fallback if older RPC signature is encountered
    if (res.error && res.error.message && res.error.message.includes("function public.register_firm")) {
      res = await (supabase as any).rpc("register_firm", {
        p_firm_name: firmName,
        p_full_name: fullName,
        p_phone: phone,
      });
    }

    // Ensure firm record is updated if firm was created
    if (!res.error && res.data?.firm_id && (city || district || tehsil || location || province)) {
      try {
        await supabase
          .from("firms")
          .update({
            city: city || null,
            district: district || null,
            tehsil: tehsil || null,
            location: location || null,
            province: province || null,
          } as any)
          .eq("id", res.data.firm_id);
      } catch (e) {
        console.warn("[saasRpc.registerFirm] firm update error:", e);
      }
    }

    return res;
  },

  async submitPayment(params: {
    planId: string;
    method: PaymentMethod;
    referenceNo: string;
    slipPath: string | null;
    amount: number;
  }) {
    return (supabase as any).rpc("submit_payment", {
      p_plan_id: params.planId,
      p_method: params.method,
      p_reference_no: params.referenceNo,
      p_slip_path: params.slipPath,
      p_amount: params.amount,
    });
  },

  async verifyPayment(paymentId: string, approve: boolean, note?: string) {
    return (supabase as any).rpc("verify_payment", {
      p_payment_id: paymentId,
      p_approve: approve,
      p_note: note ?? null,
    });
  },

  async adminExtendSubscription(firmId: string, days: number = 30) {
    return (supabase as any).rpc("admin_extend_subscription", {
      p_firm_id: firmId,
      p_days: days,
    });
  },

  async adminSuspendFirm(firmId: string, note?: string) {
    return (supabase as any).rpc("admin_suspend_firm", {
      p_firm_id: firmId,
      p_note: note ?? "Suspended by administrator",
    });
  },

  async adminReactivateFirm(firmId: string) {
    return (supabase as any).rpc("admin_reactivate_firm", {
      p_firm_id: firmId,
    });
  },

  async removeMember(userId: string) {
    return (supabase as any).rpc("remove_member", {
      p_user_id: userId,
    });
  },

  async registerDevice(deviceId: string, label: string, sessionId?: string | null) {
    return (supabase as any).rpc("register_device", {
      p_device_id: deviceId,
      p_label: label,
      p_session_id: sessionId ?? null,
    });
  },

  async revokeDevice(deviceId: string) {
    return (supabase as any).rpc("revoke_device", {
      p_device_id: deviceId,
    });
  },

  async checkDeviceValid(deviceId: string) {
    return (supabase as any).rpc("check_device_valid", {
      p_device_id: deviceId,
    });
  },

  async getSubscriptionState() {
    return (supabase as any).rpc("get_subscription_state");
  },

  async deleteOwnAccount() {
    return (supabase as any).rpc("delete_own_account");
  },
};
