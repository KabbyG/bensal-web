"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin, UnauthorizedError } from "@/lib/admin/require-admin";
import { logAudit } from "@/lib/admin/audit";
import { saveImageUpload, UploadValidationError } from "@/lib/upload";
import { newsPostSchema } from "@/lib/admin/validations";
import type { ActionResult } from "@/actions/newsletter";

async function resolveCoverImage(formData: FormData, current: string | null): Promise<string | null> {
  const file = formData.get("coverImageFile");
  const remove = formData.get("coverImageFileRemove") === "true";
  if (file instanceof File && file.size > 0) return saveImageUpload(file, "news");
  if (remove) return null;
  return current;
}

function parseInput(formData: FormData) {
  return newsPostSchema.safeParse({
    slug: formData.get("slug"),
    title: formData.get("title"),
    excerpt: formData.get("excerpt"),
    content: formData.get("content"),
    category: formData.get("category") ?? "",
    tags: formData.getAll("tags"),
    author: formData.get("author") ?? "",
    published: formData.get("published"),
    seoTitle: formData.get("seoTitle") ?? "",
    seoDescription: formData.get("seoDescription") ?? "",
  });
}

export async function createNewsPost(formData: FormData): Promise<ActionResult> {
  let admin;
  try {
    admin = await requireAdmin();
  } catch (error) {
    if (error instanceof UnauthorizedError) return { success: false, message: error.message };
    throw error;
  }

  const parsed = parseInput(formData);
  if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid input." };

  const slugTaken = await prisma.newsPost.findUnique({ where: { slug: parsed.data.slug } });
  if (slugTaken) return { success: false, message: "That slug is already in use." };

  let coverImage: string | null;
  try {
    coverImage = await resolveCoverImage(formData, null);
  } catch (error) {
    if (error instanceof UploadValidationError) return { success: false, message: error.message };
    throw error;
  }

  const created = await prisma.newsPost.create({
    data: {
      ...parsed.data,
      category: parsed.data.category || null,
      author: parsed.data.author || null,
      seoTitle: parsed.data.seoTitle || null,
      seoDescription: parsed.data.seoDescription || null,
      coverImage,
      publishedAt: parsed.data.published ? new Date() : null,
    },
  });

  await logAudit({ actorEmail: admin.email!, action: "CREATE", entityType: "NewsPost", entityId: created.id });
  revalidatePath("/news");
  revalidatePath(`/news/${created.slug}`);
  revalidatePath("/admin/news");
  return { success: true, message: "News post created." };
}

export async function updateNewsPost(id: string, formData: FormData): Promise<ActionResult> {
  let admin;
  try {
    admin = await requireAdmin();
  } catch (error) {
    if (error instanceof UnauthorizedError) return { success: false, message: error.message };
    throw error;
  }

  const existing = await prisma.newsPost.findUnique({ where: { id } });
  if (!existing) return { success: false, message: "News post not found." };

  const parsed = parseInput(formData);
  if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid input." };

  if (parsed.data.slug !== existing.slug) {
    const slugTaken = await prisma.newsPost.findUnique({ where: { slug: parsed.data.slug } });
    if (slugTaken) return { success: false, message: "That slug is already in use." };
  }

  let coverImage: string | null;
  try {
    coverImage = await resolveCoverImage(formData, existing.coverImage);
  } catch (error) {
    if (error instanceof UploadValidationError) return { success: false, message: error.message };
    throw error;
  }

  await prisma.newsPost.update({
    where: { id },
    data: {
      ...parsed.data,
      category: parsed.data.category || null,
      author: parsed.data.author || null,
      seoTitle: parsed.data.seoTitle || null,
      seoDescription: parsed.data.seoDescription || null,
      coverImage,
      publishedAt: parsed.data.published ? existing.publishedAt ?? new Date() : existing.publishedAt,
    },
  });

  await logAudit({ actorEmail: admin.email!, action: "UPDATE", entityType: "NewsPost", entityId: id });
  revalidatePath("/news");
  revalidatePath(`/news/${existing.slug}`);
  revalidatePath(`/news/${parsed.data.slug}`);
  revalidatePath("/admin/news");
  return { success: true, message: "News post updated." };
}

export async function softDeleteNewsPost(id: string): Promise<ActionResult> {
  let admin;
  try {
    admin = await requireAdmin();
  } catch (error) {
    if (error instanceof UnauthorizedError) return { success: false, message: error.message };
    throw error;
  }

  const existing = await prisma.newsPost.update({ where: { id }, data: { deletedAt: new Date() } });
  await logAudit({ actorEmail: admin.email!, action: "DELETE", entityType: "NewsPost", entityId: id });
  revalidatePath("/news");
  revalidatePath(`/news/${existing.slug}`);
  revalidatePath("/admin/news");
  return { success: true, message: "Moved to trash." };
}
