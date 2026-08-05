"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin, UnauthorizedError } from "@/lib/admin/require-admin";
import { logAudit } from "@/lib/admin/audit";
import { menuItemSchema } from "@/lib/admin/validations";
import type { ActionResult } from "@/actions/newsletter";

function parseInput(formData: FormData) {
  return menuItemSchema.safeParse({
    label: formData.get("label"),
    url: formData.get("url"),
    parentId: formData.get("parentId") ?? "",
    openInNewTab: formData.get("openInNewTab"),
  });
}

export async function createMenuItem(menuId: string, formData: FormData): Promise<ActionResult> {
  let admin;
  try {
    admin = await requireAdmin();
  } catch (error) {
    if (error instanceof UnauthorizedError) return { success: false, message: error.message };
    throw error;
  }

  const parsed = parseInput(formData);
  if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid input." };

  const siblingCount = await prisma.menuItem.count({
    where: { menuId, parentId: parsed.data.parentId || null },
  });

  const created = await prisma.menuItem.create({
    data: {
      menuId,
      label: parsed.data.label,
      url: parsed.data.url,
      openInNewTab: parsed.data.openInNewTab,
      parentId: parsed.data.parentId || null,
      order: siblingCount,
    },
  });

  await logAudit({ actorEmail: admin.email!, action: "CREATE", entityType: "MenuItem", entityId: created.id });
  revalidatePath("/", "layout");
  revalidatePath("/admin/menus");
  return { success: true, message: "Menu item added." };
}

export async function updateMenuItem(id: string, formData: FormData): Promise<ActionResult> {
  let admin;
  try {
    admin = await requireAdmin();
  } catch (error) {
    if (error instanceof UnauthorizedError) return { success: false, message: error.message };
    throw error;
  }

  const existing = await prisma.menuItem.findUnique({ where: { id } });
  if (!existing) return { success: false, message: "Menu item not found." };

  const parsed = parseInput(formData);
  if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid input." };

  if (parsed.data.parentId === id) {
    return { success: false, message: "An item can't be its own parent." };
  }

  await prisma.menuItem.update({
    where: { id },
    data: {
      label: parsed.data.label,
      url: parsed.data.url,
      openInNewTab: parsed.data.openInNewTab,
      parentId: parsed.data.parentId || null,
    },
  });

  await logAudit({ actorEmail: admin.email!, action: "UPDATE", entityType: "MenuItem", entityId: id });
  revalidatePath("/", "layout");
  revalidatePath("/admin/menus");
  return { success: true, message: "Menu item updated." };
}

export async function deleteMenuItem(id: string): Promise<ActionResult> {
  let admin;
  try {
    admin = await requireAdmin();
  } catch (error) {
    if (error instanceof UnauthorizedError) return { success: false, message: error.message };
    throw error;
  }

  await prisma.menuItem.delete({ where: { id } });
  await logAudit({ actorEmail: admin.email!, action: "DELETE", entityType: "MenuItem", entityId: id });
  revalidatePath("/", "layout");
  revalidatePath("/admin/menus");
  return { success: true, message: "Menu item deleted." };
}

export async function reorderMenuItems(orderedIds: string[]): Promise<ActionResult> {
  let admin;
  try {
    admin = await requireAdmin();
  } catch (error) {
    if (error instanceof UnauthorizedError) return { success: false, message: error.message };
    throw error;
  }

  await Promise.all(
    orderedIds.map((id, order) => prisma.menuItem.update({ where: { id }, data: { order } }))
  );

  await logAudit({ actorEmail: admin.email!, action: "UPDATE", entityType: "MenuItem", meta: { reordered: orderedIds } });
  revalidatePath("/", "layout");
  revalidatePath("/admin/menus");
  return { success: true, message: "Order updated." };
}
