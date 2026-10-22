"use client";

import { useState }        from "react";
import { useTranslation }  from "react-i18next";
import { Plus, Edit, Trash2, Check, X, Scale } from "lucide-react";

import { AppShell }        from "@/components/layout/AppShell";
import { RouteGuard }      from "@/components/shared/RouteGuard";
import { Card }            from "@/components/ui/Card";
import { Button }          from "@/components/ui/Button";
import { MutatingButton, useMutationLock } from "@/components/shared/MutatingButton";
import { Input }           from "@/components/ui/Input";
import { EmptyState }      from "@/components/ui/EmptyState";
import { QueryErrorState } from "@/components/ui/QueryErrorState";
import { SkeletonCard }    from "@/components/ui/Skeleton";
import { ConfirmDialog }   from "@/components/ui/Modal";
import { useToast }        from "@/components/ui/Toast";
import { useAuth }         from "@/providers/AuthProvider";
import { useCourts, useCreateCourt, useUpdateCourt, useDeleteCourt } from "@/hooks/useCourts";
import type { Court } from "@/types/supabase";

export default function CourtsPage() {
  return (
    <RouteGuard allowedRoles={["super_admin", "admin"]}>
      <CourtsAdmin />
    </RouteGuard>
  );
}

function CourtsAdmin() {
  const { t }       = useTranslation();
  const toast       = useToast();
  const { profile } = useAuth();
  const { lock } = useMutationLock();

  const { data: courts = [], isLoading, isError, refetch } = useCourts();
  const createCourt  = useCreateCourt();
  const updateCourt  = useUpdateCourt();
  const deleteCourt  = useDeleteCourt();

  const [adding,    setAdding]    = useState(false);
  const [newName,   setNewName]   = useState("");
  const [editId,    setEditId]    = useState<string | null>(null);
  const [editName,  setEditName]  = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);

  async function handleAdd() {
    if (!newName.trim() || !profile) return;
    try {
      await createCourt.mutateAsync({ firm_id: profile.firm_id, name: newName.trim() });
      setNewName(""); setAdding(false);
      toast.success(t("common.courtAdded"));
    } catch { toast.error(t("common.error")); }
  }

  async function handleUpdate() {
    if (!editId || !editName.trim()) return;
    try {
      await updateCourt.mutateAsync({ id: editId, name: editName.trim() });
      setEditId(null);       toast.success(t("common.courtUpdated"));
    } catch { toast.error(t("common.error")); }
  }

  async function handleDelete() {
    if (!confirmId) return;
    try {
      await deleteCourt.mutateAsync(confirmId);
      toast.success(t("common.courtDeleted"));
    } catch (err: unknown) {
      toast.error(t("common.error"), err instanceof Error ? err.message : "");
    }
    setConfirmId(null);
  }

  return (
    <AppShell pageTitle={t("common.courts")} showBack>
      <div className="max-w-xl mx-auto space-y-4">

        <div className="flex justify-end">
          <MutatingButton size="sm" leftIcon={<Plus className="w-4 h-4"/>} onClick={() => setAdding(true)}>
            {t("common.addNew")}
          </MutatingButton>
        </div>

        {adding && (
          <Card className="space-y-3">
            <Input label={t("common.courtName")} value={newName} onChange={e => setNewName(e.target.value)}
              placeholder={t("cases.court")} required autoFocus />
            <div className="flex gap-2">
              <MutatingButton size="sm" onClick={handleAdd} loading={createCourt.isPending}
                leftIcon={<Check className="w-4 h-4"/>}>{t("common.save")}</MutatingButton>
              <Button size="sm" variant="secondary" onClick={() => { setAdding(false); setNewName(""); }}
                leftIcon={<X className="w-4 h-4"/>}>{t("common.cancel")}</Button>
            </div>
          </Card>
        )}

        {isError ? <QueryErrorState onRetry={() => void refetch()} /> :
         isLoading ? Array.from({length:3}).map((_,i)=><SkeletonCard key={i}/>) :
          courts.length === 0 ? <EmptyState icon={Scale} title={t("common.noData")} /> :
          <Card padding="none" className="divide-y divide-navy-50">
            {courts.map(ct => (
              <div key={ct.id} className="px-4 py-3">
                {editId === ct.id ? (
                  <div className="space-y-2">
                    <Input value={editName} onChange={e => setEditName(e.target.value)} required />
                    <div className="flex gap-2">
                      <MutatingButton size="xs" onClick={handleUpdate} loading={updateCourt.isPending}
                        leftIcon={<Check className="w-3.5 h-3.5"/>}>{t("common.save")}</MutatingButton>
                      <Button size="xs" variant="secondary" onClick={() => setEditId(null)}
                        leftIcon={<X className="w-3.5 h-3.5"/>}>{t("common.cancel")}</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Scale className="w-4 h-4 text-navy-300 flex-shrink-0" />
                    <span className="flex-1 text-sm font-medium text-navy">{ct.name}</span>
                    <div className="flex gap-1">
                      <button onClick={() => { setEditId(ct.id); setEditName(ct.name); }} {...lock}
                        className="w-7 h-7 flex items-center justify-center rounded text-navy-300 hover:text-navy hover:bg-navy-50 transition-colors disabled:opacity-40">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setConfirmId(ct.id)} {...lock}
                        className="w-7 h-7 flex items-center justify-center rounded text-navy-300 hover:text-danger hover:bg-red-50 transition-colors disabled:opacity-40">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </Card>
        }

        <ConfirmDialog open={!!confirmId} onClose={() => setConfirmId(null)}
          onConfirm={handleDelete} title={t("common.delete")}
          message={t("common.deleteCourtConfirm")}
          confirmLabel={t("common.delete")} confirmVariant="danger" loading={deleteCourt.isPending}
        />
      </div>
    </AppShell>
  );
}
