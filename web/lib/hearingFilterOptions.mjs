export async function fetchHearingFilterOptions(client) {
  const rows = [];
  const pageSize = 1000;

  for (let from = 0; ; from += pageSize) {
    const { data, error } = await client
      .from("v_cause_list")
      .select("hearing_court_no,hearing_judge,case_type_id,case_type_name,From")
      .not("case_ref_no", "is", null)
      .range(from, from + pageSize - 1);
    if (error) throw error;
    rows.push(...(data ?? []));
    if ((data?.length ?? 0) < pageSize) break;
  }

  const courts = [...new Set(rows.map(row => row.hearing_court_no).filter(value => !!value))];
  const judges = [...new Set(rows.map(row => row.hearing_judge).filter(value => !!value))];
  const caseTypeMap = new Map(
    rows.flatMap(row => row.case_type_id && row.case_type_name
      ? [[row.case_type_id, row.case_type_name]]
      : [])
  );
  const caseTypes = [...caseTypeMap].map(([id, name]) => ({ id, name }));

  return { courts, judges, caseTypes };
}