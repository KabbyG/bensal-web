"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin, UnauthorizedError } from "@/lib/admin/require-admin";
import { logAudit } from "@/lib/admin/audit";
import { saveImageUpload, UploadValidationError } from "@/lib/upload";
import { testimonialSchema } from "@/lib/admin/validations";
import type { ActionResult } from "@/actions/newsletter";

async function resolveAvatar(formData: FormData, current: string | null): Promise<string | null> {
  const file = formData.get("avatarUrlFile");
  const remove = formData.get("avatarUrlFileRemove") === "true";
  if (file instanceof File && file.size > 0) return saveImageUpload(file, "testimonials");
  if (remove) return null;
  return current;
}

function parseInput(formData: FormData) {
  return testimonialSchema.safeParse({
    name: formData.get("name"),
    company: formData.get("company") ?? "",
    role: formData.get("role") ?? "",
    message: formData.get("message"),
    rating: formData.get("rating") ?? 5,
    order: formData.get("order") ?? 0,
    published: formData.get("published"),
  });
}

export async function createTestimonial(formData: FormData): Promise<ActionResult> {
  let admin;
  try {
    admin = await requireAdmin();
  } catch (error) {
    if (error instanceof UnauthorizedError) return { success: false, message: error.message };
    throw error;
  }

  const parsed = parseInput(formData);
  if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid input." };

  let avatarUrl: string | null;
  try {
    avatarUrl = await resolveAvatar(formData, null);
  } catch (error) {
    if (error instanceof UploadValidationError) return { success: false, message: error.message };
    throw error;
  }

  const created = await prisma.testimonial.create({
    data: { ...parsed.data, company: parsed.data.company || null, role: parsed.data.role || null, avatarUrl },
  });

  await logAudit({ actorEmail: admin.email!, action: "CREATE", entityType: "Testimonial", entityId: created.id });
  revalidatePath("/");
  revalidatePath("/admin/testimonials");
  return { success: true, message: "Testimonial added." };
}

export async function updateTestimonial(id: string, formData: FormData): Promise<ActionResult> {
  let admin;
  try {
    admin = await requireAdmin();
  } catch (error) {
    if (error instanceof UnauthorizedError) return { success: false, message: error.message };
    throw error;
  }

  const existing = await prisma.testimonial.findUnique({ where: { id } });
  if (!existing) return { success: false, message: "Testimonial not found." };

  const parsed = parseInput(formData);
  if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid input." };

  let avatarUrl: string | null;
  try {
    avatarUrl = await resolveAvatar(formData, existing.avatarUrl);
  } catch (error) {
    if (error instanceof UploadValidationError) return { success: false, message: error.message };
    throw error;
  }

  await prisma.testimonial.update({
    where: { id },
    data: { ...parsed.data, company: parsed.data.company || null, role: parsed.data.role || null, avatarUrl },
  });

  await logAudit({ actorEmail: admin.email!, action: "UPDATE", entityType: "Testimonial", entityId: id });
  revalidatePath("/");
  revalidatePath("/admin/testimonials");
  return { success: true, message: "Testimonial updated." };
}

export async function softDeleteTestimonial(id: string): Promise<ActionResult> {
  let admin;
  try {
    admin = await requireAdmin();
  } catch (error) {
    if (error instanceof UnauthorizedError) return { success: false, message: error.message };
    throw error;
  }

  await prisma.testimonial.update({ where: { id }, data: { deletedAt: new Date() } });
  await logAudit({ actorEmail: admin.email!, action: "DELETE", entityType: "Testimonial", entityId: id });
  revalidatePath("/");
  revalidatePath("/admin/testimonials");
  return { success: true, message: "Moved to trash." };
}
