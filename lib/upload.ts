import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { put } from "@vercel/blob";
import sharp from "sharp";

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

// Vercel caps serverless function request bodies at a hard, non-configurable
// 4.5MB — see the bodySizeLimit comment in next.config.ts. 3MB per file
// leaves room for the rest of the form's fields (and, on the career form,
// more than one file in the same submission) to stay under that ceiling.
const MAX_SIZE_BYTES = Number(process.env.MAX_UPLOAD_SIZE_MB ?? 3) * 1024 * 1024;

export class UploadValidationError extends Error {}

function sanitizeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-100);
}

function validate(file: File, allowed: Set<string>, message: string) {
  if (file.size === 0) {
    throw new UploadValidationError("The uploaded file is empty.");
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new UploadValidationError(`File exceeds the ${process.env.MAX_UPLOAD_SIZE_MB ?? 3}MB limit.`);
  }
  if (!allowed.has(file.type)) {
    throw new UploadValidationError(message);
  }
}

/**
 * Persists a buffer under `<folder>/<filename>` and returns its public URL.
 * Uses Vercel Blob when `BLOB_READ_WRITE_TOKEN` is set (Vercel's serverless
 * filesystem is ephemeral/read-only outside `/tmp`); otherwise writes to
 * local disk under `public/uploads/<folder>` — the path Docker mounts a
 * persistent volume at for local/self-hosted deployments.
 */
async function persistBuffer(buffer: Buffer, filename: string, folder: string): Promise<string> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`${folder}/${filename}`, buffer, {
      access: "public",
      addRandomSuffix: false,
    });
    return blob.url;
  }

  const uploadRoot = process.env.UPLOAD_DIR ?? "./public/uploads";
  const targetDir = path.join(process.cwd(), uploadRoot.replace("./public", "public"), folder);
  await mkdir(targetDir, { recursive: true });

  const filePath = path.join(targetDir, filename);
  await writeFile(filePath, buffer);

  return `/uploads/${folder}/${filename}`;
}

async function persist(file: File, folder: string): Promise<string> {
  const filename = `${randomUUID()}-${sanitizeFilename(file.name)}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  return persistBuffer(buffer, filename, folder);
}

// Nothing on the site renders an image wider than this — resizing anything
// bigger down to it (without upscaling smaller ones), on top of recompressing,
// is what turns a multi-megabyte admin upload (e.g. a straight-from-camera
// partner logo) into the tens-to-low-hundreds of KB actually served.
const MAX_IMAGE_DIMENSION = 2400;

/**
 * Re-encodes a raster image at a bounded size and a lossy-but-clean
 * compression level. SVG (vector) and GIF (may be animated) pass through
 * untouched — sharp's raster pipeline isn't the right tool for either.
 */
async function optimizeImage(buffer: Buffer, mimeType: string): Promise<Buffer> {
  if (mimeType === "image/svg+xml" || mimeType === "image/gif") {
    return buffer;
  }

  const pipeline = sharp(buffer)
    .rotate() // apply EXIF orientation before the metadata that stores it is stripped
    .resize({
      width: MAX_IMAGE_DIMENSION,
      height: MAX_IMAGE_DIMENSION,
      fit: "inside",
      withoutEnlargement: true,
    });

  if (mimeType === "image/jpeg") return pipeline.jpeg({ quality: 82, mozjpeg: true }).toBuffer();
  if (mimeType === "image/webp") return pipeline.webp({ quality: 82 }).toBuffer();
  return pipeline.png({ compressionLevel: 9 }).toBuffer();
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

  const filename = `${randomUUID()}-${sanitizeFilename(file.name)}`;
  const rawBuffer = Buffer.from(await file.arrayBuffer());
  const optimized = await optimizeImage(rawBuffer, file.type);

  return persistBuffer(optimized, filename, folder);
}

/**
 * Validate-and-persist for public contact/career file attachments, and
 * admin-managed documents (e.g. the NeST business-line certificate PDF).
 */
export async function saveUpload(file: File, folder: "contact" | "careers" | "nest"): Promise<string> {
  validate(file, ALLOWED_MIME_TYPES, "Unsupported file type. Allowed: PDF, DOC, DOCX, PNG, JPG, JPEG, ZIP, RAR.");
  return persist(file, folder);
}
