export interface PaymentProvider {
  code: string;
  createPayment(input: { planId: string; amount: number; method: string }): Promise<{ reference: string }>;
  verifyPayment(reference: string): Promise<{ status: "pending" | "verified" | "rejected" }>;
}

export class ManualProvider implements PaymentProvider {
  code = "manual";
  async createPayment(input: { planId: string; amount: number; method: string }) { return { reference: `MAN-${Date.now()}` }; }
  async verifyPayment(reference: string) { return { status: "pending" as const }; }
}

export class GatewayProvider implements PaymentProvider {
  code = "gateway";
  async createPayment(input: { planId: string; amount: number; method: string }): Promise<{ reference: string }> { throw new Error("Gateway not implemented (Phase B)"); }
  async verifyPayment(reference: string): Promise<{ status: "pending" | "verified" | "rejected" }> { throw new Error("Gateway not implemented (Phase B)"); }
}
