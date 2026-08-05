"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin, UnauthorizedError } from "@/lib/admin/require-admin";
import { logAudit } from "@/lib/admin/audit";
import type { ActionResult } from "@/actions/newsletter";

export async function toggleNewsletterActive(id: string, isActive: boolean): Promise<ActionResult> {
  let admin;
  try {
    admin = await requireAdmin();
  } catch (error) {
    if (error instanceof UnauthorizedError) return { success: false, message: error.message };
    throw error;
  }

  await prisma.newsletterSubscriber.update({ where: { id }, data: { isActive } });
  await logAudit({
    actorEmail: admin.email!,
    action: "UPDATE",
    entityType: "NewsletterSubscriber",
    entityId: id,
    meta: { isActive },
  });
  revalidatePath("/admin/newsletter");
  revalidatePath("/admin");
  return { success: true, message: isActive ? "Subscriber reactivated." : "Subscriber deactivated." };
}

export async function softDeleteNewsletterSubscriber(id: string): Promise<ActionResult> {
  let admin;
  try {
    admin = await requireAdmin();
  } catch (error) {
    if (error instanceof UnauthorizedError) return { success: false, message: error.message };
    throw error;
  }

  await prisma.newsletterSubscriber.update({ where: { id }, data: { deletedAt: new Date() } });
  await logAudit({ actorEmail: admin.email!, action: "DELETE", entityType: "NewsletterSubscriber", entityId: id });
  revalidatePath("/admin/newsletter");
  revalidatePath("/admin");
  return { success: true, message: "Moved to trash." };
}
