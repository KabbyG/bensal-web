import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { put } from "@vercel/blob";

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

function validate(file: File, allowed: Set<string>, message: string) {
  if (file.size === 0) {
    throw new UploadValidationError("The uploaded file is empty.");
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new UploadValidationError(`File exceeds the ${process.env.MAX_UPLOAD_SIZE_MB ?? 20}MB limit.`);
  }
  if (!allowed.has(file.type)) {
    throw new UploadValidationError(message);
  }
}

/**
 * Persists a validated file under `<folder>/<uuid>-<name>` and returns its
 * public URL. Uses Vercel Blob when `BLOB_READ_WRITE_TOKEN` is set (Vercel's
 * serverless filesystem is ephemeral/read-only outside `/tmp`); otherwise
 * writes to local disk under `public/uploads/<folder>` — the path Docker
 * mounts a persistent volume at for local/self-hosted deployments.
 */
async function persist(file: File, folder: string): Promise<string> {
  const filename = `${randomUUID()}-${sanitizeFilename(file.name)}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`${folder}/${filename}`, file, {
      access: "public",
      addRandomSuffix: false,
    });
    return blob.url;
  }

  const uploadRoot = process.env.UPLOAD_DIR ?? "./public/uploads";
  const targetDir = path.join(process.cwd(), uploadRoot.replace("./public", "public"), folder);
  await mkdir(targetDir, { recursive: true });

  const filePath = path.join(targetDir, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  return `/uploads/${folder}/${filename}`;
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
 * Validate-and-persist for admin-managed images (logos, photos, gallery,
 * product/project images, news covers).
 */
export async function saveImageUpload(file: File, folder: ImageUploadFolder): Promise<string> {
  validate(file, IMAGE_MIME_TYPES, "Unsupported image type. Allowed: PNG, JPG, WEBP, GIF, SVG.");
  return persist(file, folder);
}

/**
 * Validate-and-persist for public contact/career file attachments.
 */
export async function saveUpload(file: File, folder: "contact" | "careers"): Promise<string> {
  validate(file, ALLOWED_MIME_TYPES, "Unsupported file type. Allowed: PDF, DOC, DOCX, PNG, JPG, JPEG, ZIP, RAR.");
  return persist(file, folder);
}
