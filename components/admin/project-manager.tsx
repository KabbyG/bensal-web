"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { Project } from "@/lib/generated/prisma/client";
import { softDeleteProject } from "@/actions/admin/projects";
import { DataTable } from "@/components/admin/data-table";
import { EntityDialog } from "@/components/admin/entity-dialog";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { ExportButtons } from "@/components/admin/export-buttons";
import { ProjectForm } from "@/components/admin/project-form";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/admin/status-badge";

export function ProjectManager({ data }: { data: Project[] }) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Project | null>(null);

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }
  function openEdit(row: Project) {
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
        <ExportButtons entity="projects" />
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> Add Project
        </Button>
      </div>

      <DataTable
        data={data}
        searchValue={(row) => `${row.title} ${row.category} ${row.client ?? ""}`}
        emptyMessage="No projects yet."
        columns={[
          { key: "title", header: "Title", sortable: true },
          { key: "category", header: "Category", sortable: true },
          { key: "client", header: "Client", render: (r) => r.client ?? "—" },
          { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
          { key: "year", header: "Year", render: (r) => (r.year ? String(r.year) : "—") },
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
                const result = await softDeleteProject(row.id);
                if (result.success) router.refresh();
                return result;
              }}
            />
          </div>
        )}
      />

      <EntityDialog open={dialogOpen} onOpenChange={setDialogOpen} title={editing ? "Edit Project" : "Add Project"}>
        <ProjectForm project={editing} onSaved={onSaved} />
      </EntityDialog>
    </div>
  );
}
