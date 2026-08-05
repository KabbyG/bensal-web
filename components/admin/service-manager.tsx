"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { Service } from "@/lib/generated/prisma/client";
import { softDeleteService } from "@/actions/admin/services";
import { getIcon } from "@/lib/icon-map";
import { DataTable } from "@/components/admin/data-table";
import { EntityDialog } from "@/components/admin/entity-dialog";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { ExportButtons } from "@/components/admin/export-buttons";
import { ServiceForm } from "@/components/admin/service-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function ServiceManager({ data }: { data: Service[] }) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Service | null>(null);

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }
  function openEdit(row: Service) {
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
        <ExportButtons entity="services" />
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> Add Service
        </Button>
      </div>

      <DataTable
        data={data}
        searchValue={(row) => `${row.title} ${row.slug}`}
        emptyMessage="No services yet."
        columns={[
          {
            key: "title",
            header: "Title",
            sortable: true,
            render: (r) => {
              const Icon = getIcon(r.icon);
              return (
                <span className="inline-flex items-center gap-2">
                  <Icon className="h-4 w-4 text-accent" /> {r.title}
                </span>
              );
            },
          },
          { key: "slug", header: "Slug", sortable: true },
          {
            key: "isFeatured",
            header: "Featured",
            render: (r) => (r.isFeatured ? <Badge variant="accent">Featured</Badge> : "—"),
          },
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
                const result = await softDeleteService(row.id);
                if (result.success) router.refresh();
                return result;
              }}
            />
          </div>
        )}
      />

      <EntityDialog open={dialogOpen} onOpenChange={setDialogOpen} title={editing ? "Edit Service" : "Add Service"}>
        <ServiceForm service={editing} onSaved={onSaved} />
      </EntityDialog>
    </div>
  );
}
