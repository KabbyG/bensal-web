"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { JobPosting } from "@/lib/generated/prisma/client";
import { softDeleteJobPosting } from "@/actions/admin/careers";
import { DataTable } from "@/components/admin/data-table";
import { EntityDialog } from "@/components/admin/entity-dialog";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { ExportButtons } from "@/components/admin/export-buttons";
import { JobPostingForm } from "@/components/admin/job-posting-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function JobPostingManager({ data }: { data: JobPosting[] }) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<JobPosting | null>(null);

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }
  function openEdit(row: JobPosting) {
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
        <ExportButtons entity="careers" />
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> Add Job Posting
        </Button>
      </div>

      <DataTable
        data={data}
        searchValue={(row) => `${row.title} ${row.location} ${row.department ?? ""}`}
        emptyMessage="No job postings yet."
        columns={[
          { key: "title", header: "Title", sortable: true },
          { key: "location", header: "Location", sortable: true },
          { key: "type", header: "Type", render: (r) => <Badge variant="outline">{r.type.replace("_", " ")}</Badge> },
          {
            key: "isActive",
            header: "Active",
            render: (r) => (r.isActive ? <Badge variant="accent">Active</Badge> : <Badge variant="outline">Closed</Badge>),
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
              title={`Delete "${row.title}"?`}
              description="This moves the record to Trash. You can restore it later."
              confirmLabel="Delete"
              destructive
              onConfirm={async () => {
                const result = await softDeleteJobPosting(row.id);
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
        title={editing ? "Edit Job Posting" : "Add Job Posting"}
      >
        <JobPostingForm posting={editing} onSaved={onSaved} />
      </EntityDialog>
    </div>
  );
}
