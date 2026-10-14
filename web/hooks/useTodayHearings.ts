"use client";

import { useQuery } from "@tanstack/react-query";
import { db }       from "@/lib/supabase/client";
import { todayKarachi } from "@/lib/utils";
import type { CauseListRow } from "@/types/supabase";

async function fetchTodayHearings(): Promise<CauseListRow[]> {
  const today = todayKarachi();
  const { data, error } = await db.causeList()
    .select("*")
    .eq("hearing_date", today)
    .order("serial_no", { ascending: true })
    .limit(3);

  if (error) throw error;
  return (data as CauseListRow[]) ?? [];
}

export function useTodayHearings() {
  return useQuery({
    queryKey: ["today-hearings-preview"],
    queryFn:  fetchTodayHearings,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}
