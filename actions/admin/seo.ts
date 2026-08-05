"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin, UnauthorizedError } from "@/lib/admin/require-admin";
import { logAudit } from "@/lib/admin/audit";
import { saveImageUpload, UploadValidationError } from "@/lib/upload";
import { seoMetaSchema } from "@/lib/admin/validations";
import type { ActionResult } from "@/actions/newsletter";

async function resolveOgImage(formData: FormData, current: string | null): Promise<string | null> {
  const file = formData.get("ogImageFile");
  const remove = formData.get("ogImageFileRemove") === "true";
  if (file instanceof File && file.size > 0) return saveImageUpload(file, "brand");
  if (remove) return null;
  return current;
}

function parseInput(formData: FormData) {
  return seoMetaSchema.safeParse({
    page: formData.get("page"),
    title: formData.get("title") ?? "",
    description: formData.get("description") ?? "",
  });
}

export async function createSeoMeta(formData: FormData): Promise<ActionResult> {
  let admin;
  try {
    admin = await requireAdmin();
  } catch (error) {
    if (error instanceof UnauthorizedError) return { success: false, message: error.message };
    throw error;
  }

  const parsed = parseInput(formData);
  if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid input." };

  const pageTaken = await prisma.seoMeta.findUnique({ where: { page: parsed.data.page } });
  if (pageTaken) return { success: false, message: "That page key already has SEO settings." };

  let ogImage: string | null;
  try {
    ogImage = await resolveOgImage(formData, null);
  } catch (error) {
    if (error instanceof UploadValidationError) return { success: false, message: error.message };
    throw error;
  }

  const created = await prisma.seoMeta.create({
    data: {
      page: parsed.data.page,
      title: parsed.data.title || null,
      description: parsed.data.description || null,
      ogImage,
    },
  });

  await logAudit({ actorEmail: admin.email!, action: "CREATE", entityType: "SeoMeta", entityId: created.id });
  revalidatePath("/", "layout");
  revalidatePath("/admin/seo");
  return { success: true, message: "SEO entry created." };
}

export async function updateSeoMeta(id: string, formData: FormData): Promise<ActionResult> {
  let admin;
  try {
    admin = await requireAdmin();
  } catch (error) {
    if (error instanceof UnauthorizedError) return { success: false, message: error.message };
    throw error;
  }

  const existing = await prisma.seoMeta.findUnique({ where: { id } });
  if (!existing) return { success: false, message: "SEO entry not found." };

  const parsed = parseInput(formData);
  if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid input." };

  if (parsed.data.page !== existing.page) {
    const pageTaken = await prisma.seoMeta.findUnique({ where: { page: parsed.data.page } });
    if (pageTaken) return { success: false, message: "That page key already has SEO settings." };
  }

  let ogImage: string | null;
  try {
    ogImage = await resolveOgImage(formData, existing.ogImage);
  } catch (error) {
    if (error instanceof UploadValidationError) return { success: false, message: error.message };
    throw error;
  }

  await prisma.seoMeta.update({
    where: { id },
    data: {
      page: parsed.data.page,
      title: parsed.data.title || null,
      description: parsed.data.description || null,
      ogImage,
    },
  });

  await logAudit({ actorEmail: admin.email!, action: "UPDATE", entityType: "SeoMeta", entityId: id });
  revalidatePath("/", "layout");
  revalidatePath("/admin/seo");
  return { success: true, message: "SEO entry updated." };
}

export async function deleteSeoMeta(id: string): Promise<ActionResult> {
  let admin;
  try {
    admin = await requireAdmin();
  } catch (error) {
    if (error instanceof UnauthorizedError) return { success: false, message: error.message };
    throw error;
  }

  await prisma.seoMeta.delete({ where: { id } });
  await logAudit({ actorEmail: admin.email!, action: "DELETE", entityType: "SeoMeta", entityId: id });
  revalidatePath("/", "layout");
  revalidatePath("/admin/seo");
  return { success: true, message: "SEO entry deleted." };
}
