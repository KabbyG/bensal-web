"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin, UnauthorizedError } from "@/lib/admin/require-admin";
import { logAudit } from "@/lib/admin/audit";
import { saveImageUpload, UploadValidationError } from "@/lib/upload";
import { serviceSchema } from "@/lib/admin/validations";
import type { ActionResult } from "@/actions/newsletter";

async function resolveImage(formData: FormData, current: string | null): Promise<string | null> {
  const file = formData.get("imageFile");
  const remove = formData.get("imageFileRemove") === "true";
  if (file instanceof File && file.size > 0) return saveImageUpload(file, "services");
  if (remove) return null;
  return current;
}

function parseInput(formData: FormData) {
  return serviceSchema.safeParse({
    slug: formData.get("slug"),
    title: formData.get("title"),
    shortDescription: formData.get("shortDescription"),
    description: formData.get("description"),
    items: formData.getAll("items"),
    icon: formData.get("icon"),
    order: formData.get("order") ?? 0,
    isFeatured: formData.get("isFeatured"),
    seoTitle: formData.get("seoTitle") ?? "",
    seoDescription: formData.get("seoDescription") ?? "",
  });
}

export async function createService(formData: FormData): Promise<ActionResult> {
  let admin;
  try {
    admin = await requireAdmin();
  } catch (error) {
    if (error instanceof UnauthorizedError) return { success: false, message: error.message };
    throw error;
  }

  const parsed = parseInput(formData);
  if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid input." };

  const slugTaken = await prisma.service.findUnique({ where: { slug: parsed.data.slug } });
  if (slugTaken) return { success: false, message: "That slug is already in use." };

  let image: string | null;
  try {
    image = await resolveImage(formData, null);
  } catch (error) {
    if (error instanceof UploadValidationError) return { success: false, message: error.message };
    throw error;
  }

  const created = await prisma.service.create({
    data: {
      ...parsed.data,
      image,
      seoTitle: parsed.data.seoTitle || null,
      seoDescription: parsed.data.seoDescription || null,
    },
  });

  await logAudit({ actorEmail: admin.email!, action: "CREATE", entityType: "Service", entityId: created.id });
  revalidatePath("/services");
  revalidatePath(`/services/${created.slug}`);
  revalidatePath("/admin/services");
  return { success: true, message: "Service created." };
}

export async function updateService(id: string, formData: FormData): Promise<ActionResult> {
  let admin;
  try {
    admin = await requireAdmin();
  } catch (error) {
    if (error instanceof UnauthorizedError) return { success: false, message: error.message };
    throw error;
  }

  const existing = await prisma.service.findUnique({ where: { id } });
  if (!existing) return { success: false, message: "Service not found." };

  const parsed = parseInput(formData);
  if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid input." };

  if (parsed.data.slug !== existing.slug) {
    const slugTaken = await prisma.service.findUnique({ where: { slug: parsed.data.slug } });
    if (slugTaken) return { success: false, message: "That slug is already in use." };
  }

  let image: string | null;
  try {
    image = await resolveImage(formData, existing.image);
  } catch (error) {
    if (error instanceof UploadValidationError) return { success: false, message: error.message };
    throw error;
  }

  await prisma.service.update({
    where: { id },
    data: {
      ...parsed.data,
      image,
      seoTitle: parsed.data.seoTitle || null,
      seoDescription: parsed.data.seoDescription || null,
    },
  });

  await logAudit({ actorEmail: admin.email!, action: "UPDATE", entityType: "Service", entityId: id });
  revalidatePath("/services");
  revalidatePath(`/services/${existing.slug}`);
  revalidatePath(`/services/${parsed.data.slug}`);
  revalidatePath("/admin/services");
  return { success: true, message: "Service updated." };
}

export async function softDeleteService(id: string): Promise<ActionResult> {
  let admin;
  try {
    admin = await requireAdmin();
  } catch (error) {
    if (error instanceof UnauthorizedError) return { success: false, message: error.message };
    throw error;
  }

  const existing = await prisma.service.update({ where: { id }, data: { deletedAt: new Date() } });
  await logAudit({ actorEmail: admin.email!, action: "DELETE", entityType: "Service", entityId: id });
  revalidatePath("/services");
  revalidatePath(`/services/${existing.slug}`);
  revalidatePath("/admin/services");
  return { success: true, message: "Moved to trash." };
}
