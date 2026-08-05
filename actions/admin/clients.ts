"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin, UnauthorizedError } from "@/lib/admin/require-admin";
import { logAudit } from "@/lib/admin/audit";
import { saveImageUpload, UploadValidationError } from "@/lib/upload";
import { clientSchema } from "@/lib/admin/validations";
import type { ActionResult } from "@/actions/newsletter";

async function resolveLogo(formData: FormData, current: string | null): Promise<string | null> {
  const file = formData.get("logoUrlFile");
  const remove = formData.get("logoUrlFileRemove") === "true";
  if (file instanceof File && file.size > 0) return saveImageUpload(file, "clients");
  if (remove) return null;
  return current;
}

function parseInput(formData: FormData) {
  return clientSchema.safeParse({
    name: formData.get("name"),
    url: formData.get("url") ?? "",
    order: formData.get("order") ?? 0,
  });
}

export async function createClient(formData: FormData): Promise<ActionResult> {
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

  const created = await prisma.client.create({
    data: { name: parsed.data.name, url: parsed.data.url || null, order: parsed.data.order, logoUrl },
  });

  await logAudit({ actorEmail: admin.email!, action: "CREATE", entityType: "Client", entityId: created.id });
  revalidatePath("/");
  revalidatePath("/admin/clients");
  return { success: true, message: "Client added." };
}

export async function updateClient(id: string, formData: FormData): Promise<ActionResult> {
  let admin;
  try {
    admin = await requireAdmin();
  } catch (error) {
    if (error instanceof UnauthorizedError) return { success: false, message: error.message };
    throw error;
  }

  const existing = await prisma.client.findUnique({ where: { id } });
  if (!existing) return { success: false, message: "Client not found." };

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

  await prisma.client.update({
    where: { id },
    data: { name: parsed.data.name, url: parsed.data.url || null, order: parsed.data.order, logoUrl },
  });

  await logAudit({ actorEmail: admin.email!, action: "UPDATE", entityType: "Client", entityId: id });
  revalidatePath("/");
  revalidatePath("/admin/clients");
  return { success: true, message: "Client updated." };
}

export async function softDeleteClient(id: string): Promise<ActionResult> {
  let admin;
  try {
    admin = await requireAdmin();
  } catch (error) {
    if (error instanceof UnauthorizedError) return { success: false, message: error.message };
    throw error;
  }

  await prisma.client.update({ where: { id }, data: { deletedAt: new Date() } });
  await logAudit({ actorEmail: admin.email!, action: "DELETE", entityType: "Client", entityId: id });
  revalidatePath("/");
  revalidatePath("/admin/clients");
  return { success: true, message: "Moved to trash." };
}
