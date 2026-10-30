-- Optimize v_cause_list view by replacing correlated subqueries with window functions.
-- This eliminates O(N^2) correlated subqueries across hearings and enables efficient index scans.

CREATE OR REPLACE VIEW public.v_cause_list AS
WITH ranked_hearings AS (
  SELECT
    h.*,
    ROW_NUMBER() OVER (
      PARTITION BY h.case_id
      ORDER BY h.hearing_date DESC, h.created_at DESC, h.id DESC
    ) AS rn,
    LAG(h.hearing_date) OVER (
      PARTITION BY h.case_id
      ORDER BY h.hearing_date ASC, h.created_at ASC, h.id ASC
    ) AS prev_date
  FROM public.hearings h
)
SELECT
  rh.id AS hearing_id,
  rh.case_id,
  rh.firm_id,
  rh.serial_no,
  rh.hearing_date,
  rh.next_date,
  rh.current_proceeding,
  rh.next_proceeding,
  rh.judge_name AS hearing_judge,
  rh.court_no AS hearing_court_no,
  c.case_ref_no,
  c.plaintiff_name,
  c.defendant_name,
  c.From,
  c.status AS case_status,
  c.judge_name AS case_judge,
  c.court_no AS case_court_no,
  cl.full_name AS client_name,
  cl.phone AS client_phone,
  ct.name AS case_type_name,
  ct.requires_offence,
  rh.prev_date AS previous_date,
  (rh.rn = 1) AS is_latest_hearing,
  c.case_type_id
FROM ranked_hearings rh
JOIN public.cases c ON c.id = rh.case_id AND c.deleted_at IS NULL
JOIN public.clients cl ON cl.id = c.client_id
JOIN public.case_types ct ON ct.id = c.case_type_id;

ALTER VIEW public.v_cause_list SET (security_invoker = true);
