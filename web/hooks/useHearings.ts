"use client";

import {
  useQuery, useMutation, useQueryClient,
} from "@tanstack/react-query";
import { db, supabaseRaw } from "@/lib/supabase/client";
import { fetchHearingFilterOptions } from "@/lib/hearingFilterOptions.mjs";
import type { CauseListRow, Hearing } from "@/types/supabase";
import type { TablesUpdate } from "@/types/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CauseListFilter {
  date?:          string | null;   // ISO date; null = all dates (running cases view)
  search?:        string;          // party name / case ref / client
  courtNo?:       string;
  judgeFilter?:   string;
  caseTypeId?:    string;
  representing?:  "plaintiff" | "defendant" | "";
  nextDateFrom?:  string;          // ISO date
  nextDateTo?:    string;          // ISO date
  latestOnly?:    boolean;         // when true: is_latest_hearing = true
  caseId?:        string;
  page?:          number;
  pageSize?:      number;
  sortBy?:        "serial_no" | "hearing_date" | "next_date" | "case_ref_no";
  sortDir?:       "asc" | "desc";
}

// ─── Cause list query ─────────────────────────────────────────────────────────

const PAGE_SIZE = 25;

export function useCauseList(filter: CauseListFilter = {}) {
  const {
    date,
    search       = "",
    courtNo      = "",
    judgeFilter  = "",
    caseTypeId   = "",
    representing = "",
    nextDateFrom = "",
    nextDateTo   = "",
    latestOnly   = false,
    caseId       = "",
    page         = 1,
    pageSize     = PAGE_SIZE,
    sortBy       = "serial_no",
    sortDir      = "asc",
  } = filter;

  const from = (page - 1) * pageSize;
  const to   = from + pageSize - 1;

  return useQuery({
    queryKey: ["cause-list", filter],
    queryFn: async () => {
      let q = db.causeList()
        .select("*", { count: "exact" })
        .order(sortBy, { ascending: sortDir === "asc", nullsFirst: false })
        .range(from, to);

      // Date filter — null means no date filter (running cases view)
      if (date !== null && date !== undefined) {
        q = q.eq("hearing_date", date);
      }

      if (latestOnly)   q = q.eq("is_latest_hearing", true);
      if (caseId)        q = q.eq("case_id", caseId);
      if (courtNo)       q = q.eq("hearing_court_no", courtNo);
      if (caseTypeId)    q = q.eq("case_type_id", caseTypeId);
      if (representing)  q = q.eq("representing",     representing);
      if (nextDateFrom)  q = q.gte("next_date",        nextDateFrom);
      if (nextDateTo)    q = q.lte("next_date",        nextDateTo);

      if (search.trim()) {
        const s = `%${search.trim()}%`;
        q = q.or(
          `plaintiff_name.ilike.${s},defendant_name.ilike.${s},case_ref_no.ilike.${s},client_name.ilike.${s}`
        );
      }

      if (judgeFilter.trim()) {
        q = q.ilike("hearing_judge", `%${judgeFilter.trim()}%`);
      }

      const { data, error, count } = await q;
      if (error) throw error;
      return {
        rows:       (data as CauseListRow[]) ?? [],
        total:      count ?? 0,
        page,
        pageSize,
        totalPages: Math.ceil((count ?? 0) / pageSize),
      };
    },
    staleTime: 1000 * 60 * 2,
    placeholderData: prev => prev,
  });
}

// ─── Quick serial/proceeding update (inline edit on today's list) ─────────────

export function useQuickUpdateHearing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      hearingId,
      serialNo,
      currentProceeding,
    }: {
      hearingId:          string;
      serialNo?:          string;
      currentProceeding?: string;
    }) => {
      const payload: TablesUpdate<"hearings"> = {};
      if (serialNo          !== undefined) payload.serial_no          = serialNo;
      if (currentProceeding !== undefined) payload.current_proceeding = currentProceeding;
      const { error } = await supabaseRaw
        .from("hearings")
        .update(payload)
        .eq("id", hearingId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cause-list"] });
      qc.invalidateQueries({ queryKey: ["case-hearings"] });
    },
  });
}

// ─── Update Hearing: complete current + create new ────────────────────────────

export interface UpdateHearingPayload {
  /** The hearing row being completed */
  currentHearingId:  string;
  caseId:            string;
  /** What happened at TODAY's hearing (written to current row) */
  currentProceeding: string;
  serialNo?:         string;

  /** New hearing details */
  nextDate:          string;   // must be after today
  nextProceeding?:   string;
  judgeChange?:      string;
  courtChange?:      string;
}

export function useUpdateHearing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: UpdateHearingPayload) => {
      // 1. Complete current hearing row with proceeding notes
      const { data, error } = await supabaseRaw.rpc("update_hearing", {
        p_hearing_id: p.currentHearingId,
        p_current_proceeding: p.currentProceeding,
        p_next_proceeding: p.nextProceeding ?? "",
        p_next_date: p.nextDate,
        ...(p.serialNo !== undefined ? { p_serial_no: p.serialNo } : {}),
        ...(p.judgeChange !== undefined ? { p_judge_name: p.judgeChange } : {}),
        ...(p.courtChange !== undefined ? { p_court_no: p.courtChange } : {}),
      });
      if (error) throw error;
      return data as Hearing;
    },
    onSuccess: (_data, p) => {
      qc.invalidateQueries({ queryKey: ["cause-list"] });
      qc.invalidateQueries({ queryKey: ["case-hearings",  p.caseId] });
      qc.invalidateQueries({ queryKey: ["case", p.caseId] });
      qc.invalidateQueries({ queryKey: ["today-hearings-preview"] });
      qc.invalidateQueries({ queryKey: ["dashboard-counts"] });
    },
  });
}

// ─── Distinct filter values (for dropdowns) ───────────────────────────────────

export function useCauseListFilterOptions() {
  return useQuery({
    queryKey: ["cause-list-filter-options"],
    queryFn: () => fetchHearingFilterOptions(supabaseRaw),
    staleTime: 1000 * 60 * 10,
  });
}