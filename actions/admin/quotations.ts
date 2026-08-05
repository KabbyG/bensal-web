"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin, UnauthorizedError } from "@/lib/admin/require-admin";
import { logAudit } from "@/lib/admin/audit";
import type { ActionResult } from "@/actions/newsletter";

const STATUSES = ["NEW", "READ", "REPLIED", "ARCHIVED"] as const;

export async function updateQuotationStatus(id: string, status: string): Promise<ActionResult> {
  let admin;
  try {
    admin = await requireAdmin();
  } catch (error) {
    if (error instanceof UnauthorizedError) return { success: false, message: error.message };
    throw error;
  }

  if (!STATUSES.includes(status as (typeof STATUSES)[number])) {
    return { success: false, message: "Invalid status." };
  }

  await prisma.quotationRequest.update({
    where: { id },
    data: { status: status as (typeof STATUSES)[number] },
  });

  await logAudit({ actorEmail: admin.email!, action: "UPDATE", entityType: "QuotationRequest", entityId: id, meta: { status } });
  revalidatePath("/admin/quotations");
  revalidatePath("/admin");
  return { success: true, message: "Status updated." };
}

export async function softDeleteQuotation(id: string): Promise<ActionResult> {
  let admin;
  try {
    admin = await requireAdmin();
  } catch (error) {
    if (error instanceof UnauthorizedError) return { success: false, message: error.message };
    throw error;
  }

  await prisma.quotationRequest.update({ where: { id }, data: { deletedAt: new Date() } });
  await logAudit({ actorEmail: admin.email!, action: "DELETE", entityType: "QuotationRequest", entityId: id });
  revalidatePath("/admin/quotations");
  revalidatePath("/admin");
  return { success: true, message: "Moved to trash." };
}
