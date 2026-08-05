import { prisma } from "@/lib/prisma";
import { AuditLogTable } from "@/components/admin/audit-log-table";

export default async function AdminAuditLogPage() {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div>
      <h1 className="font-display text-xl font-semibold">Audit Log</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Recent create/update/delete/restore activity across the admin dashboard (latest 200 entries).
      </p>
      <div className="mt-6">
        <AuditLogTable data={logs} />
      </div>
    </div>
  );
}
