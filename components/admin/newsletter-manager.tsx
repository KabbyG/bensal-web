"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { NewsletterSubscriber } from "@/lib/generated/prisma/client";
import { toggleNewsletterActive, softDeleteNewsletterSubscriber } from "@/actions/admin/newsletter";
import { DataTable } from "@/components/admin/data-table";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { ExportButtons } from "@/components/admin/export-buttons";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export function NewsletterManager({ data }: { data: NewsletterSubscriber[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  function handleToggle(id: string, next: boolean) {
    setPendingId(id);
    toggleNewsletterActive(id, next).then((result) => {
      setPendingId(null);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <div className="space-y-4">
      <ExportButtons entity="newsletter" />

      <DataTable
        data={data}
        searchValue={(row) => row.email}
        emptyMessage="No subscribers yet."
        columns={[
          { key: "email", header: "Email", sortable: true },
          {
            key: "isActive",
            header: "Active",
            render: (r) => (
              <Checkbox
                checked={r.isActive}
                disabled={pendingId === r.id}
                onCheckedChange={(checked) => handleToggle(r.id, Boolean(checked))}
              />
            ),
          },
          {
            key: "subscribedAt",
            header: "Subscribed",
            sortable: true,
            render: (r) => r.subscribedAt.toLocaleString(),
          },
        ]}
        actions={(row) => (
          <ConfirmDialog
            trigger={
              <Button variant="outline" size="sm">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            }
            title={`Delete "${row.email}"?`}
            description="This moves the record to Trash. You can restore it later."
            confirmLabel="Delete"
            destructive
            onConfirm={async () => {
              const result = await softDeleteNewsletterSubscriber(row.id);
              if (result.success) router.refresh();
              return result;
            }}
          />
        )}
      />
    </div>
  );
}
