"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin, UnauthorizedError } from "@/lib/admin/require-admin";
import { logAudit } from "@/lib/admin/audit";
import { saveImageUpload, UploadValidationError } from "@/lib/upload";
import { productCategorySchema } from "@/lib/admin/validations";
import type { ActionResult } from "@/actions/newsletter";

async function resolveImage(formData: FormData, current: string | null): Promise<string | null> {
  const file = formData.get("imageFile");
  const remove = formData.get("imageFileRemove") === "true";
  if (file instanceof File && file.size > 0) return saveImageUpload(file, "products");
  if (remove) return null;
  return current;
}

function parseInput(formData: FormData) {
  return productCategorySchema.safeParse({
    slug: formData.get("slug"),
    name: formData.get("name"),
    description: formData.get("description") ?? "",
    order: formData.get("order") ?? 0,
  });
}

export async function createProductCategory(formData: FormData): Promise<ActionResult> {
  let admin;
  try {
    admin = await requireAdmin();
  } catch (error) {
    if (error instanceof UnauthorizedError) return { success: false, message: error.message };
    throw error;
  }

  const parsed = parseInput(formData);
  if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid input." };

  const slugTaken = await prisma.productCategory.findUnique({ where: { slug: parsed.data.slug } });
  if (slugTaken) return { success: false, message: "That slug is already in use." };

  let image: string | null;
  try {
    image = await resolveImage(formData, null);
  } catch (error) {
    if (error instanceof UploadValidationError) return { success: false, message: error.message };
    throw error;
  }

  const created = await prisma.productCategory.create({
    data: { ...parsed.data, description: parsed.data.description || null, image },
  });

  await logAudit({ actorEmail: admin.email!, action: "CREATE", entityType: "ProductCategory", entityId: created.id });
  revalidatePath("/products");
  revalidatePath("/admin/product-categories");
  return { success: true, message: "Category created." };
}

export async function updateProductCategory(id: string, formData: FormData): Promise<ActionResult> {
  let admin;
  try {
    admin = await requireAdmin();
  } catch (error) {
    if (error instanceof UnauthorizedError) return { success: false, message: error.message };
    throw error;
  }

  const existing = await prisma.productCategory.findUnique({ where: { id } });
  if (!existing) return { success: false, message: "Category not found." };

  const parsed = parseInput(formData);
  if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid input." };

  if (parsed.data.slug !== existing.slug) {
    const slugTaken = await prisma.productCategory.findUnique({ where: { slug: parsed.data.slug } });
    if (slugTaken) return { success: false, message: "That slug is already in use." };
  }

  let image: string | null;
  try {
    image = await resolveImage(formData, existing.image);
  } catch (error) {
    if (error instanceof UploadValidationError) return { success: false, message: error.message };
    throw error;
  }

  await prisma.productCategory.update({
    where: { id },
    data: { ...parsed.data, description: parsed.data.description || null, image },
  });

  await logAudit({ actorEmail: admin.email!, action: "UPDATE", entityType: "ProductCategory", entityId: id });
  revalidatePath("/products");
  revalidatePath("/admin/product-categories");
  return { success: true, message: "Category updated." };
}

export async function softDeleteProductCategory(id: string): Promise<ActionResult> {
  let admin;
  try {
    admin = await requireAdmin();
  } catch (error) {
    if (error instanceof UnauthorizedError) return { success: false, message: error.message };
    throw error;
  }

  const productCount = await prisma.product.count({ where: { categoryId: id, deletedAt: null } });
  if (productCount > 0) {
    return {
      success: false,
      message: `Can't delete — ${productCount} product(s) still use this category. Move or delete them first.`,
    };
  }

  await prisma.productCategory.update({ where: { id }, data: { deletedAt: new Date() } });
  await logAudit({ actorEmail: admin.email!, action: "DELETE", entityType: "ProductCategory", entityId: id });
  revalidatePath("/products");
  revalidatePath("/admin/product-categories");
  return { success: true, message: "Moved to trash." };
}
