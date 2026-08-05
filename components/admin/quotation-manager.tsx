"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Eye, Trash2, Paperclip } from "lucide-react";
import type { QuotationRequest } from "@/lib/generated/prisma/client";
import { updateQuotationStatus, softDeleteQuotation } from "@/actions/admin/quotations";
import { DataTable } from "@/components/admin/data-table";
import { EntityDialog } from "@/components/admin/entity-dialog";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { ExportButtons } from "@/components/admin/export-buttons";
import { StatusSelect } from "@/components/admin/status-select";
import { Button } from "@/components/ui/button";

const STATUSES = ["NEW", "READ", "REPLIED", "ARCHIVED"] as const;

export function QuotationManager({ data }: { data: QuotationRequest[] }) {
  const router = useRouter();
  const [viewing, setViewing] = React.useState<QuotationRequest | null>(null);

  return (
    <div className="space-y-4">
      <ExportButtons entity="quotations" />

      <DataTable
        data={data}
        searchValue={(row) => `${row.fullName} ${row.email} ${row.productOrService}`}
        emptyMessage="No quotation requests yet."
        columns={[
          { key: "fullName", header: "From", sortable: true },
          { key: "productOrService", header: "Product / Service", sortable: true },
          {
            key: "status",
            header: "Status",
            render: (r) => (
              <StatusSelect
                id={r.id}
                value={r.status}
                options={STATUSES}
                updateAction={updateQuotationStatus}
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
              title={`Delete request from "${row.fullName}"?`}
              description="This moves the record to Trash. You can restore it later."
              confirmLabel="Delete"
              destructive
              onConfirm={async () => {
                const result = await softDeleteQuotation(row.id);
                if (result.success) router.refresh();
                return result;
              }}
            />
          </div>
        )}
      />

      <EntityDialog open={Boolean(viewing)} onOpenChange={(o) => !o && setViewing(null)} title="Quotation Request">
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
              <p className="text-xs font-semibold uppercase text-muted-foreground">Product / Service</p>
              <p>{viewing.productOrService}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">Details</p>
              <p className="whitespace-pre-wrap rounded-xl border border-border bg-surface-muted p-4">{viewing.details}</p>
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
