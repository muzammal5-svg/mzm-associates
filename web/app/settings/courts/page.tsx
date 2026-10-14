"use client";

import { useState }        from "react";
import { useTranslation }  from "react-i18next";
import { Plus, Edit, Trash2, Check, X, Scale } from "lucide-react";

import { AppShell }        from "@/components/layout/AppShell";
import { RouteGuard }      from "@/components/shared/RouteGuard";
import { Card }            from "@/components/ui/Card";
import { Button }          from "@/components/ui/Button";
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
      toast.success("Court added.");
    } catch { toast.error(t("common.error")); }
  }

  async function handleUpdate() {
    if (!editId || !editName.trim()) return;
    try {
      await updateCourt.mutateAsync({ id: editId, name: editName.trim() });
      setEditId(null); toast.success("Court updated.");
    } catch { toast.error(t("common.error")); }
  }

  async function handleDelete() {
    if (!confirmId) return;
    try {
      await deleteCourt.mutateAsync(confirmId);
      toast.success("Court deleted.");
    } catch (err: unknown) {
      toast.error(t("common.error"), err instanceof Error ? err.message : "");
    }
    setConfirmId(null);
  }

  return (
    <AppShell pageTitle="Courts" showBack>
      <div className="max-w-xl mx-auto space-y-4">

        <div className="flex justify-end">
          <Button size="sm" leftIcon={<Plus className="w-4 h-4"/>} onClick={() => setAdding(true)}>
            Add Court
          </Button>
        </div>

        {adding && (
          <Card className="space-y-3">
            <Input label="Court Name" value={newName} onChange={e => setNewName(e.target.value)}
              placeholder="e.g. Lahore High Court" required autoFocus />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAdd} loading={createCourt.isPending}
                leftIcon={<Check className="w-4 h-4"/>}>Save</Button>
              <Button size="sm" variant="secondary" onClick={() => { setAdding(false); setNewName(""); }}
                leftIcon={<X className="w-4 h-4"/>}>Cancel</Button>
            </div>
          </Card>
        )}

        {isError ? <QueryErrorState onRetry={() => void refetch()} /> :
         isLoading ? Array.from({length:3}).map((_,i)=><SkeletonCard key={i}/>) :
          courts.length === 0 ? <EmptyState icon={Scale} title="No courts yet" /> :
          <Card padding="none" className="divide-y divide-navy-50">
            {courts.map(ct => (
              <div key={ct.id} className="px-4 py-3">
                {editId === ct.id ? (
                  <div className="space-y-2">
                    <Input value={editName} onChange={e => setEditName(e.target.value)} required />
                    <div className="flex gap-2">
                      <Button size="xs" onClick={handleUpdate} loading={updateCourt.isPending}
                        leftIcon={<Check className="w-3.5 h-3.5"/>}>Save</Button>
                      <Button size="xs" variant="secondary" onClick={() => setEditId(null)}
                        leftIcon={<X className="w-3.5 h-3.5"/>}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Scale className="w-4 h-4 text-navy-300 flex-shrink-0" />
                    <span className="flex-1 text-sm font-medium text-navy">{ct.name}</span>
                    <div className="flex gap-1">
                      <button onClick={() => { setEditId(ct.id); setEditName(ct.name); }}
                        className="w-7 h-7 flex items-center justify-center rounded text-navy-300 hover:text-navy hover:bg-navy-50 transition-colors">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setConfirmId(ct.id)}
                        className="w-7 h-7 flex items-center justify-center rounded text-navy-300 hover:text-danger hover:bg-red-50 transition-colors">
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
          onConfirm={handleDelete} title="Delete Court"
          message="Delete this court? Existing cases linked to it will not be affected."
          confirmLabel="Delete" confirmVariant="danger" loading={deleteCourt.isPending}
        />
      </div>
    </AppShell>
  );
}
