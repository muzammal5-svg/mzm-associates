export type PaymentMethod = "bank_transfer" | "jazzcash" | "easypaisa" | "card" | "other";
export type PaymentStatus = "pending" | "verified" | "rejected";
export type SubStatus = "trialing" | "pending" | "active" | "grace" | "expired" | "suspended" | "cancelled";

export interface Plan {
  id: string;
  code: string;
  name: string;
  duration_months: number;
  price_pkr: number;
  max_users: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  firm_id: string;
  plan_id: string | null;
  status: SubStatus;
  starts_at: string;
  ends_at: string;
  grace_until: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  firm_id: string;
  subscription_id: string | null;
  plan_id: string;
  amount_pkr: number;
  method: PaymentMethod;
  reference_no: string;
  slip_path: string | null;
  status: PaymentStatus;
  note: string | null;
  submitted_by: string | null;
  verified_by: string | null;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentAccount {
  id: string;
  method: PaymentMethod;
  account_title: string;
  account_number: string;
  bank_name: string | null;
  instructions: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface UserDevice {
  id: string;
  user_id: string;
  firm_id: string;
  device_id: string;
  label: string | null;
  session_id: string | null;
  last_active_at: string;
  revoked_at: string | null;
  created_at: string;
}

export interface AppSetting {
  key: string;
  value: any;
  updated_at: string;
}

export interface BillingEvent {
  id: string;
  firm_id: string;
  event_type: string;
  payload: Record<string, any>;
  created_at: string;
}
