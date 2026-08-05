"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin, UnauthorizedError } from "@/lib/admin/require-admin";
import { logAudit } from "@/lib/admin/audit";
import { saveImageUpload, UploadValidationError } from "@/lib/upload";
import { galleryItemSchema } from "@/lib/admin/validations";
import type { ActionResult } from "@/actions/newsletter";

async function resolveUrl(
  formData: FormData,
  type: "IMAGE" | "VIDEO",
  current: string | null
): Promise<string | null> {
  if (type === "VIDEO") {
    const text = String(formData.get("urlText") ?? "").trim();
    return text || current;
  }
  const file = formData.get("urlFile");
  const remove = formData.get("urlFileRemove") === "true";
  if (file instanceof File && file.size > 0) return saveImageUpload(file, "gallery");
  if (remove) return null;
  return current;
}

async function resolveThumbnail(formData: FormData, current: string | null): Promise<string | null> {
  const file = formData.get("thumbnailUrlFile");
  const remove = formData.get("thumbnailUrlFileRemove") === "true";
  if (file instanceof File && file.size > 0) return saveImageUpload(file, "gallery");
  if (remove) return null;
  return current;
}

function parseInput(formData: FormData) {
  return galleryItemSchema.safeParse({
    title: formData.get("title"),
    type: formData.get("type") ?? "IMAGE",
    category: formData.get("category") ?? "",
    order: formData.get("order") ?? 0,
  });
}

export async function createGalleryItem(formData: FormData): Promise<ActionResult> {
  let admin;
  try {
    admin = await requireAdmin();
  } catch (error) {
    if (error instanceof UnauthorizedError) return { success: false, message: error.message };
    throw error;
  }

  const parsed = parseInput(formData);
  if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid input." };

  let url: string | null;
  let thumbnailUrl: string | null;
  try {
    url = await resolveUrl(formData, parsed.data.type, null);
    thumbnailUrl = await resolveThumbnail(formData, null);
  } catch (error) {
    if (error instanceof UploadValidationError) return { success: false, message: error.message };
    throw error;
  }

  if (!url) {
    return {
      success: false,
      message: parsed.data.type === "VIDEO" ? "A video URL is required." : "An image is required.",
    };
  }

  const created = await prisma.galleryItem.create({
    data: {
      title: parsed.data.title,
      type: parsed.data.type,
      category: parsed.data.category || null,
      order: parsed.data.order,
      url,
      thumbnailUrl,
    },
  });

  await logAudit({ actorEmail: admin.email!, action: "CREATE", entityType: "GalleryItem", entityId: created.id });
  revalidatePath("/gallery");
  revalidatePath("/admin/gallery");
  return { success: true, message: "Gallery item added." };
}

export async function updateGalleryItem(id: string, formData: FormData): Promise<ActionResult> {
  let admin;
  try {
    admin = await requireAdmin();
  } catch (error) {
    if (error instanceof UnauthorizedError) return { success: false, message: error.message };
    throw error;
  }

  const existing = await prisma.galleryItem.findUnique({ where: { id } });
  if (!existing) return { success: false, message: "Gallery item not found." };

  const parsed = parseInput(formData);
  if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid input." };

  let url: string | null;
  let thumbnailUrl: string | null;
  try {
    url = await resolveUrl(formData, parsed.data.type, existing.type === parsed.data.type ? existing.url : null);
    thumbnailUrl = await resolveThumbnail(formData, existing.thumbnailUrl);
  } catch (error) {
    if (error instanceof UploadValidationError) return { success: false, message: error.message };
    throw error;
  }

  if (!url) {
    return {
      success: false,
      message: parsed.data.type === "VIDEO" ? "A video URL is required." : "An image is required.",
    };
  }

  await prisma.galleryItem.update({
    where: { id },
    data: {
      title: parsed.data.title,
      type: parsed.data.type,
      category: parsed.data.category || null,
      order: parsed.data.order,
      url,
      thumbnailUrl,
    },
  });

  await logAudit({ actorEmail: admin.email!, action: "UPDATE", entityType: "GalleryItem", entityId: id });
  revalidatePath("/gallery");
  revalidatePath("/admin/gallery");
  return { success: true, message: "Gallery item updated." };
}

export async function softDeleteGalleryItem(id: string): Promise<ActionResult> {
  let admin;
  try {
    admin = await requireAdmin();
  } catch (error) {
    if (error instanceof UnauthorizedError) return { success: false, message: error.message };
    throw error;
  }

  await prisma.galleryItem.update({ where: { id }, data: { deletedAt: new Date() } });
  await logAudit({ actorEmail: admin.email!, action: "DELETE", entityType: "GalleryItem", entityId: id });
  revalidatePath("/gallery");
  revalidatePath("/admin/gallery");
  return { success: true, message: "Moved to trash." };
}
