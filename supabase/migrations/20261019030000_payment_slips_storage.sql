-- Storage policies for payment-slips bucket (bucket must be created in dashboard)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id='payment-slips') THEN
    INSERT INTO storage.buckets (id, name, public) VALUES ('payment-slips', 'payment-slips', FALSE);
  END IF;
END $$;

DROP POLICY IF EXISTS "payment slips insert own firm" ON storage.objects;
CREATE POLICY "payment slips insert own firm" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'payment-slips'
    AND (storage.foldername(name))[1] = (SELECT firm_id::text FROM public.profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "payment slips read own firm" ON storage.objects;
CREATE POLICY "payment slips read own firm" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'payment-slips'
    AND ((storage.foldername(name))[1] = (SELECT firm_id::text FROM public.profiles WHERE id = auth.uid()) OR public.is_super_admin())
  );

DROP POLICY IF EXISTS "payment slips delete own firm admin" ON storage.objects;
CREATE POLICY "payment slips delete own firm admin" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'payment-slips'
    AND (storage.foldername(name))[1] = (SELECT firm_id::text FROM public.profiles WHERE id = auth.uid())
    AND public.is_admin_or_above()
  );
