"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, UnauthorizedError } from "@/lib/admin/require-admin";
import { logAudit } from "@/lib/admin/audit";
import { getEntityConfig } from "@/lib/admin/entity-registry";
import type { ActionResult } from "@/actions/newsletter";

export async function restoreEntity(entityKey: string, id: string): Promise<ActionResult> {
  let admin;
  try {
    admin = await requireAdmin();
  } catch (error) {
    if (error instanceof UnauthorizedError) return { success: false, message: error.message };
    throw error;
  }

  const config = getEntityConfig(entityKey);
  if (!config) return { success: false, message: "Unknown entity." };

  await config.restore(id);
  await logAudit({ actorEmail: admin.email!, action: "RESTORE", entityType: config.label, entityId: id });
  revalidatePath("/", "layout");
  revalidatePath("/admin/trash");
  revalidatePath(config.adminPath);
  return { success: true, message: "Restored." };
}

export async function permanentlyDeleteEntity(entityKey: string, id: string): Promise<ActionResult> {
  let admin;
  try {
    admin = await requireAdmin();
  } catch (error) {
    if (error instanceof UnauthorizedError) return { success: false, message: error.message };
    throw error;
  }

  const config = getEntityConfig(entityKey);
  if (!config) return { success: false, message: "Unknown entity." };

  await config.permanentDelete(id);
  await logAudit({ actorEmail: admin.email!, action: "PERMANENT_DELETE", entityType: config.label, entityId: id });
  revalidatePath("/admin/trash");
  return { success: true, message: "Permanently deleted." };
}
