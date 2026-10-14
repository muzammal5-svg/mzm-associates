-- =============================================================================
-- Migration 003: case_activity_log + close_case_reminders function
-- =============================================================================

-- ─── Activity Log ─────────────────────────────────────────────────────────────
CREATE TYPE activity_event AS ENUM (
  'case_created',
  'case_updated',
  'case_decided',
  'case_reopened',
  'hearing_added',
  'hearing_updated',
  'document_added',
  'document_deleted',
  'note_added',
  'note_deleted',
  'reminder_dismissed'
);

CREATE TABLE public.case_activity_log (
  id          UUID           PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id     UUID           NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  firm_id     UUID           NOT NULL REFERENCES public.firms(id) ON DELETE CASCADE,
  event       activity_event NOT NULL,
  actor_id    UUID           REFERENCES public.profiles(id) ON DELETE SET NULL,
  actor_name  TEXT,                     -- denormalised for display after user deletion
  summary     TEXT           NOT NULL,  -- human-readable description
  meta        JSONB,                    -- optional structured data (old/new values)
  created_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activity_log_case   ON public.case_activity_log (case_id, created_at DESC);
CREATE INDEX idx_activity_log_firm   ON public.case_activity_log (firm_id, created_at DESC);
CREATE INDEX idx_activity_log_actor  ON public.case_activity_log (actor_id) WHERE actor_id IS NOT NULL;

-- RLS
ALTER TABLE public.case_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "firm members read activity"
  ON public.case_activity_log FOR SELECT
  USING (firm_id = public.current_firm_id());

-- Only the backend (service role / triggers) inserts activity log rows.
-- The client never inserts directly — use the log_case_activity() function.
CREATE POLICY "firm members insert activity"
  ON public.case_activity_log FOR INSERT
  WITH CHECK (firm_id = public.current_firm_id());

-- ─── Helper: log_case_activity() ──────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.log_case_activity(
  p_case_id   UUID,
  p_firm_id   UUID,
  p_event     activity_event,
  p_actor_id  UUID,
  p_summary   TEXT,
  p_meta      JSONB DEFAULT NULL
)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_actor_name TEXT;
BEGIN
  SELECT full_name INTO v_actor_name FROM public.profiles WHERE id = p_actor_id;
  INSERT INTO public.case_activity_log
    (case_id, firm_id, event, actor_id, actor_name, summary, meta)
  VALUES
    (p_case_id, p_firm_id, p_event, p_actor_id, v_actor_name, p_summary, p_meta);
END;
$$;

-- ─── Auto-log when a case is created ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.auto_log_case_created()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.log_case_activity(
    NEW.id, NEW.firm_id, 'case_created'::activity_event,
    NEW.created_by,
    'Case ' || NEW.case_ref_no || ' created — ' || NEW.plaintiff_name || ' vs ' || NEW.defendant_name
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_log_case_created
  AFTER INSERT ON public.cases
  FOR EACH ROW EXECUTE FUNCTION public.auto_log_case_created();

-- ─── Auto-log when a case status changes (decided / reopened) ─────────────────
CREATE OR REPLACE FUNCTION public.auto_log_case_status()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF OLD.status <> NEW.status THEN
    IF NEW.status = 'decided' THEN
      PERFORM public.log_case_activity(
        NEW.id, NEW.firm_id, 'case_decided'::activity_event,
        auth.uid(),
        'Case decided — outcome: ' || COALESCE(NEW.outcome::TEXT, '—') ||
        ', date: ' || TO_CHAR(NEW.decision_date, 'DD Mon YYYY'),
        jsonb_build_object('outcome', NEW.outcome, 'decision_date', NEW.decision_date)
      );
    ELSIF NEW.status = 'running' AND OLD.status = 'decided' THEN
      PERFORM public.log_case_activity(
        NEW.id, NEW.firm_id, 'case_reopened'::activity_event,
        auth.uid(),
        'Case reopened and moved back to Running.'
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_log_case_status
  AFTER UPDATE OF status ON public.cases
  FOR EACH ROW EXECUTE FUNCTION public.auto_log_case_status();

-- ─── Auto-log when a hearing is added ────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.auto_log_hearing()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_ref TEXT;
BEGIN
  SELECT case_ref_no INTO v_ref FROM public.cases WHERE id = NEW.case_id;
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_case_activity(
      NEW.case_id, NEW.firm_id, 'hearing_added'::activity_event,
      NEW.created_by,
      'Hearing added for ' || COALESCE(v_ref,'') || ' on ' ||
        TO_CHAR(NEW.hearing_date, 'DD Mon YYYY') ||
        CASE WHEN NEW.next_date IS NOT NULL
          THEN ' — next date: ' || TO_CHAR(NEW.next_date, 'DD Mon YYYY')
          ELSE '' END
    );
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM public.log_case_activity(
      NEW.case_id, NEW.firm_id, 'hearing_updated'::activity_event,
      NEW.created_by,
      'Hearing updated for ' || COALESCE(v_ref,'') || ' on ' ||
        TO_CHAR(NEW.hearing_date, 'DD Mon YYYY')
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_log_hearing
  AFTER INSERT OR UPDATE OF current_proceeding, next_date ON public.hearings
  FOR EACH ROW EXECUTE FUNCTION public.auto_log_hearing();

-- ─── Auto-log when a document is added/deleted ───────────────────────────────
CREATE OR REPLACE FUNCTION public.auto_log_document()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.case_id IS NOT NULL THEN
    IF TG_OP = 'INSERT' THEN
      PERFORM public.log_case_activity(
        NEW.case_id, NEW.firm_id, 'document_added'::activity_event,
        NEW.uploaded_by, 'Document uploaded: ' || NEW.name
      );
    ELSE
      PERFORM public.log_case_activity(
        OLD.case_id, OLD.firm_id, 'document_deleted'::activity_event,
        auth.uid(), 'Document deleted: ' || OLD.name
      );
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trg_log_document
  AFTER INSERT OR DELETE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.auto_log_document();

-- ─── close_case_reminders(): dismiss all upcoming reminders when case decided ──
CREATE OR REPLACE FUNCTION public.close_case_reminders(p_case_id UUID)
RETURNS INT LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE rows_updated INT;
BEGIN
  UPDATE public.reminders
    SET status   = 'dismissed',
        acted_at = NOW()
  WHERE case_id = p_case_id
    AND status  = 'upcoming';

  GET DIAGNOSTICS rows_updated = ROW_COUNT;
  RETURN rows_updated;
END;
$$;
