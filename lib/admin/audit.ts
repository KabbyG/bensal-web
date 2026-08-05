import { prisma } from "@/lib/prisma";

export async function logAudit(params: {
  actorEmail: string;
  action: "CREATE" | "UPDATE" | "DELETE" | "RESTORE" | "PERMANENT_DELETE";
  entityType: string;
  entityId?: string;
  meta?: Record<string, unknown>;
}) {
  const { actorEmail, action, entityType, entityId, meta } = params;
  await prisma.auditLog.create({
    data: {
      action,
      entityType,
      entityId: entityId ?? null,
      meta: { actorEmail, ...meta },
    },
  });
}
