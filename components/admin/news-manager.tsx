"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { NewsPost } from "@/lib/generated/prisma/client";
import { softDeleteNewsPost } from "@/actions/admin/news";
import { DataTable } from "@/components/admin/data-table";
import { EntityDialog } from "@/components/admin/entity-dialog";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { ExportButtons } from "@/components/admin/export-buttons";
import { NewsForm } from "@/components/admin/news-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function NewsManager({ data }: { data: NewsPost[] }) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<NewsPost | null>(null);

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }
  function openEdit(row: NewsPost) {
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
        <ExportButtons entity="news" />
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> Add Post
        </Button>
      </div>

      <DataTable
        data={data}
        searchValue={(row) => `${row.title} ${row.category ?? ""}`}
        emptyMessage="No news posts yet."
        columns={[
          { key: "title", header: "Title", sortable: true },
          { key: "category", header: "Category", render: (r) => r.category ?? "—" },
          {
            key: "published",
            header: "Published",
            render: (r) => (r.published ? <Badge variant="accent">Published</Badge> : <Badge variant="outline">Draft</Badge>),
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
                const result = await softDeleteNewsPost(row.id);
                if (result.success) router.refresh();
                return result;
              }}
            />
          </div>
        )}
      />

      <EntityDialog open={dialogOpen} onOpenChange={setDialogOpen} title={editing ? "Edit Post" : "Add Post"}>
        <NewsForm post={editing} onSaved={onSaved} />
      </EntityDialog>
    </div>
  );
}
