"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin, UnauthorizedError } from "@/lib/admin/require-admin";
import { logAudit } from "@/lib/admin/audit";
import { saveImageUpload, UploadValidationError } from "@/lib/upload";
import { projectSchema } from "@/lib/admin/validations";
import type { ActionResult } from "@/actions/newsletter";

async function resolveCoverImage(formData: FormData, current: string | null): Promise<string | null> {
  const file = formData.get("coverImageFile");
  const remove = formData.get("coverImageFileRemove") === "true";
  if (file instanceof File && file.size > 0) return saveImageUpload(file, "projects");
  if (remove) return null;
  return current;
}

async function resolveImages(formData: FormData): Promise<string[]> {
  const kept = formData.getAll("imagesKeep").map(String);
  const newFiles = formData.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);
  const uploaded: string[] = [];
  for (const file of newFiles) {
    uploaded.push(await saveImageUpload(file, "projects"));
  }
  return [...kept, ...uploaded];
}

function parseInput(formData: FormData) {
  return projectSchema.safeParse({
    slug: formData.get("slug"),
    title: formData.get("title"),
    client: formData.get("client") ?? "",
    category: formData.get("category"),
    location: formData.get("location") ?? "",
    year: formData.get("year") || undefined,
    summary: formData.get("summary"),
    description: formData.get("description"),
    status: formData.get("status") ?? "COMPLETED",
  });
}

export async function createProject(formData: FormData): Promise<ActionResult> {
  let admin;
  try {
    admin = await requireAdmin();
  } catch (error) {
    if (error instanceof UnauthorizedError) return { success: false, message: error.message };
    throw error;
  }

  const parsed = parseInput(formData);
  if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid input." };

  const slugTaken = await prisma.project.findUnique({ where: { slug: parsed.data.slug } });
  if (slugTaken) return { success: false, message: "That slug is already in use." };

  let coverImage: string | null;
  let images: string[];
  try {
    coverImage = await resolveCoverImage(formData, null);
    images = await resolveImages(formData);
  } catch (error) {
    if (error instanceof UploadValidationError) return { success: false, message: error.message };
    throw error;
  }

  const created = await prisma.project.create({
    data: {
      ...parsed.data,
      client: parsed.data.client || null,
      location: parsed.data.location || null,
      year: parsed.data.year ?? null,
      coverImage,
      images,
    },
  });

  await logAudit({ actorEmail: admin.email!, action: "CREATE", entityType: "Project", entityId: created.id });
  revalidatePath("/projects");
  revalidatePath(`/projects/${created.slug}`);
  revalidatePath("/admin/projects");
  return { success: true, message: "Project created." };
}

export async function updateProject(id: string, formData: FormData): Promise<ActionResult> {
  let admin;
  try {
    admin = await requireAdmin();
  } catch (error) {
    if (error instanceof UnauthorizedError) return { success: false, message: error.message };
    throw error;
  }

  const existing = await prisma.project.findUnique({ where: { id } });
  if (!existing) return { success: false, message: "Project not found." };

  const parsed = parseInput(formData);
  if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid input." };

  if (parsed.data.slug !== existing.slug) {
    const slugTaken = await prisma.project.findUnique({ where: { slug: parsed.data.slug } });
    if (slugTaken) return { success: false, message: "That slug is already in use." };
  }

  let coverImage: string | null;
  let images: string[];
  try {
    coverImage = await resolveCoverImage(formData, existing.coverImage);
    images = await resolveImages(formData);
  } catch (error) {
    if (error instanceof UploadValidationError) return { success: false, message: error.message };
    throw error;
  }

  await prisma.project.update({
    where: { id },
    data: {
      ...parsed.data,
      client: parsed.data.client || null,
      location: parsed.data.location || null,
      year: parsed.data.year ?? null,
      coverImage,
      images,
    },
  });

  await logAudit({ actorEmail: admin.email!, action: "UPDATE", entityType: "Project", entityId: id });
  revalidatePath("/projects");
  revalidatePath(`/projects/${existing.slug}`);
  revalidatePath(`/projects/${parsed.data.slug}`);
  revalidatePath("/admin/projects");
  return { success: true, message: "Project updated." };
}

export async function softDeleteProject(id: string): Promise<ActionResult> {
  let admin;
  try {
    admin = await requireAdmin();
  } catch (error) {
    if (error instanceof UnauthorizedError) return { success: false, message: error.message };
    throw error;
  }

  const existing = await prisma.project.update({ where: { id }, data: { deletedAt: new Date() } });
  await logAudit({ actorEmail: admin.email!, action: "DELETE", entityType: "Project", entityId: id });
  revalidatePath("/projects");
  revalidatePath(`/projects/${existing.slug}`);
  revalidatePath("/admin/projects");
  return { success: true, message: "Moved to trash." };
}
