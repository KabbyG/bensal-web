"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin, UnauthorizedError } from "@/lib/admin/require-admin";
import { logAudit } from "@/lib/admin/audit";
import { faqSchema } from "@/lib/admin/validations";
import type { ActionResult } from "@/actions/newsletter";

function parseInput(formData: FormData) {
  return faqSchema.safeParse({
    question: formData.get("question"),
    answer: formData.get("answer"),
    category: formData.get("category") ?? "",
    order: formData.get("order") ?? 0,
  });
}

export async function createFaq(formData: FormData): Promise<ActionResult> {
  let admin;
  try {
    admin = await requireAdmin();
  } catch (error) {
    if (error instanceof UnauthorizedError) return { success: false, message: error.message };
    throw error;
  }

  const parsed = parseInput(formData);
  if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid input." };

  const created = await prisma.faq.create({
    data: { ...parsed.data, category: parsed.data.category || null },
  });

  await logAudit({ actorEmail: admin.email!, action: "CREATE", entityType: "Faq", entityId: created.id });
  revalidatePath("/");
  revalidatePath("/admin/faqs");
  return { success: true, message: "FAQ added." };
}

export async function updateFaq(id: string, formData: FormData): Promise<ActionResult> {
  let admin;
  try {
    admin = await requireAdmin();
  } catch (error) {
    if (error instanceof UnauthorizedError) return { success: false, message: error.message };
    throw error;
  }

  const existing = await prisma.faq.findUnique({ where: { id } });
  if (!existing) return { success: false, message: "FAQ not found." };

  const parsed = parseInput(formData);
  if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid input." };

  await prisma.faq.update({
    where: { id },
    data: { ...parsed.data, category: parsed.data.category || null },
  });

  await logAudit({ actorEmail: admin.email!, action: "UPDATE", entityType: "Faq", entityId: id });
  revalidatePath("/");
  revalidatePath("/admin/faqs");
  return { success: true, message: "FAQ updated." };
}

export async function softDeleteFaq(id: string): Promise<ActionResult> {
  let admin;
  try {
    admin = await requireAdmin();
  } catch (error) {
    if (error instanceof UnauthorizedError) return { success: false, message: error.message };
    throw error;
  }

  await prisma.faq.update({ where: { id }, data: { deletedAt: new Date() } });
  await logAudit({ actorEmail: admin.email!, action: "DELETE", entityType: "Faq", entityId: id });
  revalidatePath("/");
  revalidatePath("/admin/faqs");
  return { success: true, message: "Moved to trash." };
}
