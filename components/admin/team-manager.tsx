"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { TeamMember } from "@/lib/generated/prisma/client";
import { softDeleteTeamMember } from "@/actions/admin/team";
import { DataTable } from "@/components/admin/data-table";
import { EntityDialog } from "@/components/admin/entity-dialog";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { ExportButtons } from "@/components/admin/export-buttons";
import { TeamForm } from "@/components/admin/team-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function TeamManager({ data }: { data: TeamMember[] }) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<TeamMember | null>(null);

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }
  function openEdit(row: TeamMember) {
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
        <ExportButtons entity="team" />
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> Add Team Member
        </Button>
      </div>

      <DataTable
        data={data}
        searchValue={(row) => `${row.name} ${row.title}`}
        emptyMessage="No team members yet."
        columns={[
          { key: "name", header: "Name", sortable: true },
          { key: "title", header: "Title", sortable: true },
          {
            key: "isLeadership",
            header: "Leadership",
            render: (r) => (r.isLeadership ? <Badge variant="accent">Leadership</Badge> : "—"),
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
              title={`Delete "${row.name}"?`}
              description="This moves the record to Trash. You can restore it later."
              confirmLabel="Delete"
              destructive
              onConfirm={async () => {
                const result = await softDeleteTeamMember(row.id);
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
        title={editing ? "Edit Team Member" : "Add Team Member"}
      >
        <TeamForm member={editing} onSaved={onSaved} />
      </EntityDialog>
    </div>
  );
}
