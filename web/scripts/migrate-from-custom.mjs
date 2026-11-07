import { Client } from "pg";

const client = new Client({
  connectionString: "postgresql://postgres.zxxpsvhlekemgccrcwtg:muzammal571@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres",
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await client.connect();
  console.log("Connected to PostgreSQL.");

  await client.query("BEGIN;");

  try {
    console.log("Dropping view v_cause_list...");
    await client.query("DROP VIEW IF EXISTS public.v_cause_list CASCADE;");

    console.log("Altering cases.representing column to TEXT...");
    await client.query("ALTER TABLE public.cases ALTER COLUMN representing TYPE TEXT USING representing::TEXT;");

    console.log("Updating create_case_with_first_hearing function...");
    await client.query(`
      CREATE OR REPLACE FUNCTION public.create_case_with_first_hearing(p_case jsonb, p_first_hearing jsonb DEFAULT NULL::jsonb)
      RETURNS cases
      LANGUAGE plpgsql
      SET search_path TO 'public'
      AS $function$
      DECLARE
        v_case public.cases%ROWTYPE;
        v_firm_id UUID := public.current_firm_id();
        v_today DATE := (NOW() AT TIME ZONE 'Asia/Karachi')::DATE;
      BEGIN
        IF auth.uid() IS NULL OR public.current_role() NOT IN ('super_admin', 'admin', 'lawyer') THEN
          RAISE EXCEPTION 'You are not allowed to create cases.';
        END IF;

        IF public.current_role() = 'super_admin' THEN
          v_firm_id := (
            SELECT firm_id FROM public.clients WHERE id = (p_case->>'client_id')::UUID LIMIT 1
          );
          IF v_firm_id IS NULL THEN
            RAISE EXCEPTION 'Selected client not found.';
          END IF;
        ELSE
          IF v_firm_id IS NULL THEN
            RAISE EXCEPTION 'Your account is not linked to a firm.';
          END IF;
          IF NOT EXISTS (
            SELECT 1 FROM public.clients
            WHERE id = (p_case->>'client_id')::UUID AND firm_id = v_firm_id
          ) OR NOT EXISTS (
            SELECT 1 FROM public.case_types
            WHERE id = (p_case->>'case_type_id')::UUID AND firm_id = v_firm_id
          ) THEN
            RAISE EXCEPTION 'The selected client and case type must belong to your firm.';
          END IF;
        END IF;

        INSERT INTO public.cases (
          firm_id, client_id, case_ref_no, plaintiff_name, defendant_name,
          representing, judge_name, court_no, case_type_id, offence, description,
          status, assigned_to, created_by
        ) VALUES (
          v_firm_id,
          (p_case->>'client_id')::UUID,
          p_case->>'case_ref_no',
          p_case->>'plaintiff_name',
          p_case->>'defendant_name',
          COALESCE(NULLIF(p_case->>'From', ''), NULLIF(p_case->>'representing', ''), 'Plaintiff'),
          NULLIF(p_case->>'judge_name', ''),
          NULLIF(p_case->>'court_no', ''),
          (p_case->>'case_type_id')::UUID,
          NULLIF(p_case->>'offence', ''),
          NULLIF(p_case->>'description', ''),
          'running',
          COALESCE(NULLIF(p_case->>'assigned_to', '')::UUID, auth.uid()),
          auth.uid()
        )
        RETURNING * INTO v_case;

        IF p_first_hearing IS NOT NULL AND p_first_hearing <> 'null'::JSONB THEN
          INSERT INTO public.hearings (
            case_id, firm_id, hearing_date, serial_no, next_date, next_proceeding,
            judge_name, court_no, created_by
          ) VALUES (
            v_case.id, v_firm_id,
            COALESCE(NULLIF(p_first_hearing->>'hearing_date', '')::DATE, v_today),
            NULLIF(p_first_hearing->>'serial_no', ''),
            NULLIF(p_first_hearing->>'next_date', '')::DATE,
            NULLIF(p_first_hearing->>'next_proceeding', ''),
            v_case.judge_name, v_case.court_no, auth.uid()
          );
        END IF;

        RETURN v_case;
      END;
      $function$;
    `);

    console.log("Recreating view v_cause_list...");
    await client.query(`
      CREATE OR REPLACE VIEW public.v_cause_list AS
        WITH ranked_hearings AS (
               SELECT h.id,
                  h.case_id,
                  h.firm_id,
                  h.serial_no,
                  h.hearing_date,
                  h.current_proceeding,
                  h.next_proceeding,
                  h.next_date,
                  h.judge_name,
                  h.court_no,
                  h.created_by,
                  h.created_at,
                  h.updated_at,
                  row_number() OVER (PARTITION BY h.case_id ORDER BY h.hearing_date DESC, h.created_at DESC, h.id DESC) AS rn,
                  lag(h.hearing_date) OVER (PARTITION BY h.case_id ORDER BY h.hearing_date, h.created_at, h.id) AS prev_date
                 FROM public.hearings h
              )
       SELECT rh.id AS hearing_id,
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
          c.representing,
          c.representing AS "From",
          c.status AS case_status,
          c.judge_name AS case_judge,
          c.court_no AS case_court_no,
          cl.full_name AS client_name,
          cl.phone AS client_phone,
          ct.name AS case_type_name,
          ct.requires_offence,
          rh.prev_date AS previous_date,
          rh.rn = 1 AS is_latest_hearing,
          c.case_type_id
         FROM ranked_hearings rh
           JOIN public.cases c ON c.id = rh.case_id AND c.deleted_at IS NULL
           JOIN public.clients cl ON cl.id = c.client_id
           JOIN public.case_types ct ON ct.id = c.case_type_id;
    `);

    await client.query("COMMIT;");
    console.log("Migration successful and committed!");
  } catch (err) {
    await client.query("ROLLBACK;");
    console.error("Migration failed, rolled back:", err);
    throw err;
  } finally {
    await client.end();
  }
}

run().catch(console.error);
