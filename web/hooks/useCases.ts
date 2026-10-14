"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { db, insert, update, supabaseRaw } from "@/lib/supabase/client";
import { todayKarachi } from "@/lib/utils";
import type { Case, CaseStatus, CaseOutcome, CaseNote } from "@/types/supabase";

// ─── List / filter ────────────────────────────────────────────────────────────

export interface CasesFilter {
  status?:   CaseStatus | "all";
  search?:   string;
  clientId?: string;
  caseId?:   string;
  outcome?:  CaseOutcome | "";
  decisionYear?: string;
  caseTypeId?: string;
  courtNo?:  string;
  page?:     number;
  pageSize?: number;
}

const PAGE_SIZE = 20;

export function useCases(filter: CasesFilter = {}) {
  const {
    status = "all", search = "", clientId, caseId, outcome = "",
    decisionYear = "", caseTypeId, courtNo = "", page = 1, pageSize = PAGE_SIZE,
  } = filter;
  const from = (page - 1) * pageSize;
  const to   = from + pageSize - 1;

  return useQuery({
    queryKey: ["cases", status, search, clientId, caseId, outcome, decisionYear, caseTypeId, courtNo, page, pageSize],
    queryFn: async () => {
      let q = db.cases()
        .select(
          "*, case_type:case_types(id,name,requires_offence), client:clients(id,full_name,phone)",
          { count: "exact" }
        )
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (status !== "all") q = q.eq("status", status);
      if (clientId)          q = q.eq("client_id", clientId);
      if (caseId)            q = q.eq("id", caseId);
      if (outcome)           q = q.eq("outcome", outcome);
      if (decisionYear) {
        const nextYear = String(Number(decisionYear) + 1);
        q = q.gte("decision_date", `${decisionYear}-01-01`).lt("decision_date", `${nextYear}-01-01`);
      }
      if (caseTypeId)        q = q.eq("case_type_id", caseTypeId);
      if (courtNo.trim())    q = q.ilike("court_no", `%${courtNo.trim()}%`);
      if (search.trim()) {
        const s = `%${search.trim()}%`;
        q = q.or(
          `case_ref_no.ilike.${s},plaintiff_name.ilike.${s},defendant_name.ilike.${s}`
        );
      }

      const { data, error, count } = await q;
      if (error) throw error;
      return {
        cases:      (data as Case[]) ?? [],
        total:      count ?? 0,
        page,
        pageSize,
        totalPages: Math.ceil((count ?? 0) / pageSize),
      };
    },
    staleTime: 1000 * 60,
    placeholderData: prev => prev,
  });
}

// ─── Single case ─────────────────────────────────────────────────────────────

export function useCase(id: string | null) {
  return useQuery({
    queryKey: ["case", id],
    queryFn: async () => {
      const { data, error } = await db.cases()
        .select(`
          *,
          case_type:case_types(id,name,requires_offence),
          client:clients(id,full_name,phone,cnic,city),
          assigned_lawyer:profiles!cases_assigned_to_fkey(id,full_name,role)
        `)
        .eq("id", id!)
        .is("deleted_at", null)
        .single();
      if (error) throw error;
      return data as Case;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });
}

// ─── Hearings for a case ──────────────────────────────────────────────────────

export function useCaseHearings(caseId: string | null) {
  return useQuery({
    queryKey: ["case-hearings", caseId],
    queryFn: async () => {
      const { data, error } = await db.hearings()
        .select("*")
        .eq("case_id", caseId!)
        .order("hearing_date", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!caseId,
    staleTime: 1000 * 60 * 2,
  });
}

// ─── Case notes ───────────────────────────────────────────────────────────────

export function useCaseNotes(caseId: string | null) {
  return useQuery({
    queryKey: ["case-notes", caseId],
    queryFn: async () => {
      const { data, error } = await db.caseNotes()
        .select("*, author:profiles(full_name)")
        .eq("case_id", caseId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as CaseNote[]) ?? [];
    },
    enabled: !!caseId,
    staleTime: 1000 * 60,
  });
}

// ─── Duplicate ref_no check ───────────────────────────────────────────────────

export async function checkDuplicateRefNo(
  refNo: string,
  excludeId?: string
): Promise<Case | null> {
  const q = supabaseRaw
    .from("cases")
    .select("id,case_ref_no,plaintiff_name,defendant_name")
    .eq("case_ref_no", refNo.trim())
    .is("deleted_at", null)
    .limit(1);
  if (excludeId) q.neq("id", excludeId);
  const { data, error } = await q;
  if (error) throw error;
  return (data as Case[])?.[0] ?? null;
}

// ─── Create case + first hearing ─────────────────────────────────────────────

export interface NewCasePayload {
  firm_id:        string;
  client_id:      string;
  case_ref_no:    string;
  plaintiff_name: string;
  defendant_name: string;
  representing:   "plaintiff" | "defendant";
  judge_name?:    string;
  court_no?:      string;
  case_type_id:   string;
  offence?:       string;
  description?:   string;
  assigned_to?:   string;
  created_by:     string;
  // First hearing
  first_hearing?: {
    serial_no?:        string;
    next_date?:        string;
    next_proceeding?:  string;
    hearing_date?:     string;
  };
}

export function useCreateCase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: NewCasePayload) => {
      const { first_hearing, ...caseData } = payload;
      const { data, error } = await supabaseRaw.rpc("create_case_with_first_hearing", {
        p_case: caseData,
        p_first_hearing: first_hearing ?? null,
      });
      if (error) throw error;
      return data as Case;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cases"] });
      qc.invalidateQueries({ queryKey: ["dashboard-counts"] });
      qc.invalidateQueries({ queryKey: ["today-hearings-preview"] });
    },
  });
}

// ─── Update case ─────────────────────────────────────────────────────────────

export function useUpdateCase(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const { error } = await update.case_(id, payload);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["case",  id] });
      qc.invalidateQueries({ queryKey: ["cases"] });
    },
  });
}

// ─── Soft delete ─────────────────────────────────────────────────────────────

export function useSoftDeleteCase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await update.case_(id, { deleted_at: new Date().toISOString() });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cases"] });
      qc.invalidateQueries({ queryKey: ["dashboard-counts"] });
    },
  });
}

// ─── Add case note ────────────────────────────────────────────────────────────

export function useAddCaseNote(caseId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { firm_id: string; body: string; created_by: string }) => {
      const { data, error } = await insert.caseNote({ ...payload, case_id: caseId });
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["case-notes", caseId] }),
  });
}

export function useDeleteCaseNote(caseId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (noteId: string) => {
      const { error } = await supabaseRaw.from("case_notes").delete().eq("id", noteId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["case-notes", caseId] }),
  });
}
