"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { GalleryItem } from "@/lib/generated/prisma/client";
import { softDeleteGalleryItem } from "@/actions/admin/gallery";
import { DataTable } from "@/components/admin/data-table";
import { EntityDialog } from "@/components/admin/entity-dialog";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { ExportButtons } from "@/components/admin/export-buttons";
import { GalleryForm } from "@/components/admin/gallery-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function GalleryManager({ data }: { data: GalleryItem[] }) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<GalleryItem | null>(null);

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }
  function openEdit(row: GalleryItem) {
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
        <ExportButtons entity="gallery" />
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> Add Item
        </Button>
      </div>

      <DataTable
        data={data}
        searchValue={(row) => `${row.title} ${row.category ?? ""}`}
        emptyMessage="No gallery items yet."
        columns={[
          {
            key: "title",
            header: "Preview",
            render: (r) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={r.type === "IMAGE" ? r.url : r.thumbnailUrl ?? r.url}
                alt=""
                className="h-12 w-12 rounded-lg object-cover"
              />
            ),
          },
          { key: "titleText", header: "Title", sortable: true, render: (r) => r.title },
          { key: "type", header: "Type", render: (r) => <Badge variant="outline">{r.type}</Badge> },
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
              title={`Delete "${row.title}"?`}
              description="This moves the record to Trash. You can restore it later."
              confirmLabel="Delete"
              destructive
              onConfirm={async () => {
                const result = await softDeleteGalleryItem(row.id);
                if (result.success) router.refresh();
                return result;
              }}
            />
          </div>
        )}
      />

      <EntityDialog open={dialogOpen} onOpenChange={setDialogOpen} title={editing ? "Edit Gallery Item" : "Add Gallery Item"}>
        <GalleryForm item={editing} onSaved={onSaved} />
      </EntityDialog>
    </div>
  );
}
