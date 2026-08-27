"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin, UnauthorizedError } from "@/lib/admin/require-admin";
import { logAudit } from "@/lib/admin/audit";
import { saveImageUpload, UploadValidationError } from "@/lib/upload";
import { companySchema } from "@/lib/admin/validations";
import { DEFAULT_COMPANY_DATA } from "@/lib/admin/default-company-data";
import type { ActionResult } from "@/actions/newsletter";

function parseJsonField<T>(formData: FormData, name: string, fallback: T): T {
  const raw = formData.get(name);
  if (typeof raw !== "string" || !raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

const IMAGE_FIELD_FOLDERS = {
  logo: "brand",
  logoInverse: "brand",
  favicon: "brand",
  hero: "hero",
  overview: "overview",
} as const;

async function resolveImage(
  formData: FormData,
  fieldName: keyof typeof IMAGE_FIELD_FOLDERS,
  current: string | null
): Promise<string | null> {
  const file = formData.get(`${fieldName}File`);
  const remove = formData.get(`${fieldName}FileRemove`) === "true";
  if (file instanceof File && file.size > 0) {
    return saveImageUpload(file, IMAGE_FIELD_FOLDERS[fieldName]);
  }
  if (remove) return null;
  return current;
}

export async function updateCompany(formData: FormData): Promise<ActionResult> {
  let admin;
  try {
    admin = await requireAdmin();
  } catch (error) {
    if (error instanceof UnauthorizedError) return { success: false, message: error.message };
    throw error;
  }

  // No `if (!existing) return error` guard here on purpose: Company is a
  // singleton that's supposed to be created by `pnpm prisma:seed`, but if
  // that never ran against this database (e.g. a fresh deploy), this form
  // is the only way to create it — so this upserts instead of requiring
  // a row to already exist.
  const existing = await prisma.company.findFirst();

  const parsed = companySchema.safeParse({
    name: formData.get("name"),
    legalName: formData.get("legalName"),
    slogan: formData.get("slogan"),
    description: formData.get("description"),
    mission: formData.get("mission"),
    vision: formData.get("vision"),
    foundedYear: formData.get("foundedYear"),
    staffCount: formData.get("staffCount"),
    email: formData.get("email"),
    altEmails: formData.getAll("altEmails"),
    phone: formData.get("phone"),
    altPhones: formData.getAll("altPhones"),
    whatsapp: formData.get("whatsapp"),
    address: formData.get("address"),
    city: formData.get("city"),
    country: formData.get("country"),
    mapEmbedUrl: formData.get("mapEmbedUrl") ?? "",
    businessHours: parseJsonField(formData, "businessHours", []),
    socials: parseJsonField(formData, "socials", {}),
    stats: parseJsonField(formData, "stats", []),
    branches: formData.getAll("branches"),
    contractHistory: parseJsonField(formData, "contractHistory", []),
    seoTitle: formData.get("seoTitle") ?? "",
    seoDescription: formData.get("seoDescription") ?? "",
  });

  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const data = parsed.data;

  let logoUrl: string | null;
  let logoInverseUrl: string | null;
  let faviconUrl: string | null;
  let heroImageUrl: string | null;
  let overviewImageUrl: string | null;
  try {
    logoUrl = await resolveImage(formData, "logo", existing?.logoUrl ?? DEFAULT_COMPANY_DATA.logoUrl);
    logoInverseUrl = await resolveImage(
      formData,
      "logoInverse",
      existing?.logoInverseUrl ?? DEFAULT_COMPANY_DATA.logoInverseUrl
    );
    faviconUrl = await resolveImage(formData, "favicon", existing?.faviconUrl ?? DEFAULT_COMPANY_DATA.faviconUrl);
    heroImageUrl = await resolveImage(formData, "hero", existing?.heroImageUrl ?? DEFAULT_COMPANY_DATA.heroImageUrl);
    overviewImageUrl = await resolveImage(
      formData,
      "overview",
      existing?.overviewImageUrl ?? DEFAULT_COMPANY_DATA.overviewImageUrl
    );
  } catch (error) {
    if (error instanceof UploadValidationError) return { success: false, message: error.message };
    throw error;
  }

  const companyData = {
    name: data.name,
    legalName: data.legalName,
    slogan: data.slogan,
    description: data.description,
    mission: data.mission,
    vision: data.vision,
    foundedYear: data.foundedYear,
    staffCount: data.staffCount,
    email: data.email,
    altEmails: data.altEmails,
    phone: data.phone,
    altPhones: data.altPhones,
    whatsapp: data.whatsapp,
    address: data.address,
    city: data.city,
    country: data.country,
    mapEmbedUrl: data.mapEmbedUrl || null,
    businessHours: data.businessHours,
    socials: data.socials,
    stats: data.stats,
    branches: data.branches,
    contractHistory: data.contractHistory,
    seoTitle: data.seoTitle || null,
    seoDescription: data.seoDescription || null,
    logoUrl,
    logoInverseUrl,
    faviconUrl,
    heroImageUrl,
    overviewImageUrl,
  };

  const saved = existing
    ? await prisma.company.update({ where: { id: existing.id }, data: companyData })
    : await prisma.company.create({ data: companyData });

  await logAudit({
    actorEmail: admin.email!,
    action: existing ? "UPDATE" : "CREATE",
    entityType: "Company",
    entityId: saved.id,
  });

  revalidatePath("/", "layout");

  return { success: true, message: existing ? "Company settings updated." : "Company profile created." };
}
