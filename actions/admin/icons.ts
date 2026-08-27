"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin, UnauthorizedError } from "@/lib/admin/require-admin";
import { logAudit } from "@/lib/admin/audit";
import { saveImageUpload, UploadValidationError } from "@/lib/upload";
import type { ActionResult } from "@/actions/newsletter";

export async function updateServiceIcon(id: string, formData: FormData): Promise<ActionResult> {
  let admin;
  try {
    admin = await requireAdmin();
  } catch (error) {
    if (error instanceof UnauthorizedError) return { success: false, message: error.message };
    throw error;
  }

  const existing = await prisma.service.findUnique({ where: { id } });
  if (!existing) return { success: false, message: "Service not found." };

  const file = formData.get("iconFile");
  const remove = formData.get("iconFileRemove") === "true";

  let customIconUrl: string | null;
  try {
    if (file instanceof File && file.size > 0) {
      customIconUrl = await saveImageUpload(file, "icons");
    } else if (remove) {
      customIconUrl = null;
    } else {
      return { success: false, message: "Choose an icon file to upload." };
    }
  } catch (error) {
    if (error instanceof UploadValidationError) return { success: false, message: error.message };
    throw error;
  }

  await prisma.service.update({ where: { id }, data: { customIconUrl } });

  await logAudit({ actorEmail: admin.email!, action: "UPDATE", entityType: "Service", entityId: id });

  revalidatePath("/capabilities");
  revalidatePath(`/capabilities/${existing.slug}`);
  revalidatePath("/admin/icons");
  revalidatePath("/admin/services");

  return { success: true, message: remove ? "Icon reset to default." : "Icon updated." };
}
