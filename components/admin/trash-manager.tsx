"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { RotateCcw, Trash2 } from "lucide-react";
import { restoreEntity, permanentlyDeleteEntity } from "@/actions/admin/trash";
import { DataTable } from "@/components/admin/data-table";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export type TrashRow = {
  id: string;
  entityKey: string;
  entityLabel: string;
  label: string;
  deletedAt: string;
};

export function TrashManager({ data }: { data: TrashRow[] }) {
  const router = useRouter();

  return (
    <DataTable
      data={data}
      searchValue={(row) => `${row.label} ${row.entityLabel}`}
      emptyMessage="Trash is empty."
      columns={[
        { key: "entityLabel", header: "Type", sortable: true, render: (r) => <Badge variant="outline">{r.entityLabel}</Badge> },
        { key: "label", header: "Item", sortable: true },
        {
          key: "deletedAt",
          header: "Deleted",
          sortable: true,
          render: (r) => new Date(r.deletedAt).toLocaleString(),
        },
      ]}
      actions={(row) => (
        <div className="flex justify-end gap-2">
          <ConfirmDialog
            trigger={
              <Button variant="outline" size="sm">
                <RotateCcw className="h-3.5 w-3.5" /> Restore
              </Button>
            }
            title={`Restore "${row.label}"?`}
            description="This brings the record back to its normal list."
            confirmLabel="Restore"
            onConfirm={async () => {
              const result = await restoreEntity(row.entityKey, row.id);
              if (result.success) router.refresh();
              return result;
            }}
          />
          <ConfirmDialog
            trigger={
              <Button variant="outline" size="sm">
                <Trash2 className="h-3.5 w-3.5" /> Delete Forever
              </Button>
            }
            title={`Permanently delete "${row.label}"?`}
            description="This cannot be undone."
            confirmLabel="Delete Forever"
            destructive
            onConfirm={async () => {
              const result = await permanentlyDeleteEntity(row.entityKey, row.id);
              if (result.success) router.refresh();
              return result;
            }}
          />
        </div>
      )}
    />
  );
}
