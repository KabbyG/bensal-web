"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin, UnauthorizedError } from "@/lib/admin/require-admin";
import { logAudit } from "@/lib/admin/audit";
import { saveImageUpload, UploadValidationError } from "@/lib/upload";
import { partnerSchema } from "@/lib/admin/validations";
import type { ActionResult } from "@/actions/newsletter";

async function resolveLogo(formData: FormData, current: string | null): Promise<string | null> {
  const file = formData.get("logoUrlFile");
  const remove = formData.get("logoUrlFileRemove") === "true";
  if (file instanceof File && file.size > 0) return saveImageUpload(file, "partners");
  if (remove) return null;
  return current;
}

function parseInput(formData: FormData) {
  return partnerSchema.safeParse({
    name: formData.get("name"),
    url: formData.get("url") ?? "",
    order: formData.get("order") ?? 0,
  });
}

export async function createPartner(formData: FormData): Promise<ActionResult> {
  let admin;
  try {
    admin = await requireAdmin();
  } catch (error) {
    if (error instanceof UnauthorizedError) return { success: false, message: error.message };
    throw error;
  }

  const parsed = parseInput(formData);
  if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid input." };

  let logoUrl: string | null;
  try {
    logoUrl = await resolveLogo(formData, null);
  } catch (error) {
    if (error instanceof UploadValidationError) return { success: false, message: error.message };
    throw error;
  }
  if (!logoUrl) return { success: false, message: "A logo image is required." };

  const created = await prisma.partner.create({
    data: { name: parsed.data.name, url: parsed.data.url || null, order: parsed.data.order, logoUrl },
  });

  await logAudit({ actorEmail: admin.email!, action: "CREATE", entityType: "Partner", entityId: created.id });
  revalidatePath("/");
  revalidatePath("/admin/partners");
  return { success: true, message: "Partner added." };
}

export async function updatePartner(id: string, formData: FormData): Promise<ActionResult> {
  let admin;
  try {
    admin = await requireAdmin();
  } catch (error) {
    if (error instanceof UnauthorizedError) return { success: false, message: error.message };
    throw error;
  }

  const existing = await prisma.partner.findUnique({ where: { id } });
  if (!existing) return { success: false, message: "Partner not found." };

  const parsed = parseInput(formData);
  if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid input." };

  let logoUrl: string | null;
  try {
    logoUrl = await resolveLogo(formData, existing.logoUrl);
  } catch (error) {
    if (error instanceof UploadValidationError) return { success: false, message: error.message };
    throw error;
  }
  if (!logoUrl) return { success: false, message: "A logo image is required." };

  await prisma.partner.update({
    where: { id },
    data: { name: parsed.data.name, url: parsed.data.url || null, order: parsed.data.order, logoUrl },
  });

  await logAudit({ actorEmail: admin.email!, action: "UPDATE", entityType: "Partner", entityId: id });
  revalidatePath("/");
  revalidatePath("/admin/partners");
  return { success: true, message: "Partner updated." };
}

export async function softDeletePartner(id: string): Promise<ActionResult> {
  let admin;
  try {
    admin = await requireAdmin();
  } catch (error) {
    if (error instanceof UnauthorizedError) return { success: false, message: error.message };
    throw error;
  }

  await prisma.partner.update({ where: { id }, data: { deletedAt: new Date() } });
  await logAudit({ actorEmail: admin.email!, action: "DELETE", entityType: "Partner", entityId: id });
  revalidatePath("/");
  revalidatePath("/admin/partners");
  return { success: true, message: "Moved to trash." };
}
