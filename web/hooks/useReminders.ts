"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase, supabaseRaw } from "@/lib/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import type { Reminder, ReminderStatus } from "@/types/supabase";

export type ReminderItem = Omit<Reminder, "case" | "hearing"> & {
  case: {
    id: string;
    case_ref_no: string;
    plaintiff_name: string;
    defendant_name: string;
    judge_name: string | null;
    court_no: string | null;
    client: { full_name: string } | null;
  } | null;
  hearing: {
    next_date: string | null;
    judge_name: string | null;
    court_no: string | null;
  } | null;
};

export function useReminders() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`reminders-page:${user.id}`)
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "reminders",
        filter: `user_id=eq.${user.id}`,
      }, () => {
        void queryClient.invalidateQueries({ queryKey: ["reminders", user.id] });
      })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [user, queryClient]);

  return useQuery({
    queryKey: ["reminders", user?.id],
    queryFn: async () => {
      const { data, error } = await supabaseRaw
        .from("reminders")
        .select(`
          *,
          case:cases(id,case_ref_no,plaintiff_name,defendant_name,judge_name,court_no,client:clients(full_name)),
          hearing:hearings(next_date,judge_name,court_no)
        `)
        .eq("user_id", user!.id)
        .eq("is_custom" as any, true)
        .order("remind_date", { ascending: true })
        .limit(300);
      if (error) throw error;
      return (data ?? []) as ReminderItem[];
    },
    enabled: !!user,
    staleTime: 30_000,
  });
}

export function useUpdateReminderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ReminderStatus }) => {
      const { error } = await supabaseRaw
        .from("reminders")
        .update({
          status,
          acted_at: status === "upcoming" ? null : new Date().toISOString(),
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-counts"] });
    },
  });
}
