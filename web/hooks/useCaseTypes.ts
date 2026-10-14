"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { db, insert, update, supabaseRaw } from "@/lib/supabase/client";
import type { CaseType } from "@/types/supabase";

export function useCaseTypes() {
  return useQuery({
    queryKey: ["case-types"],
    queryFn: async () => {
      const { data, error } = await db.caseTypes()
        .select("*")
        .order("name", { ascending: true });
      if (error) throw error;
      return (data as CaseType[]) ?? [];
    },
    staleTime: 1000 * 60 * 10,
  });
}

export function useCreateCaseType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { firm_id: string; name: string; requires_offence: boolean }) => {
      const { data, error } = await insert.caseType(payload);
      if (error) throw error;
      return data as CaseType;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["case-types"] }),
  });
}

export function useUpdateCaseType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string; name?: string; requires_offence?: boolean }) => {
      const { error } = await supabaseRaw.from("case_types").update(payload).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["case-types"] }),
  });
}

export function useDeleteCaseType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabaseRaw.from("case_types").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["case-types"] }),
  });
}
