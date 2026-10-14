SET TIME ZONE 'Asia/Karachi';

DO $$
DECLARE
  v_seed_offset_days INT := COALESCE(NULLIF(current_setting('seed.today_offset_days', true), ''), '0')::INT;
  v_karachi_today DATE := ((NOW() AT TIME ZONE 'Asia/Karachi')::DATE + v_seed_offset_days);
  v_firm UUID := 'f0000000-0000-0000-0000-000000000001';
  v_admin_uid UUID;
  v_lawyer_uid UUID;
  v_clerk_uid UUID;
  v_case_without_hearing RECORD;

  v_ct_criminal UUID := 'c7000000-0000-0000-0000-000000000001';
  v_ct_civil    UUID := 'c7000000-0000-0000-0000-000000000002';
  v_ct_family   UUID := 'c7000000-0000-0000-0000-000000000003';
  v_ct_revenue  UUID := 'c7000000-0000-0000-0000-000000000004';
  v_ct_writ     UUID := 'c7000000-0000-0000-0000-000000000005';
  v_ct_banking  UUID := 'c7000000-0000-0000-0000-000000000006';
  v_ct_other    UUID := 'c7000000-0000-0000-0000-000000000007';

  v_c1  UUID := 'c1000000-0000-0000-0000-000000000001';
  v_c2  UUID := 'c1000000-0000-0000-0000-000000000002';
  v_c3  UUID := 'c1000000-0000-0000-0000-000000000003';
  v_c4  UUID := 'c1000000-0000-0000-0000-000000000004';
  v_c5  UUID := 'c1000000-0000-0000-0000-000000000005';
  v_c6  UUID := 'c1000000-0000-0000-0000-000000000006';
  v_c7  UUID := 'c1000000-0000-0000-0000-000000000007';
  v_c8  UUID := 'c1000000-0000-0000-0000-000000000008';
  v_c9  UUID := 'c1000000-0000-0000-0000-000000000009';
  v_c10 UUID := 'c1000000-0000-0000-0000-000000000010';

  v_case1  UUID := 'ca000000-0000-0000-0000-000000000001';
  v_case2  UUID := 'ca000000-0000-0000-0000-000000000002';
  v_case3  UUID := 'ca000000-0000-0000-0000-000000000003';
  v_case4  UUID := 'ca000000-0000-0000-0000-000000000004';
  v_case5  UUID := 'ca000000-0000-0000-0000-000000000005';
  v_case6  UUID := 'ca000000-0000-0000-0000-000000000006';
  v_case7  UUID := 'ca000000-0000-0000-0000-000000000007';
  v_case8  UUID := 'ca000000-0000-0000-0000-000000000008';
  v_case9  UUID := 'ca000000-0000-0000-0000-000000000009';
  v_case10 UUID := 'ca000000-0000-0000-0000-000000000010';
  v_case11 UUID := 'ca000000-0000-0000-0000-000000000011';
  v_case12 UUID := 'ca000000-0000-0000-0000-000000000012';
  v_case13 UUID := 'ca000000-0000-0000-0000-000000000013';
  v_case14 UUID := 'ca000000-0000-0000-0000-000000000014';
  v_case15 UUID := 'ca000000-0000-0000-0000-000000000015';
  v_case16 UUID := 'ca000000-0000-0000-0000-000000000016';
  v_case17 UUID := 'ca000000-0000-0000-0000-000000000017';
  v_case18 UUID := 'ca000000-0000-0000-0000-000000000018';
  v_case19 UUID := 'ca000000-0000-0000-0000-000000000019';
  v_case20 UUID := 'ca000000-0000-0000-0000-000000000020';
  v_case21 UUID := 'ca000000-0000-0000-0000-000000000021';
  v_case22 UUID := 'ca000000-0000-0000-0000-000000000022';
  v_case23 UUID := 'ca000000-0000-0000-0000-000000000023';
  v_case24 UUID := 'ca000000-0000-0000-0000-000000000024';
  v_case25 UUID := 'ca000000-0000-0000-0000-000000000025';
