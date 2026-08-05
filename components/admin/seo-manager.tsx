"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { SeoMeta } from "@/lib/generated/prisma/client";
import { deleteSeoMeta } from "@/actions/admin/seo";
import { DataTable } from "@/components/admin/data-table";
import { EntityDialog } from "@/components/admin/entity-dialog";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { SeoForm } from "@/components/admin/seo-form";
import { Button } from "@/components/ui/button";

export function SeoManager({ data }: { data: SeoMeta[] }) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<SeoMeta | null>(null);

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }
  function openEdit(row: SeoMeta) {
    setEditing(row);
    setDialogOpen(true);
  }
  function onSaved() {
    setDialogOpen(false);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> Add Page SEO
        </Button>
      </div>

      <DataTable
        data={data}
        searchValue={(row) => `${row.page} ${row.title ?? ""}`}
        emptyMessage="No page-specific SEO overrides yet — the site falls back to Company settings."
        columns={[
          { key: "page", header: "Page", sortable: true },
          { key: "title", header: "Title", render: (r) => r.title ?? "—" },
          { key: "description", header: "Description", render: (r) => r.description ?? "—" },
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
              title={`Delete SEO settings for "${row.page}"?`}
              description="This cannot be undone."
              confirmLabel="Delete"
              destructive
              onConfirm={async () => {
                const result = await deleteSeoMeta(row.id);
                if (result.success) router.refresh();
                return result;
              }}
            />
          </div>
        )}
      />

      <EntityDialog open={dialogOpen} onOpenChange={setDialogOpen} title={editing ? "Edit Page SEO" : "Add Page SEO"}>
        <SeoForm entry={editing} onSaved={onSaved} />
      </EntityDialog>
    </div>
  );
}
