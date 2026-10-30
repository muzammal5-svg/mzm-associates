"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { db, supabaseRaw } from "@/lib/supabase/client";
import { supabase }        from "@/lib/supabase/client";
import { useAuth }         from "@/providers/AuthProvider";
import type { Document }   from "@/types/supabase";

interface DocsFilter {
  clientId?: string | null;
  caseId?: string | null;
  filterClientId?: string | null;
  filterCaseId?: string | null;
  search?: string;
  documentType?: string;
  category?: string;
}

function qKey(f: DocsFilter) {
  return [
    "documents", f.clientId ?? null, f.caseId ?? null, f.filterClientId ?? null,
    f.filterCaseId ?? null, f.search ?? "", f.documentType ?? "all", f.category ?? "all",
  ];
}

export function useDocuments(filter: DocsFilter) {
  const { clientId, caseId, filterClientId, filterCaseId, search = "", documentType, category } = filter;

  return useQuery({
    queryKey: qKey(filter),
    queryFn: async () => {
      let q = db.documents()
        .select(
          "*, client:clients(id,full_name), case:cases(id,case_ref_no,plaintiff_name,defendant_name,case_type:case_types(id,name))"
        )
        .order("created_at", { ascending: false });

      if (clientId) q = q.eq("client_id", clientId);
      if (caseId)   q = q.eq("case_id",   caseId);
      if (filterClientId) q = q.eq("client_id", filterClientId);
      if (filterCaseId) q = q.eq("case_id", filterCaseId);
      if (category) q = q.eq("category", category);

      if (search.trim()) {
        const s = `%${search.trim()}%`;
        q = q.ilike("name", s);
      }

      if (documentType && documentType !== "all") {
        if (documentType === "pdf") q = q.eq("mime", "application/pdf");
        if (documentType === "image") q = q.ilike("mime", "image/%");
        if (documentType === "other") q = q.not("mime", "ilike", "image/%").not("mime", "ilike", "application/pdf");
      }

      const { data, error } = await q;
      if (error) throw error;
      return (data as (Document & {
        client?: { id: string; full_name: string } | null;
        case?: {
          id: string;
          case_ref_no: string;
          plaintiff_name: string;
          defendant_name: string;
          case_type?: { id: string; name: string } | null;
        } | null;
      })[]) ?? [];
    },
    staleTime: 1000 * 60 * 2,
  });
}

export function useDocumentFilterOptions(enabled: boolean) {
  return useQuery({
    queryKey: ["document-filter-options"],
    enabled,
    queryFn: async () => {
      const pageSize = 1000;
      const [clients, cases] = await Promise.all([
        (async () => {
          const rows: { id: string; full_name: string }[] = [];
          for (let from = 0; ; from += pageSize) {
            const { data, error } = await db.clients()
              .select("id,full_name")
              .order("full_name")
              .range(from, from + pageSize - 1);
            if (error) throw error;
            rows.push(...(data ?? []));
            if ((data?.length ?? 0) < pageSize) return rows;
          }
        })(),
        (async () => {
          const rows: { id: string; case_ref_no: string }[] = [];
          for (let from = 0; ; from += pageSize) {
            const { data, error } = await db.cases()
              .select("id,case_ref_no")
              .is("deleted_at", null)
              .order("case_ref_no")
              .range(from, from + pageSize - 1);
            if (error) throw error;
            rows.push(...(data ?? []));
            if ((data?.length ?? 0) < pageSize) return rows;
          }
        })(),
      ]);
      return { clients, cases };
    },
    staleTime: 1000 * 60 * 10,
  });
}

export function useDeleteDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ doc }: { doc: Document }) => {
      // Delete storage object
      const { error: storageError } = await supabase.storage.from("documents").remove([doc.file_path]);
      if (storageError) throw storageError;
      // Delete DB row
      const { error } = await supabaseRaw
        .from("documents")
        .delete()
        .eq("id", doc.id);
      if (error) throw error;
    },
    onSuccess: (_d, { doc }) => {
      qc.invalidateQueries({ queryKey: ["documents"] });
    },
  });
}

/** Returns a signed URL (60 min) for a private document */
export async function getDocumentUrl(filePath: string): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from("documents")
    .createSignedUrl(filePath, 60 * 60);
  if (error) { console.error("[doc url]", error.message); return null; }
  return data.signedUrl;
}
