"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Eye, Trash2, Paperclip } from "lucide-react";
import type { ContactMessage } from "@/lib/generated/prisma/client";
import { updateMessageStatus, softDeleteMessage } from "@/actions/admin/messages";
import { DataTable } from "@/components/admin/data-table";
import { EntityDialog } from "@/components/admin/entity-dialog";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { ExportButtons } from "@/components/admin/export-buttons";
import { StatusSelect } from "@/components/admin/status-select";
import { Button } from "@/components/ui/button";

const STATUSES = ["NEW", "READ", "REPLIED", "ARCHIVED"] as const;

export function MessageManager({ data }: { data: ContactMessage[] }) {
  const router = useRouter();
  const [viewing, setViewing] = React.useState<ContactMessage | null>(null);

  return (
    <div className="space-y-4">
      <ExportButtons entity="messages" />

      <DataTable
        data={data}
        searchValue={(row) => `${row.fullName} ${row.email} ${row.subject}`}
        emptyMessage="No messages yet."
        columns={[
          { key: "fullName", header: "From", sortable: true },
          { key: "subject", header: "Subject", sortable: true },
          {
            key: "status",
            header: "Status",
            render: (r) => (
              <StatusSelect
                id={r.id}
                value={r.status}
                options={STATUSES}
                updateAction={updateMessageStatus}
                onUpdated={() => router.refresh()}
              />
            ),
          },
          { key: "createdAt", header: "Received", sortable: true, render: (r) => r.createdAt.toLocaleString() },
        ]}
        actions={(row) => (
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setViewing(row)}>
              <Eye className="h-3.5 w-3.5" />
            </Button>
            <ConfirmDialog
              trigger={
                <Button variant="outline" size="sm">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              }
              title={`Delete message from "${row.fullName}"?`}
              description="This moves the record to Trash. You can restore it later."
              confirmLabel="Delete"
              destructive
              onConfirm={async () => {
                const result = await softDeleteMessage(row.id);
                if (result.success) router.refresh();
                return result;
              }}
            />
          </div>
        )}
      />

      <EntityDialog open={Boolean(viewing)} onOpenChange={(o) => !o && setViewing(null)} title="Message">
        {viewing && (
          <div className="space-y-4 text-sm">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground">From</p>
                <p>{viewing.fullName}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground">Company</p>
                <p>{viewing.company ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground">Email</p>
                <a href={`mailto:${viewing.email}`} className="text-accent hover:underline">
                  {viewing.email}
                </a>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground">Phone</p>
                <p>{viewing.phone ?? "—"}</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">Subject</p>
              <p>{viewing.subject}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">Message</p>
              <p className="whitespace-pre-wrap rounded-xl border border-border bg-surface-muted p-4">{viewing.message}</p>
            </div>
            {viewing.attachmentUrl && (
              <a
                href={viewing.attachmentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-accent hover:underline"
              >
                <Paperclip className="h-4 w-4" /> View attachment
              </a>
            )}
          </div>
        )}
      </EntityDialog>
    </div>
  );
}
