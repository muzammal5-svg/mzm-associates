import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../types/supabase";

type CauseListFilterRow = Pick<
  Database["public"]["Views"]["v_cause_list"]["Row"],
  "hearing_court_no" | "hearing_judge" | "case_type_id" | "case_type_name" | "representing"
>;

export interface HearingFilterOptions {
  courts: string[];
  judges: string[];
  caseTypes: Array<{ id: string; name: string }>;
}

export function fetchHearingFilterOptions(
  client: SupabaseClient<Database>,
): Promise<HearingFilterOptions>;