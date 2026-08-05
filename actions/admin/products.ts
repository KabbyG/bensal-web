"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin, UnauthorizedError } from "@/lib/admin/require-admin";
import { logAudit } from "@/lib/admin/audit";
import { saveImageUpload, UploadValidationError } from "@/lib/upload";
import { productSchema } from "@/lib/admin/validations";
import type { ActionResult } from "@/actions/newsletter";

async function resolveImages(formData: FormData, current: string[]): Promise<string[]> {
  const kept = formData.getAll("imagesKeep").map(String);
  const newFiles = formData.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);
  const uploaded: string[] = [];
  for (const file of newFiles) {
    uploaded.push(await saveImageUpload(file, "products"));
  }
  // On create, `current` is empty and `kept` is empty too, so this is just `uploaded`.
  void current;
  return [...kept, ...uploaded];
}

function parseInput(formData: FormData) {
  return productSchema.safeParse({
    slug: formData.get("slug"),
    name: formData.get("name"),
    categoryId: formData.get("categoryId"),
    shortDescription: formData.get("shortDescription"),
    description: formData.get("description"),
    sku: formData.get("sku") ?? "",
    isFeatured: formData.get("isFeatured"),
    status: formData.get("status") ?? "PUBLISHED",
  });
}

export async function createProduct(formData: FormData): Promise<ActionResult> {
  let admin;
  try {
    admin = await requireAdmin();
  } catch (error) {
    if (error instanceof UnauthorizedError) return { success: false, message: error.message };
    throw error;
  }

  const parsed = parseInput(formData);
  if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid input." };

  const slugTaken = await prisma.product.findUnique({ where: { slug: parsed.data.slug } });
  if (slugTaken) return { success: false, message: "That slug is already in use." };

  let images: string[];
  try {
    images = await resolveImages(formData, []);
  } catch (error) {
    if (error instanceof UploadValidationError) return { success: false, message: error.message };
    throw error;
  }

  const created = await prisma.product.create({
    data: { ...parsed.data, sku: parsed.data.sku || null, images },
  });

  await logAudit({ actorEmail: admin.email!, action: "CREATE", entityType: "Product", entityId: created.id });
  revalidatePath("/products");
  revalidatePath(`/products/${created.slug}`);
  revalidatePath("/admin/products");
  return { success: true, message: "Product created." };
}

export async function updateProduct(id: string, formData: FormData): Promise<ActionResult> {
  let admin;
  try {
    admin = await requireAdmin();
  } catch (error) {
    if (error instanceof UnauthorizedError) return { success: false, message: error.message };
    throw error;
  }

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) return { success: false, message: "Product not found." };

  const parsed = parseInput(formData);
  if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid input." };

  if (parsed.data.slug !== existing.slug) {
    const slugTaken = await prisma.product.findUnique({ where: { slug: parsed.data.slug } });
    if (slugTaken) return { success: false, message: "That slug is already in use." };
  }

  let images: string[];
  try {
    images = await resolveImages(formData, existing.images);
  } catch (error) {
    if (error instanceof UploadValidationError) return { success: false, message: error.message };
    throw error;
  }

  await prisma.product.update({
    where: { id },
    data: { ...parsed.data, sku: parsed.data.sku || null, images },
  });

  await logAudit({ actorEmail: admin.email!, action: "UPDATE", entityType: "Product", entityId: id });
  revalidatePath("/products");
  revalidatePath(`/products/${existing.slug}`);
  revalidatePath(`/products/${parsed.data.slug}`);
  revalidatePath("/admin/products");
  return { success: true, message: "Product updated." };
}

export async function softDeleteProduct(id: string): Promise<ActionResult> {
  let admin;
  try {
    admin = await requireAdmin();
  } catch (error) {
    if (error instanceof UnauthorizedError) return { success: false, message: error.message };
    throw error;
  }

  const existing = await prisma.product.update({ where: { id }, data: { deletedAt: new Date() } });
  await logAudit({ actorEmail: admin.email!, action: "DELETE", entityType: "Product", entityId: id });
  revalidatePath("/products");
  revalidatePath(`/products/${existing.slug}`);
  revalidatePath("/admin/products");
  return { success: true, message: "Moved to trash." };
}
