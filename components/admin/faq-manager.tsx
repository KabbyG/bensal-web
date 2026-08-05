"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { Faq } from "@/lib/generated/prisma/client";
import { softDeleteFaq } from "@/actions/admin/faqs";
import { DataTable } from "@/components/admin/data-table";
import { EntityDialog } from "@/components/admin/entity-dialog";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { ExportButtons } from "@/components/admin/export-buttons";
import { FaqForm } from "@/components/admin/faq-form";
import { Button } from "@/components/ui/button";

export function FaqManager({ data }: { data: Faq[] }) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Faq | null>(null);

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }
  function openEdit(row: Faq) {
    setEditing(row);
    setDialogOpen(true);
  }
  function onSaved() {
    setDialogOpen(false);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <ExportButtons entity="faqs" />
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> Add FAQ
        </Button>
      </div>

      <DataTable
        data={data}
        searchValue={(row) => `${row.question} ${row.category ?? ""}`}
        emptyMessage="No FAQs yet."
        columns={[
          { key: "question", header: "Question", sortable: true },
          { key: "category", header: "Category", render: (r) => r.category ?? "—" },
          { key: "order", header: "Order", sortable: true },
        ]}
        actions={(row) => (
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => openEdit(row)}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <ConfirmDialog
              trigger={
                <Button variant="outline" size="sm">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              }
              title="Delete this FAQ?"
              description="This moves the record to Trash. You can restore it later."
              confirmLabel="Delete"
              destructive
              onConfirm={async () => {
                const result = await softDeleteFaq(row.id);
                if (result.success) router.refresh();
                return result;
              }}
            />
          </div>
        )}
      />

      <EntityDialog open={dialogOpen} onOpenChange={setDialogOpen} title={editing ? "Edit FAQ" : "Add FAQ"}>
        <FaqForm faq={editing} onSaved={onSaved} />
      </EntityDialog>
    </div>
  );
}
