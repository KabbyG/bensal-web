"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Star } from "lucide-react";
import type { Testimonial } from "@/lib/generated/prisma/client";
import { softDeleteTestimonial } from "@/actions/admin/testimonials";
import { DataTable } from "@/components/admin/data-table";
import { EntityDialog } from "@/components/admin/entity-dialog";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { ExportButtons } from "@/components/admin/export-buttons";
import { TestimonialForm } from "@/components/admin/testimonial-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function TestimonialManager({ data }: { data: Testimonial[] }) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Testimonial | null>(null);

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }
  function openEdit(row: Testimonial) {
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
        <ExportButtons entity="testimonials" />
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> Add Testimonial
        </Button>
      </div>

      <DataTable
        data={data}
        searchValue={(row) => `${row.name} ${row.company ?? ""}`}
        emptyMessage="No testimonials yet."
        columns={[
          { key: "name", header: "Name", sortable: true },
          { key: "company", header: "Company", render: (r) => r.company ?? "—" },
          {
            key: "rating",
            header: "Rating",
            render: (r) => (
              <span className="inline-flex items-center gap-1">
                {r.rating} <Star className="h-3.5 w-3.5 fill-accent text-accent" />
              </span>
            ),
          },
          {
            key: "published",
            header: "Published",
            render: (r) => (r.published ? <Badge variant="accent">Published</Badge> : <Badge variant="outline">Hidden</Badge>),
          },
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
              title={`Delete testimonial from "${row.name}"?`}
              description="This moves the record to Trash. You can restore it later."
              confirmLabel="Delete"
              destructive
              onConfirm={async () => {
                const result = await softDeleteTestimonial(row.id);
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
        title={editing ? "Edit Testimonial" : "Add Testimonial"}
      >
        <TestimonialForm testimonial={editing} onSaved={onSaved} />
      </EntityDialog>
    </div>
  );
}
