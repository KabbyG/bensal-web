"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin, UnauthorizedError } from "@/lib/admin/require-admin";
import { logAudit } from "@/lib/admin/audit";
import { saveUpload, UploadValidationError } from "@/lib/upload";
import { nestProfileSchema } from "@/lib/admin/validations";
import type { ActionResult } from "@/actions/newsletter";

export async function updateNestProfile(formData: FormData): Promise<ActionResult> {
  let admin;
  try {
    admin = await requireAdmin();
  } catch (error) {
    if (error instanceof UnauthorizedError) return { success: false, message: error.message };
    throw error;
  }

  const existing = await prisma.nestProfile.findFirst();

  const parsed = nestProfileSchema.safeParse({
    description: formData.get("description"),
  });
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const file = formData.get("pdfFile");
  const removePdf = formData.get("pdfFileRemove") === "true";

  let pdfUrl = existing?.pdfUrl ?? null;
  let pdfName = existing?.pdfName ?? null;
  try {
    if (file instanceof File && file.size > 0) {
      pdfUrl = await saveUpload(file, "nest");
      pdfName = file.name;
    } else if (removePdf) {
      pdfUrl = null;
      pdfName = null;
    }
  } catch (error) {
    if (error instanceof UploadValidationError) return { success: false, message: error.message };
    throw error;
  }

  const data = { description: parsed.data.description, pdfUrl, pdfName };

  const saved = existing
    ? await prisma.nestProfile.update({ where: { id: existing.id }, data })
    : await prisma.nestProfile.create({ data });

  await logAudit({
    actorEmail: admin.email!,
    action: existing ? "UPDATE" : "CREATE",
    entityType: "NestProfile",
    entityId: saved.id,
  });

  revalidatePath("/nest");
  revalidatePath("/admin/nest");

  return { success: true, message: existing ? "NEST page updated." : "NEST page created." };
}
