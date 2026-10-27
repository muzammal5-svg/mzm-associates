"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { db, insert, update, supabaseRaw } from "@/lib/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import type { CaseLaw } from "@/types/supabase";
import { toast } from "@/components/ui/Toast";

const PAGE_SIZE = 20;

export interface CaseLawsFilter {
  search?:   string;
  lawReport?: string;
  page?:     number;
  pageSize?: number;
}

// ─── List ──────────────────────────────────────────────────────────────────────

export function useCaseLaws(filter: CaseLawsFilter = {}) {
  const { search = "", lawReport, page = 1, pageSize = PAGE_SIZE } = filter;
  const from = (page - 1) * pageSize;
  const to   = from + pageSize - 1;

  return useQuery({
    queryKey: ["case-laws", search, lawReport, page, pageSize],
    queryFn: async () => {
      let q = db.caseLaws()
        .select("*")
        .order("created_at", { ascending: false })
        .range(from, to);

      if (search.trim()) {
        const s = `%${search.trim()}%`;
        q = q.or(`law_report.ilike.${s},case_title.ilike.${s}`);
      }
      if (lawReport) q = q.eq("law_report", lawReport);

      const { data, error, count } = await q;
      if (error) throw error;
      return {
        caseLaws:    (data as CaseLaw[]) ?? [],
        total:       count ?? 0,
        page,
        pageSize,
        totalPages:  Math.ceil((count ?? 0) / pageSize),
      };
    },
    staleTime: 1000 * 60,
    placeholderData: prev => prev,
  });
}

// ─── Create ────────────────────────────────────────────────────────────────────

export function useCreateCaseLaw() {
  const qc = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (payload: {
      law_report: string;
      year:       number;
      page_no:    number;
      case_title: string;
    }) => {
      const { error } = await insert.caseLaw({
        firm_id:     profile?.firm_id ?? null,
        law_report:  payload.law_report.trim(),
        year:        payload.year,
        page_no:     payload.page_no,
        case_title:  payload.case_title.trim(),
        created_by:  profile?.id ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["case-laws"] });
      toast.success("Case law added successfully.");
    },
    onError: (err: Error) => {
      toast.error("Failed to add case law.", err.message);
    },
  });
}

// ─── Update ────────────────────────────────────────────────────────────────────

export function useUpdateCaseLaw(id: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      law_report?: string;
      year?:       number;
      page_no?:    number;
      case_title?: string;
    }) => {
      const { error } = await update.caseLaw(id, {
        law_report:  payload.law_report?.trim(),
        year:        payload.year,
        page_no:     payload.page_no,
        case_title:  payload.case_title?.trim(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["case-laws"] });
      toast.success("Case law updated successfully.");
    },
    onError: (err: Error) => {
      toast.error("Failed to update case law.", err.message);
    },
  });
}

// ─── Delete ────────────────────────────────────────────────────────────────────

export function useDeleteCaseLaw() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabaseRaw.from("case_laws").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["case-laws"] });
      toast.success("Case law deleted successfully.");
    },
    onError: (err: Error) => {
      toast.error("Failed to delete case law.", err.message);
    },
  });
}

// ─── Law report options for dropdown ───────────────────────────────────────────

export const LAW_REPORT_OPTIONS = [
  "MLD",
  "PLD",
  "SCMR",
  "CLC",
  "YLR",
  "PCrLJ",
  "SCM",
  "MLD(S)",
  "PLD(S)",
].map(v => ({ value: v, label: v }));
