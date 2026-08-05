import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/png",
  "image/jpeg",
  "application/zip",
  "application/x-zip-compressed",
  "application/vnd.rar",
  "application/x-rar-compressed",
]);

const IMAGE_MIME_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/svg+xml", "image/gif"]);

const MAX_SIZE_BYTES = Number(process.env.MAX_UPLOAD_SIZE_MB ?? 20) * 1024 * 1024;

export class UploadValidationError extends Error {}

function sanitizeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-100);
}

export type ImageUploadFolder =
  | "brand"
  | "team"
  | "services"
  | "products"
  | "projects"
  | "gallery"
  | "news"
  | "testimonials"
  | "partners"
  | "clients";

/**
 * Same validate-and-persist pattern as `saveUpload`, scoped to image mime
 * types, for admin-managed images (logos, photos, gallery, product/project
 * images, news covers). Files land under `public/uploads/<folder>` exactly
 * like the public contact/career upload flow.
 */
export async function saveImageUpload(file: File, folder: ImageUploadFolder): Promise<string> {
  if (file.size === 0) {
    throw new UploadValidationError("The uploaded file is empty.");
  }

  if (file.size > MAX_SIZE_BYTES) {
    throw new UploadValidationError(
      `File exceeds the ${process.env.MAX_UPLOAD_SIZE_MB ?? 20}MB limit.`
    );
  }

  if (!IMAGE_MIME_TYPES.has(file.type)) {
    throw new UploadValidationError("Unsupported image type. Allowed: PNG, JPG, WEBP, GIF, SVG.");
  }

  const uploadRoot = process.env.UPLOAD_DIR ?? "./public/uploads";
  const targetDir = path.join(process.cwd(), uploadRoot.replace("./public", "public"), folder);
  await mkdir(targetDir, { recursive: true });

  const filename = `${randomUUID()}-${sanitizeFilename(file.name)}`;
  const filePath = path.join(targetDir, filename);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  return `/uploads/${folder}/${filename}`;
}

/**
 * Validates and persists an uploaded File to disk under public/uploads/<folder>,
 * returning the public URL. Throws UploadValidationError on invalid type/size.
 */
export async function saveUpload(file: File, folder: "contact" | "careers"): Promise<string> {
  if (file.size === 0) {
    throw new UploadValidationError("The uploaded file is empty.");
  }

  if (file.size > MAX_SIZE_BYTES) {
    throw new UploadValidationError(
      `File exceeds the ${process.env.MAX_UPLOAD_SIZE_MB ?? 20}MB limit.`
    );
  }

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw new UploadValidationError(
      "Unsupported file type. Allowed: PDF, DOC, DOCX, PNG, JPG, JPEG, ZIP, RAR."
    );
  }

  const uploadRoot = process.env.UPLOAD_DIR ?? "./public/uploads";
  const targetDir = path.join(process.cwd(), uploadRoot.replace("./public", "public"), folder);
  await mkdir(targetDir, { recursive: true });

  const filename = `${randomUUID()}-${sanitizeFilename(file.name)}`;
  const filePath = path.join(targetDir, filename);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  return `/uploads/${folder}/${filename}`;
}
