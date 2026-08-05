"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { ActionResult } from "@/actions/newsletter";
import { DataTable } from "@/components/admin/data-table";
import { EntityDialog } from "@/components/admin/entity-dialog";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { ExportButtons } from "@/components/admin/export-buttons";
import { LogoEntityForm } from "@/components/admin/logo-entity-form";
import { Button } from "@/components/ui/button";

type LogoEntity = { id: string; name: string; url: string | null; order: number; logoUrl: string };

export function LogoEntityManager<T extends LogoEntity>({
  data,
  entityKey,
  labelSingular,
  createAction,
  updateAction,
  softDeleteAction,
}: {
  data: T[];
  entityKey: string;
  labelSingular: string;
  createAction: (formData: FormData) => Promise<ActionResult>;
  updateAction: (id: string, formData: FormData) => Promise<ActionResult>;
  softDeleteAction: (id: string) => Promise<ActionResult>;
}) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<T | null>(null);

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }
  function openEdit(row: T) {
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
        <ExportButtons entity={entityKey} />
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> Add {labelSingular}
        </Button>
      </div>

      <DataTable
        data={data}
        searchValue={(row) => row.name}
        emptyMessage={`No ${labelSingular.toLowerCase()}s yet.`}
        columns={[
          {
            key: "logoUrl",
            header: "Logo",
            render: (r) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={r.logoUrl} alt="" className="h-10 w-10 rounded-lg border border-border object-contain p-1" />
            ),
          },
          { key: "name", header: "Name", sortable: true },
          { key: "url", header: "URL", render: (r) => r.url ?? "—" },
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
              title={`Delete "${row.name}"?`}
              description="This moves the record to Trash. You can restore it later."
              confirmLabel="Delete"
              destructive
              onConfirm={async () => {
                const result = await softDeleteAction(row.id);
                if (result.success) router.refresh();
                return result;
              }}
            />
          </div>
        )}
      />

      <EntityDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editing ? `Edit ${labelSingular}` : `Add ${labelSingular}`}
      >
        <LogoEntityForm item={editing} onSaved={onSaved} createAction={createAction} updateAction={updateAction} />
      </EntityDialog>
    </div>
  );
}
