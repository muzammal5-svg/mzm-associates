"use client";

import { useState } from "react";
import { CaseLawList } from "./CaseLawList";
import { CaseLawForm } from "./CaseLawForm";
import { type CaseLaw } from "@/types/supabase";

interface CaseLawsModuleProps {}

export function CaseLawsModule() {
  const [formOpen, setFormOpen] = useState(false);
  const [editingCaseLaw, setEditingCaseLaw] = useState<CaseLaw | null>(null);

  const handleEdit = (caseLaw: CaseLaw | null) => {
    setEditingCaseLaw(caseLaw);
    setFormOpen(true);
  };

  return (
    <div className="space-y-4">
      <CaseLawList onEdit={handleEdit} />
      <CaseLawForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSuccess={() => {
          setFormOpen(false);
          setEditingCaseLaw(null);
        }}
        caseLaw={editingCaseLaw}
      />
    </div>
  );
}
