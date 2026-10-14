"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { db, update, insert, supabaseRaw } from "@/lib/supabase/client";
import { normalisePhone } from "@/lib/phone";
import type { Client } from "@/types/supabase";

// ─── List / search ────────────────────────────────────────────────────────────

export interface ClientsFilter {
  search?:    string;   // name / CNIC / phone
  isActive?:  boolean | null; // null = all
  page?:      number;
  pageSize?:  number;
}

const DEFAULT_PAGE_SIZE = 20;

export function useClients(filter: ClientsFilter = {}) {
  const { search = "", isActive = null, page = 1, pageSize = DEFAULT_PAGE_SIZE } = filter;
  const from = (page - 1) * pageSize;
  const to   = from + pageSize - 1;

  return useQuery({
    queryKey: ["clients", search, isActive, page, pageSize],
    queryFn: async () => {
      let q = db.clients()
        .select("*", { count: "exact" })
        .order("full_name", { ascending: true })
        .range(from, to);

      if (isActive !== null) q = q.eq("is_active", isActive);

      if (search.trim()) {
        // pg_trgm via ilike; searches name, CNIC, phone
        const s = `%${search.trim()}%`;
        q = q.or(
          `full_name.ilike.${s},cnic.ilike.${s},phone.ilike.${s},whatsapp.ilike.${s}`
        );
      }

      const { data, error, count } = await q;
      if (error) throw error;
      return {
        clients:   (data as Client[]) ?? [],
        total:     count ?? 0,
        page,
        pageSize,
        totalPages: Math.ceil((count ?? 0) / pageSize),
      };
    },
    staleTime: 1000 * 60,
    placeholderData: (prev) => prev,
  });
}

// ─── Single client ────────────────────────────────────────────────────────────

export function useClient(id: string | null) {
  return useQuery({
    queryKey: ["client", id],
    queryFn: async () => {
      const { data, error } = await db.clients()
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data as Client;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });
}

// ─── Case counts for a client ─────────────────────────────────────────────────

export function useClientCaseCounts(clientId: string | null) {
  return useQuery({
    queryKey: ["client-case-counts", clientId],
    queryFn: async () => {
      const [running, decided] = await Promise.all([
        db.cases()
          .select("id", { count: "exact", head: true })
          .eq("client_id", clientId!)
          .eq("status", "running"),
        db.cases()
          .select("id", { count: "exact", head: true })
          .eq("client_id", clientId!)
          .eq("status", "decided"),
      ]);
      if (running.error) throw running.error;
      if (decided.error) throw decided.error;
      return {
        running: running.count ?? 0,
        decided: decided.count ?? 0,
        total:   (running.count ?? 0) + (decided.count ?? 0),
      };
    },
    enabled: !!clientId,
    staleTime: 1000 * 60 * 5,
  });
}

// ─── Duplicate check ──────────────────────────────────────────────────────────

export interface DuplicateCheckResult {
  cnicMatch:  Client | null;
  phoneMatch: Client | null;
}

export async function checkDuplicates(
  cnic: string,
  phone: string,
  excludeId?: string
): Promise<DuplicateCheckResult> {
  const result: DuplicateCheckResult = { cnicMatch: null, phoneMatch: null };
  const normalPhone = normalisePhone(phone);

  const [cnicCheck, phoneCheck] = await Promise.all([
    cnic
      ? db.clients().select("*").eq("cnic", cnic).neq("id", excludeId ?? "00000000-0000-0000-0000-000000000000").limit(1)
      : Promise.resolve({ data: null, error: null }),
    normalPhone
      ? db.clients().select("*").or(`phone.eq.${normalPhone},whatsapp.eq.${normalPhone}`).neq("id", excludeId ?? "00000000-0000-0000-0000-000000000000").limit(1)
      : Promise.resolve({ data: null, error: null }),
  ]);
  if (cnicCheck.error) throw cnicCheck.error;
  if (phoneCheck.error) throw phoneCheck.error;

  result.cnicMatch  = cnicCheck.data?.[0] ?? null;
  result.phoneMatch = phoneCheck.data?.[0] ?? null;
  return result;
}

// ─── Create / update / deactivate mutations ───────────────────────────────────

export type ClientPayload = Omit<Client,
  "id" | "created_at" | "updated_at"
>;

export function useCreateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Omit<ClientPayload, "is_active">) => {
      const { data, error } = await insert.client({ ...payload, is_active: true });
      if (error) throw error;
      return data as import("@/types/supabase").Client;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clients"] });
      qc.invalidateQueries({ queryKey: ["dashboard-counts"] });
    },
  });
}

export function useUpdateClient(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<ClientPayload>) => {
      const { error } = await update.client(id, payload as Record<string, unknown>);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clients"] });
      qc.invalidateQueries({ queryKey: ["client", id] });
    },
  });
}

export function useToggleClientActive(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (isActive: boolean) => {
      const { error } = await update.client(id, { is_active: isActive });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clients"] });
      qc.invalidateQueries({ queryKey: ["client", id] });
    },
  });
}
