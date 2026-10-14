"use client";

import { useState }        from "react";
import { useTranslation }  from "react-i18next";
import { Plus, Edit, Trash2, Check, X } from "lucide-react";

import { AppShell }        from "@/components/layout/AppShell";
import { RouteGuard }      from "@/components/shared/RouteGuard";
import { Card }            from "@/components/ui/Card";
import { Button }          from "@/components/ui/Button";
import { Input }           from "@/components/ui/Input";
import { Badge }           from "@/components/ui/Badge";
import { ConfirmDialog }   from "@/components/ui/Modal";
import { SkeletonCard }    from "@/components/ui/Skeleton";
import { EmptyState }      from "@/components/ui/EmptyState";
import { QueryErrorState } from "@/components/ui/QueryErrorState";
import { useToast }        from "@/components/ui/Toast";
import { useAuth }         from "@/providers/AuthProvider";
import {
  useCaseTypes, useCreateCaseType,
  useUpdateCaseType, useDeleteCaseType,
} from "@/hooks/useCaseTypes";
import type { CaseType } from "@/types/supabase";

export default function CaseTypesPage() {
  return (
    <RouteGuard allowedRoles={["super_admin", "admin"]}>
      <CaseTypesAdmin />
    </RouteGuard>
  );
}

function CaseTypesAdmin() {
  const { t }       = useTranslation();
  const toast       = useToast();
  const { profile } = useAuth();

  const { data: types = [], isLoading, isError, refetch } = useCaseTypes();
  const createType  = useCreateCaseType();
  const updateType  = useUpdateCaseType();
  const deleteType  = useDeleteCaseType();

  const [newName,     setNewName]     = useState("");
  const [newOffence,  setNewOffence]  = useState(false);
  const [adding,      setAdding]      = useState(false);
  const [editId,      setEditId]      = useState<string | null>(null);
  const [editName,    setEditName]    = useState("");
  const [editOffence, setEditOffence] = useState(false);
  const [confirmId,   setConfirmId]   = useState<string | null>(null);

  async function handleAdd() {
    if (!newName.trim() || !profile) return;
    try {
      await createType.mutateAsync({
        firm_id:          profile.firm_id,
        name:             newName.trim(),
        requires_offence: newOffence,
      });
      setNewName(""); setNewOffence(false); setAdding(false);
      toast.success("Case type added.");
    } catch { toast.error(t("common.error")); }
  }

  async function handleUpdate() {
    if (!editId || !editName.trim()) return;
    try {
      await updateType.mutateAsync({ id: editId, name: editName.trim(), requires_offence: editOffence });
      setEditId(null); toast.success("Case type updated.");
    } catch { toast.error(t("common.error")); }
  }

  async function handleDelete() {
    if (!confirmId) return;
    try {
      await deleteType.mutateAsync(confirmId);
      toast.success("Case type deleted.");
    } catch (err: unknown) {
      toast.error(t("common.error"), err instanceof Error ? err.message : "");
    }
    setConfirmId(null);
  }

  function startEdit(ct: CaseType) {
    setEditId(ct.id); setEditName(ct.name); setEditOffence(ct.requires_offence);
  }

  return (
    <AppShell pageTitle="Case Types" showBack>
      <div className="max-w-xl mx-auto space-y-4">

        <div className="flex justify-end">
          <Button size="sm" leftIcon={<Plus className="w-4 h-4"/>} onClick={() => setAdding(true)}>
            Add Case Type
          </Button>
        </div>

        {/* Add form */}
        {adding && (
          <Card className="space-y-3">
            <Input label="Name" value={newName} onChange={e => setNewName(e.target.value)}
              placeholder="e.g. Criminal" required autoFocus />
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={newOffence}
                onChange={e => setNewOffence(e.target.checked)}
                className="w-4 h-4 accent-gold rounded" />
              <span className="text-sm text-navy">Requires Offence field</span>
            </label>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAdd} loading={createType.isPending}
                leftIcon={<Check className="w-4 h-4"/>}>Save</Button>
              <Button size="sm" variant="secondary" onClick={() => { setAdding(false); setNewName(""); }}
                leftIcon={<X className="w-4 h-4"/>}>Cancel</Button>
            </div>
          </Card>
        )}

        {isError ? <QueryErrorState onRetry={() => void refetch()} /> :
         isLoading ? Array.from({length:3}).map((_,i)=><SkeletonCard key={i}/>) :
          types.length === 0 ? <EmptyState title="No case types yet" /> :
          <Card padding="none" className="divide-y divide-navy-50">
            {types.map(ct => (
              <div key={ct.id} className="px-4 py-3">
                {editId === ct.id ? (
                  <div className="space-y-2">
                    <Input value={editName} onChange={e => setEditName(e.target.value)} required />
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={editOffence}
                        onChange={e => setEditOffence(e.target.checked)}
                        className="w-4 h-4 accent-gold rounded" />
                      <span className="text-sm text-navy">Requires Offence</span>
                    </label>
                    <div className="flex gap-2">
                      <Button size="xs" onClick={handleUpdate} loading={updateType.isPending}
                        leftIcon={<Check className="w-3.5 h-3.5"/>}>Save</Button>
                      <Button size="xs" variant="secondary" onClick={() => setEditId(null)}
                        leftIcon={<X className="w-3.5 h-3.5"/>}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <span className="text-sm font-medium text-navy">{ct.name}</span>
                      {ct.requires_offence && (
                        <Badge variant="warning" size="sm" className="ms-2">Requires Offence</Badge>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => startEdit(ct)}
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
          onConfirm={handleDelete} title="Delete Case Type"
          message="Delete this case type? Existing cases will not be affected, but you can no longer select it for new cases."
          confirmLabel="Delete" confirmVariant="danger" loading={deleteType.isPending}
        />
      </div>
    </AppShell>
  );
}
