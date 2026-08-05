"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin, UnauthorizedError } from "@/lib/admin/require-admin";
import { logAudit } from "@/lib/admin/audit";
import { saveImageUpload, UploadValidationError } from "@/lib/upload";
import { teamMemberSchema } from "@/lib/admin/validations";
import type { ActionResult } from "@/actions/newsletter";

async function resolvePhoto(formData: FormData, current: string | null): Promise<string | null> {
  const file = formData.get("photoFile");
  const remove = formData.get("photoFileRemove") === "true";
  if (file instanceof File && file.size > 0) return saveImageUpload(file, "team");
  if (remove) return null;
  return current;
}

function parseInput(formData: FormData) {
  return teamMemberSchema.safeParse({
    name: formData.get("name"),
    title: formData.get("title"),
    bio: formData.get("bio") ?? "",
    isLeadership: formData.get("isLeadership"),
    order: formData.get("order") ?? 0,
  });
}

export async function createTeamMember(formData: FormData): Promise<ActionResult> {
  let admin;
  try {
    admin = await requireAdmin();
  } catch (error) {
    if (error instanceof UnauthorizedError) return { success: false, message: error.message };
    throw error;
  }

  const parsed = parseInput(formData);
  if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid input." };

  let photoUrl: string | null;
  try {
    photoUrl = await resolvePhoto(formData, null);
  } catch (error) {
    if (error instanceof UploadValidationError) return { success: false, message: error.message };
    throw error;
  }

  const created = await prisma.teamMember.create({
    data: { ...parsed.data, bio: parsed.data.bio || null, photoUrl },
  });

  await logAudit({ actorEmail: admin.email!, action: "CREATE", entityType: "TeamMember", entityId: created.id });
  revalidatePath("/about");
  revalidatePath("/admin/team");
  return { success: true, message: "Team member added." };
}

export async function updateTeamMember(id: string, formData: FormData): Promise<ActionResult> {
  let admin;
  try {
    admin = await requireAdmin();
  } catch (error) {
    if (error instanceof UnauthorizedError) return { success: false, message: error.message };
    throw error;
  }

  const existing = await prisma.teamMember.findUnique({ where: { id } });
  if (!existing) return { success: false, message: "Team member not found." };

  const parsed = parseInput(formData);
  if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid input." };

  let photoUrl: string | null;
  try {
    photoUrl = await resolvePhoto(formData, existing.photoUrl);
  } catch (error) {
    if (error instanceof UploadValidationError) return { success: false, message: error.message };
    throw error;
  }

  await prisma.teamMember.update({
    where: { id },
    data: { ...parsed.data, bio: parsed.data.bio || null, photoUrl },
  });

  await logAudit({ actorEmail: admin.email!, action: "UPDATE", entityType: "TeamMember", entityId: id });
  revalidatePath("/about");
  revalidatePath("/admin/team");
  return { success: true, message: "Team member updated." };
}

export async function softDeleteTeamMember(id: string): Promise<ActionResult> {
  let admin;
  try {
    admin = await requireAdmin();
  } catch (error) {
    if (error instanceof UnauthorizedError) return { success: false, message: error.message };
    throw error;
  }

  await prisma.teamMember.update({ where: { id }, data: { deletedAt: new Date() } });
  await logAudit({ actorEmail: admin.email!, action: "DELETE", entityType: "TeamMember", entityId: id });
  revalidatePath("/about");
  revalidatePath("/admin/team");
  return { success: true, message: "Moved to trash." };
}
