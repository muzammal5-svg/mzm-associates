"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { db, supabaseRaw } from "@/lib/supabase/client";
import type { CaseActivityLog, CaseOutcome } from "@/types/supabase";

// ─── Activity log query ───────────────────────────────────────────────────────

export function useActivityLog(caseId: string | null) {
  return useQuery({
    queryKey: ["activity-log", caseId],
    queryFn: async () => {
      const { data, error } = await db.activityLog()
        .select("*")
        .eq("case_id", caseId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as CaseActivityLog[]) ?? [];
    },
    enabled: !!caseId,
    staleTime: 1000 * 60,
  });
}

// ─── Mark as Decided (enhanced: close reminders + log + optional doc) ─────────

export interface MarkDecidedPayload {
  caseId:         string;
  decisionDate:   string;
  outcome:        CaseOutcome;
  decisionNotes?: string;
  document?: {
    name: string;
    file_path: string;
    mime: string;
    size: number;
  };
}

export function useMarkAsDecidedFull() {
  const qc          = useQueryClient();

  return useMutation({
    mutationFn: async (p: MarkDecidedPayload) => {
      const { data, error } = await supabaseRaw.rpc("mark_case_decided", {
        p_case_id: p.caseId,
        p_decision_date: p.decisionDate,
        p_outcome: p.outcome,
        ...(p.decisionNotes !== undefined ? { p_decision_notes: p.decisionNotes } : {}),
        p_document: p.document ?? null,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (_d, p) => {
      qc.invalidateQueries({ queryKey: ["case",           p.caseId] });
      qc.invalidateQueries({ queryKey: ["cases"] });
      qc.invalidateQueries({ queryKey: ["activity-log",  p.caseId] });
      qc.invalidateQueries({ queryKey: ["dashboard-counts"] });
      qc.invalidateQueries({ queryKey: ["cause-list"] });
    },
  });
}

// ─── Reopen Case ──────────────────────────────────────────────────────────────

export interface ReopenPayload {
  caseId: string;
  reason: string;
}

export function useReopenCase() {
  const qc          = useQueryClient();

  return useMutation({
    mutationFn: async (p: ReopenPayload) => {
      const { data, error } = await supabaseRaw.rpc("reopen_case", {
        p_case_id: p.caseId,
        p_reason: p.reason,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (_d, p) => {
      qc.invalidateQueries({ queryKey: ["case",          p.caseId] });
      qc.invalidateQueries({ queryKey: ["cases"] });
      qc.invalidateQueries({ queryKey: ["activity-log", p.caseId] });
      qc.invalidateQueries({ queryKey: ["dashboard-counts"] });
    },
  });
}