BEGIN
  DELETE FROM public.reminders WHERE case_id IN (SELECT id FROM public.cases WHERE firm_id = v_firm);
  DELETE FROM public.hearings WHERE firm_id = v_firm;
  DELETE FROM public.cases WHERE firm_id = v_firm;
  DELETE FROM public.clients WHERE firm_id = v_firm;
  DELETE FROM public.case_types WHERE firm_id = v_firm;
  DELETE FROM public.courts WHERE firm_id = v_firm;

  INSERT INTO public.firms (id, name, subscription_status, subscription_valid_till)
  VALUES (v_firm, 'MZM & Associates', 'active', v_karachi_today + INTERVAL '1 year')
  ON CONFLICT (id) DO UPDATE
    SET name = EXCLUDED.name,
        subscription_status = EXCLUDED.subscription_status,
        subscription_valid_till = EXCLUDED.subscription_valid_till;

  SELECT id INTO v_admin_uid FROM public.profiles WHERE email = 'admin@mzm.pk';
  SELECT id INTO v_lawyer_uid FROM public.profiles WHERE email = 'lawyer@mzm.pk';
  SELECT id INTO v_clerk_uid FROM public.profiles WHERE email = 'clerk@mzm.pk';

  IF v_admin_uid IS NULL OR v_lawyer_uid IS NULL OR v_clerk_uid IS NULL THEN
    RAISE EXCEPTION 'Run supabase/scripts/seed-users.mjs before the SQL seed.';
  END IF;

  INSERT INTO public.case_types (id, firm_id, name, requires_offence) VALUES
    (v_ct_criminal, v_firm, 'Criminal', TRUE),
    (v_ct_civil, v_firm, 'Civil', FALSE),
    (v_ct_family, v_firm, 'Family', FALSE),
    (v_ct_revenue, v_firm, 'Revenue', FALSE),
    (v_ct_writ, v_firm, 'Writ', FALSE),
    (v_ct_banking, v_firm, 'Banking', FALSE),
    (v_ct_other, v_firm, 'Other', FALSE)
  ON CONFLICT (firm_id, name) DO NOTHING;

  INSERT INTO public.courts (firm_id, name) VALUES
    (v_firm, 'Lahore High Court'),
    (v_firm, 'District & Sessions Court Lahore'),
    (v_firm, 'Civil Judge Court Lahore'),
    (v_firm, 'Family Court Lahore'),
    (v_firm, 'Banking Court Lahore'),
    (v_firm, 'Revenue Court Lahore'),
    (v_firm, 'Supreme Court of Pakistan'),
    (v_firm, 'Islamabad High Court')
  ON CONFLICT (firm_id, name) DO NOTHING;

  INSERT INTO public.clients (id, firm_id, full_name, father_husband_name, cnic, phone, whatsapp, city, created_by) VALUES
    (v_c1, v_firm, 'Muhammad Aslam Khan', 'Khan Muhammad', '35201-1234567-1', '+92-300-1111001', '+92-300-1111001', 'Lahore', v_admin_uid),
    (v_c2, v_firm, 'فاطمہ بی بی', 'غلام حسین', '35202-2345678-2', '+92-321-2222002', NULL, 'Lahore', v_admin_uid),
    (v_c3, v_firm, 'Allied Construction Co.', NULL, NULL, '+92-42-35781234', '+92-42-35781234', 'Lahore', v_admin_uid),
    (v_c4, v_firm, 'عبدالرحمٰن قریشی', 'محمد اقبال قریشی', '35301-3456789-3', '+92-333-3333003', '+92-333-3333003', 'Faisalabad', v_lawyer_uid),
    (v_c5, v_firm, 'Nadia Saleem', 'Saleem Akhtar', '35401-4567890-4', '+92-345-4444004', NULL, 'Lahore', v_lawyer_uid),
    (v_c6, v_firm, 'Pak Traders (Pvt) Ltd.', NULL, NULL, '+92-42-37001234', '+92-42-37001234', 'Lahore', v_admin_uid),
    (v_c7, v_firm, 'سید امجد علی شاہ', 'سید نذیر علی شاہ', '35501-5678901-5', '+92-311-5555005', '+92-311-5555005', 'Lahore', v_lawyer_uid),
    (v_c8, v_firm, 'Tariq Mehmood', 'Ghulam Mehmood', '35601-6789012-6', '+92-322-6666006', NULL, 'Gujranwala', v_lawyer_uid),
    (v_c9, v_firm, 'زینب نواز', 'نواز احمد', '35701-7890123-7', '+92-300-7777007', '+92-300-7777007', 'Lahore', v_admin_uid),
    (v_c10, v_firm, 'Hassan Industries', NULL, NULL, '+92-42-36001111', NULL, 'Lahore', v_admin_uid)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.cases
    (id, firm_id, client_id, case_ref_no, plaintiff_name, defendant_name, representing, case_type_id, status, judge_name, court_no, offence, assigned_to, created_by)
  VALUES
    (v_case1, v_firm, v_c1, 'WP-1234/2024', 'Muhammad Aslam Khan', 'Province of Punjab', 'plaintiff', v_ct_writ, 'running', 'Hon. Justice Syed Ali Shah', '3', NULL, v_lawyer_uid, v_admin_uid),
    (v_case2, v_firm, v_c3, 'CS-567/2024', 'Allied Construction', 'City Development Authority', 'plaintiff', v_ct_civil, 'running', 'Mr. Khalid Mahmood ADJ', '12', NULL, v_lawyer_uid, v_admin_uid),
    (v_case3, v_firm, v_c6, 'CS-890/2023', 'Pak Traders Pvt Ltd', 'Federal Board of Revenue', 'plaintiff', v_ct_civil, 'running', 'Ms. Amna Malik Civil Judge', '5', NULL, v_lawyer_uid, v_admin_uid),
    (v_case4, v_firm, v_c10, 'CS-101/2024', 'Hassan Industries', 'Utility Stores Corp.', 'plaintiff', v_ct_civil, 'running', 'Mr. Usman Farooq Civil Judge', '8', NULL, v_lawyer_uid, v_admin_uid),
    (v_case5, v_firm, v_c2, 'FCA-201/2024', 'فاطمہ بی بی', 'ارسلان احمد', 'plaintiff', v_ct_family, 'running', NULL, '2F', NULL, v_lawyer_uid, v_admin_uid),
    (v_case6, v_firm, v_c5, 'FCA-345/2024', 'Nadia Saleem', 'Kamran Saleem', 'plaintiff', v_ct_family, 'running', NULL, '1F', NULL, v_lawyer_uid, v_admin_uid),
    (v_case7, v_firm, v_c9, 'FCA-456/2023', 'زینب نواز', 'نواز احمد', 'plaintiff', v_ct_family, 'running', NULL, '3F', NULL, v_lawyer_uid, v_admin_uid),
    (v_case8, v_firm, v_c8, 'ST-678/2024', 'State', 'Tariq Mehmood', 'defendant', v_ct_criminal, 'running', 'Mr. Asif Iqbal Sessions Judge', '6', 'Section 302 PPC', v_lawyer_uid, v_admin_uid),
    (v_case9, v_firm, v_c4, 'ST-789/2023', 'State', 'عبدالرحمٰن قریشی', 'defendant', v_ct_criminal, 'running', 'Mr. Asif Iqbal Sessions Judge', '6', 'Section 420/468 PPC', v_lawyer_uid, v_admin_uid),
    (v_case10, v_firm, v_c7, 'ST-901/2024', 'Muhammad Bilal', 'سید امجد علی شاہ', 'defendant', v_ct_criminal, 'running', 'Ms. Sara Qureshi Mag. 1st', '4', 'Section 406/506 PPC', v_lawyer_uid, v_admin_uid),
    (v_case11, v_firm, v_c1, 'REV-112/2024', 'Muhammad Aslam Khan', 'Revenue Officer Lahore', 'plaintiff', v_ct_revenue, 'running', NULL, 'RC', NULL, v_lawyer_uid, v_admin_uid),
    (v_case12, v_firm, v_c4, 'REV-223/2023', 'عبدالرحمٰن قریشی', 'Divisional Director Revenue', 'plaintiff', v_ct_revenue, 'running', NULL, 'RC', NULL, v_lawyer_uid, v_admin_uid),
    (v_case13, v_firm, v_c3, 'BC-334/2024', 'HBL Bank', 'Allied Construction Co.', 'defendant', v_ct_banking, 'running', 'Mr. Hamid Banking Judge', 'B1', NULL, v_lawyer_uid, v_admin_uid),
    (v_case14, v_firm, v_c10, 'BC-445/2023', 'MCB Bank Ltd.', 'Hassan Industries', 'defendant', v_ct_banking, 'running', 'Mr. Hamid Banking Judge', 'B1', NULL, v_lawyer_uid, v_admin_uid),
    (v_case15, v_firm, v_c5, 'WP-556/2024', 'Nadia Saleem', 'Punjab Public Service Comm.', 'plaintiff', v_ct_writ, 'running', 'Hon. Justice Malik Shahzad', '7', NULL, v_lawyer_uid, v_admin_uid),
    (v_case16, v_firm, v_c6, 'WP-667/2023', 'Pak Traders Pvt Ltd', 'FBR Appellate Tribunal', 'plaintiff', v_ct_writ, 'running', 'Hon. Justice Ayesha Tariq', '2', NULL, v_lawyer_uid, v_admin_uid),
    (v_case17, v_firm, v_c1, 'CS-778/2022', 'Muhammad Aslam Khan', 'Lahore Waste Mgmt. Co.', 'plaintiff', v_ct_civil, 'decided', 'Mr. Khalid Mahmood ADJ', '12', NULL, v_lawyer_uid, v_admin_uid),
    (v_case18, v_firm, v_c2, 'FCA-889/2022', 'فاطمہ بی بی', 'ریاض احمد', 'plaintiff', v_ct_family, 'decided', NULL, '2F', NULL, v_lawyer_uid, v_admin_uid),
    (v_case19, v_firm, v_c8, 'ST-990/2022', 'State', 'Tariq Mehmood', 'defendant', v_ct_criminal, 'decided', 'Mr. Asif Iqbal Sessions Judge', '6', 'Section 279/337-A PPC', v_lawyer_uid, v_admin_uid),
    (v_case20, v_firm, v_c3, 'BC-001/2022', 'NBP Bank', 'Allied Construction Co.', 'defendant', v_ct_banking, 'decided', 'Mr. Hamid Banking Judge', 'B1', NULL, v_lawyer_uid, v_admin_uid),
    (v_case21, v_firm, v_c7, 'CS-112/2024', 'سید امجد علی شاہ', 'Housing Society DHA', 'plaintiff', v_ct_civil, 'running', 'Ms. Amna Malik Civil Judge', '5', NULL, v_lawyer_uid, v_admin_uid),
    (v_case22, v_firm, v_c9, 'WP-223/2024', 'زینب نواز', 'Lahore Development Authority', 'plaintiff', v_ct_writ, 'running', 'Hon. Justice Syed Ali Shah', '3', NULL, v_lawyer_uid, v_admin_uid),
    (v_case23, v_firm, v_c5, 'REV-334/2024', 'Nadia Saleem', 'Board of Revenue Punjab', 'plaintiff', v_ct_revenue, 'running', NULL, 'RC', NULL, v_lawyer_uid, v_admin_uid),
    (v_case24, v_firm, v_c10, 'CS-445/2024', 'Hassan Industries', 'WAPDA', 'plaintiff', v_ct_civil, 'running', 'Mr. Usman Farooq Civil Judge', '8', NULL, v_lawyer_uid, v_admin_uid),
    (v_case25, v_firm, v_c4, 'ST-556/2024', 'State', 'عبدالرحمٰن قریشی', 'defendant', v_ct_criminal, 'running', 'Ms. Sara Qureshi Mag. 1st', '4', 'Section 489-F PPC', v_lawyer_uid, v_admin_uid)
  ON CONFLICT (id) DO NOTHING;

  UPDATE public.cases SET decision_date = v_karachi_today - INTERVAL '180 days', outcome = 'won', decision_notes = 'Decree passed in favour of plaintiff. Execution proceedings pending.' WHERE id = v_case17;
  UPDATE public.cases SET decision_date = v_karachi_today - INTERVAL '200 days', outcome = 'settled', decision_notes = 'Matter settled between parties. Compromise decree recorded.' WHERE id = v_case18;
  UPDATE public.cases SET decision_date = v_karachi_today - INTERVAL '150 days', outcome = 'dismissed', decision_notes = 'Acquitted under benefit of doubt. FIR quashed.' WHERE id = v_case19;
  UPDATE public.cases SET decision_date = v_karachi_today - INTERVAL '90 days', outcome = 'lost', decision_notes = 'Decree against client. Appeal filed in High Court.' WHERE id = v_case20;

  INSERT INTO public.hearings (id, case_id, firm_id, serial_no, hearing_date, current_proceeding, next_proceeding, next_date, judge_name, court_no, created_by) VALUES
    (md5('mzm-seed-hearing-c2')::UUID, v_case2, v_firm, '3', v_karachi_today, 'Plaint filed. Notice issued.', 'Written statement.', v_karachi_today + INTERVAL '1 day', 'Mr. Khalid Mahmood ADJ', '12', v_admin_uid),
    (md5('mzm-seed-hearing-c5')::UUID, v_case5, v_firm, '2', v_karachi_today, 'Petition filed.', 'Service of notice.', v_karachi_today + INTERVAL '2 days', NULL, '2F', v_admin_uid),
    (md5('mzm-seed-hearing-c8')::UUID, v_case8, v_firm, '1', v_karachi_today, 'Challan submitted. Charges framed.', 'Prosecution evidence.', v_karachi_today + INTERVAL '3 days', 'Mr. Asif Iqbal Sessions Judge', '6', v_admin_uid),
    (md5('mzm-seed-hearing-c13')::UUID, v_case13, v_firm, '1', v_karachi_today, 'Suit filed. Notice to defendant.', 'Written statement.', v_karachi_today + INTERVAL '4 days', 'Mr. Hamid Banking Judge', 'B1', v_admin_uid),
    (md5('mzm-seed-hearing-c21')::UUID, v_case21, v_firm, '6', v_karachi_today, 'Ex-parte proceedings initiated.', 'Evidence.', v_karachi_today + INTERVAL '5 days', 'Ms. Amna Malik Civil Judge', '5', v_admin_uid),
    (md5('mzm-seed-hearing-today-1')::UUID, v_case1, v_firm, '15', v_karachi_today - INTERVAL '1 day', 'Earlier hearing concluded.', 'Compliance hearing before court.', v_karachi_today, 'Hon. Justice Syed Ali Shah', '3', v_admin_uid),
    (md5('mzm-seed-hearing-today-2')::UUID, v_case3, v_firm, '8', v_karachi_today - INTERVAL '2 days', 'Earlier hearing concluded.', 'Evidence and final arguments.', v_karachi_today, 'Ms. Amna Malik Civil Judge', '5', v_admin_uid),
    (md5('mzm-seed-hearing-today-3')::UUID, v_case15, v_firm, '6', v_karachi_today - INTERVAL '1 day', 'Earlier hearing concluded.', 'Counter affidavit to be placed.', v_karachi_today, 'Hon. Justice Malik Shahzad', '7', v_admin_uid),
    (md5('mzm-seed-hearing-c12')::UUID, v_case12, v_firm, '2', v_karachi_today - INTERVAL '4 days', 'Adjourned for evidence.', 'Arguments.', v_karachi_today + INTERVAL '1 day', 'Mr. Saeed Akhtar', '11', v_admin_uid),
    (md5('mzm-seed-hearing-c14')::UUID, v_case14, v_firm, '3', v_karachi_today - INTERVAL '2 days', 'Complainant evidence.', 'Witness cross-examination.', v_karachi_today + INTERVAL '2 days', 'Mr. Javed Qureshi', '13', v_admin_uid),
    (md5('mzm-seed-hearing-c16')::UUID, v_case16, v_firm, '4', v_karachi_today - INTERVAL '6 days', 'Notice served.', 'Reply filing.', v_karachi_today + INTERVAL '3 days', 'Hon. Justice Ayesha Tariq', '2', v_admin_uid),
    (md5('mzm-seed-hearing-c22')::UUID, v_case22, v_firm, '5', v_karachi_today - INTERVAL '8 days', 'Status hearing.', 'Compliance hearing.', v_karachi_today + INTERVAL '4 days', 'Mr. Ali Mustafa', '9', v_admin_uid),
    (md5('mzm-seed-hearing-c23')::UUID, v_case23, v_firm, '1', v_karachi_today - INTERVAL '1 day', 'Report submitted.', 'Next date hearing.', v_karachi_today + INTERVAL '10 days', 'Mr. Hamza Tariq', 'RC', v_admin_uid),
    (md5('mzm-seed-hearing-c24')::UUID, v_case24, v_firm, '2', v_karachi_today - INTERVAL '3 days', 'Statement recorded.', 'Final arguments.', v_karachi_today + INTERVAL '11 days', 'Mr. Imran Khan', '8', v_admin_uid),
    (md5('mzm-seed-hearing-c17')::UUID, v_case17, v_firm, '4', v_karachi_today - INTERVAL '40 days', 'Final order reserved.', 'Execution report.', v_karachi_today - INTERVAL '3 days', 'Mr. Khalid Mahmood ADJ', '12', v_admin_uid),
    (md5('mzm-seed-hearing-c18')::UUID, v_case18, v_firm, '2', v_karachi_today - INTERVAL '9 days', 'Compromise check.', 'Decree formalities.', v_karachi_today + INTERVAL '6 days', NULL, '2F', v_admin_uid),
    (md5('mzm-seed-hearing-c20')::UUID, v_case20, v_firm, '3', v_karachi_today - INTERVAL '20 days', 'Execution report.', 'Re-listing.', v_karachi_today - INTERVAL '5 days', 'Mr. Hamid Banking Judge', 'B1', v_admin_uid),
    (md5('mzm-seed-hearing-c1')::UUID, v_case1, v_firm, '14', v_karachi_today - INTERVAL '60 days', 'Notice issued to respondent.', 'Compliance of notice.', v_karachi_today - INTERVAL '30 days', 'Hon. Justice Syed Ali Shah', '3', v_admin_uid),
    (md5('mzm-seed-hearing-c3')::UUID, v_case3, v_firm, '7', v_karachi_today - INTERVAL '90 days', 'Written statement filed.', 'Evidence.', v_karachi_today - INTERVAL '45 days', 'Ms. Amna Malik Civil Judge', '5', v_admin_uid),
    (md5('mzm-seed-hearing-c4')::UUID, v_case4, v_firm, '5', v_karachi_today - INTERVAL '20 days', 'Issues framed.', 'Evidence.', v_karachi_today + INTERVAL '7 days', 'Mr. Usman Farooq Civil Judge', '8', v_admin_uid),
    (md5('mzm-seed-hearing-c6')::UUID, v_case6, v_firm, '6', v_karachi_today - INTERVAL '25 days', 'Statement of petitioner recorded.', 'Respondent statement.', v_karachi_today + INTERVAL '10 days', NULL, '1F', v_admin_uid),
    (md5('mzm-seed-hearing-c7')::UUID, v_case7, v_firm, '9', v_karachi_today - INTERVAL '50 days', 'Compromise attempt failed.', 'Further proceedings.', v_karachi_today + INTERVAL '5 days', NULL, '3F', v_admin_uid),
    (md5('mzm-seed-hearing-c9')::UUID, v_case9, v_firm, '4', v_karachi_today - INTERVAL '70 days', 'PW-3 examined.', 'Cross examination of PW-3.', v_karachi_today + INTERVAL '11 days', 'Mr. Asif Iqbal Sessions Judge', '6', v_admin_uid),
    (md5('mzm-seed-hearing-c10')::UUID, v_case10, v_firm, '7', v_karachi_today - INTERVAL '15 days', 'Bail application heard.', 'Order on bail.', v_karachi_today + INTERVAL '3 days', 'Ms. Sara Qureshi Mag. 1st', '4', v_admin_uid),
    (md5('mzm-seed-hearing-c11')::UUID, v_case11, v_firm, '2', v_karachi_today - INTERVAL '35 days', 'Application filed.', 'Hearing.', v_karachi_today + INTERVAL '25 days', NULL, 'RC', v_admin_uid),
    (md5('mzm-seed-hearing-c15')::UUID, v_case15, v_firm, '5', v_karachi_today - INTERVAL '55 days', 'Writ petition admitted.', 'Counter affidavit.', v_karachi_today + INTERVAL '18 days', 'Hon. Justice Malik Shahzad', '7', v_admin_uid),
    (md5('mzm-seed-hearing-c25')::UUID, v_case25, v_firm, '3', v_karachi_today - INTERVAL '5 days', 'Pre-arrest bail application filed.', 'Arguments.', v_karachi_today + INTERVAL '2 days', 'Ms. Sara Qureshi Mag. 1st', '4', v_admin_uid),
    (md5('mzm-seed-hearing-plus10')::UUID, v_case4, v_firm, '6', v_karachi_today + INTERVAL '10 days', 'Cause-list date fixed for final hearing.', 'Final arguments and disposal.', v_karachi_today + INTERVAL '11 days', 'Mr. Usman Farooq Civil Judge', '8', v_admin_uid),
    (md5('mzm-seed-hearing-plus11')::UUID, v_case9, v_firm, '5', v_karachi_today + INTERVAL '11 days', 'Adjourned date fixed for final hearing.', 'Decision and order.', v_karachi_today + INTERVAL '12 days', 'Mr. Asif Iqbal Sessions Judge', '6', v_admin_uid)
  ON CONFLICT (id) DO UPDATE SET
    case_id = EXCLUDED.case_id,
    firm_id = EXCLUDED.firm_id,
    serial_no = EXCLUDED.serial_no,
    hearing_date = EXCLUDED.hearing_date,
    current_proceeding = EXCLUDED.current_proceeding,
    next_proceeding = EXCLUDED.next_proceeding,
    next_date = EXCLUDED.next_date,
    judge_name = EXCLUDED.judge_name,
    court_no = EXCLUDED.court_no,
    created_by = EXCLUDED.created_by;

  FOR v_case_without_hearing IN
    SELECT c.id, c.firm_id, c.case_ref_no, c.created_by
    FROM public.cases c
    WHERE c.firm_id = v_firm
      AND NOT EXISTS (SELECT 1 FROM public.hearings h WHERE h.case_id = c.id)
  LOOP
    INSERT INTO public.hearings (id, case_id, firm_id, serial_no, hearing_date, current_proceeding, next_proceeding, next_date, created_by)
    VALUES (
      md5('mzm-seed-extra-hearing-' || v_case_without_hearing.id::TEXT)::UUID,
      v_case_without_hearing.id,
      v_firm,
      '1',
      v_karachi_today - INTERVAL '14 days',
      'Seed hearing record for ' || v_case_without_hearing.case_ref_no,
      'Next proceeding to be determined.',
      v_karachi_today + INTERVAL '6 days',
      COALESCE(v_case_without_hearing.created_by, v_admin_uid)
    )
    ON CONFLICT (id) DO UPDATE SET
      case_id = EXCLUDED.case_id,
      firm_id = EXCLUDED.firm_id,
      serial_no = EXCLUDED.serial_no,
      hearing_date = EXCLUDED.hearing_date,
      current_proceeding = EXCLUDED.current_proceeding,
      next_proceeding = EXCLUDED.next_proceeding,
      next_date = EXCLUDED.next_date,
      created_by = EXCLUDED.created_by;
  END LOOP;

  RAISE NOTICE 'Seed completed successfully for firm: MZM & Associates at %', v_karachi_today;
END $$;
