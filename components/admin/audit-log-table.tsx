"use client";

import type { AuditLog } from "@/lib/generated/prisma/client";
import { DataTable } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";

export function AuditLogTable({ data }: { data: AuditLog[] }) {
  return (
    <DataTable
      data={data}
      searchValue={(row) => `${row.action} ${row.entityType} ${JSON.stringify(row.meta ?? {})}`}
      emptyMessage="No activity recorded yet."
      pageSize={20}
      columns={[
        {
          key: "createdAt",
          header: "When",
          sortable: true,
          render: (r) => r.createdAt.toLocaleString(),
        },
        {
          key: "actorEmail",
          header: "Actor",
          render: (r) => {
            const meta = r.meta as Record<string, unknown> | null;
            return typeof meta?.actorEmail === "string" ? meta.actorEmail : "—";
          },
        },
        { key: "action", header: "Action", sortable: true, render: (r) => <Badge variant="outline">{r.action}</Badge> },
        { key: "entityType", header: "Entity", sortable: true },
        {
          key: "meta",
          header: "Details",
          render: (r) => {
            const meta = r.meta as Record<string, unknown> | null;
            if (!meta) return "—";
            const { actorEmail, ...rest } = meta;
            void actorEmail;
            return Object.keys(rest).length > 0 ? (
              <code className="text-xs text-muted-foreground">{JSON.stringify(rest)}</code>
            ) : (
              "—"
            );
          },
        },
      ]}
    />
  );
}
