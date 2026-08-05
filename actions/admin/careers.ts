"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin, UnauthorizedError } from "@/lib/admin/require-admin";
import { logAudit } from "@/lib/admin/audit";
import { jobPostingSchema } from "@/lib/admin/validations";
import type { ActionResult } from "@/actions/newsletter";

function parseInput(formData: FormData) {
  return jobPostingSchema.safeParse({
    slug: formData.get("slug"),
    title: formData.get("title"),
    department: formData.get("department") ?? "",
    location: formData.get("location"),
    type: formData.get("type") ?? "FULL_TIME",
    description: formData.get("description"),
    requirements: formData.get("requirements"),
    isActive: formData.get("isActive"),
    closingDate: formData.get("closingDate") ?? "",
  });
}

export async function createJobPosting(formData: FormData): Promise<ActionResult> {
  let admin;
  try {
    admin = await requireAdmin();
  } catch (error) {
    if (error instanceof UnauthorizedError) return { success: false, message: error.message };
    throw error;
  }

  const parsed = parseInput(formData);
  if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid input." };

  const slugTaken = await prisma.jobPosting.findUnique({ where: { slug: parsed.data.slug } });
  if (slugTaken) return { success: false, message: "That slug is already in use." };

  const created = await prisma.jobPosting.create({
    data: {
      ...parsed.data,
      department: parsed.data.department || null,
      closingDate: parsed.data.closingDate ? new Date(parsed.data.closingDate) : null,
    },
  });

  await logAudit({ actorEmail: admin.email!, action: "CREATE", entityType: "JobPosting", entityId: created.id });
  revalidatePath("/careers");
  revalidatePath("/admin/careers");
  return { success: true, message: "Job posting created." };
}

export async function updateJobPosting(id: string, formData: FormData): Promise<ActionResult> {
  let admin;
  try {
    admin = await requireAdmin();
  } catch (error) {
    if (error instanceof UnauthorizedError) return { success: false, message: error.message };
    throw error;
  }

  const existing = await prisma.jobPosting.findUnique({ where: { id } });
  if (!existing) return { success: false, message: "Job posting not found." };

  const parsed = parseInput(formData);
  if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid input." };

  if (parsed.data.slug !== existing.slug) {
    const slugTaken = await prisma.jobPosting.findUnique({ where: { slug: parsed.data.slug } });
    if (slugTaken) return { success: false, message: "That slug is already in use." };
  }

  await prisma.jobPosting.update({
    where: { id },
    data: {
      ...parsed.data,
      department: parsed.data.department || null,
      closingDate: parsed.data.closingDate ? new Date(parsed.data.closingDate) : null,
    },
  });

  await logAudit({ actorEmail: admin.email!, action: "UPDATE", entityType: "JobPosting", entityId: id });
  revalidatePath("/careers");
  revalidatePath("/admin/careers");
  return { success: true, message: "Job posting updated." };
}

export async function softDeleteJobPosting(id: string): Promise<ActionResult> {
  let admin;
  try {
    admin = await requireAdmin();
  } catch (error) {
    if (error instanceof UnauthorizedError) return { success: false, message: error.message };
    throw error;
  }

  await prisma.jobPosting.update({ where: { id }, data: { deletedAt: new Date() } });
  await logAudit({ actorEmail: admin.email!, action: "DELETE", entityType: "JobPosting", entityId: id });
  revalidatePath("/careers");
  revalidatePath("/admin/careers");
  return { success: true, message: "Moved to trash." };
}
