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

// Sampled from the logo, same as the CSS custom properties in globals.css.
const BRAND_FOREST = { r: 11, g: 66, b: 51 }; // --brand-forest
const BRAND_LEAF = { r: 98, g: 184, b: 62 }; // --brand-green

function radialGlowSvg(w: number, h: number) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <defs>
      <radialGradient id="g" cx="18%" cy="12%" r="65%">
        <stop offset="0%" stop-color="rgb(${BRAND_LEAF.r},${BRAND_LEAF.g},${BRAND_LEAF.b})" stop-opacity="0.28" />
        <stop offset="100%" stop-color="rgb(${BRAND_LEAF.r},${BRAND_LEAF.g},${BRAND_LEAF.b})" stop-opacity="0" />
      </radialGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)" />
  </svg>`;
}

function vignetteSvg(w: number, h: number) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <defs>
      <radialGradient id="v" cx="50%" cy="46%" r="78%">
        <stop offset="60%" stop-color="black" stop-opacity="0" />
        <stop offset="100%" stop-color="black" stop-opacity="0.22" />
      </radialGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#v)" />
  </svg>`;
}

// Blend strength for the forest tint — how much of the tinted layer shows
// through over the photo's own colors (so a yellow bucket or red mop handle
// stays legible instead of going monochrome).
const TINT_STRENGTH = 0.4;

/**
 * Pushes a photo toward the brand palette: a luminance-preserving tint
 * toward forest green blended back at partial strength, a soft leaf-green
 * glow, and a light vignette for depth. Same recipe used to grade the
 * Cleaning & Gardening cover photo, now applied to every hero/overview/
 * service image automatically so the whole set stays visually consistent
 * without a manual editing step.
 *
 * Takes and returns a Buffer rather than a live pipeline: sharp's
 * `.metadata()` always reports the *source* file's dimensions, never those
 * of operations (resize, trim) already queued on the same instance, so the
 * width/height/alpha this function reasons about have to come from an
 * already-rendered buffer.
 */
async function applyBrandGrade(buffer: Buffer<ArrayBuffer>): Promise<Buffer<ArrayBuffer>> {
  const base = sharp(buffer);
  const { width, height, hasAlpha } = await base.metadata();
  if (!width || !height) return buffer;

  let tintedLayer: Buffer;
  if (hasAlpha) {
    // A cut-out subject on a transparent background is already fully
    // opaque wherever it has content, so ensureAlpha(TINT_STRENGTH) below
    // would be a no-op (it only sets alpha when adding a *new* channel) —
    // scale the subject's own alpha down instead to get the same
    // partial-strength blend without tinting at full opacity.
    const alphaMask = await base.clone().ensureAlpha().extractChannel("alpha").raw().toBuffer();
    const scaledAlpha = Buffer.from(alphaMask.map((a) => Math.round(a * TINT_STRENGTH)));
    const tintedRgb = await base.clone().tint(BRAND_FOREST).removeAlpha().raw().toBuffer();
    tintedLayer = await sharp(tintedRgb, { raw: { width, height, channels: 3 } })
      .joinChannel(scaledAlpha, { raw: { width, height, channels: 1 } })
      .png()
      .toBuffer();
  } else {
    tintedLayer = await base.clone().tint(BRAND_FOREST).ensureAlpha(TINT_STRENGTH).png().toBuffer();
  }

  const [glowLayer, vignetteLayer] = await Promise.all([
    sharp(Buffer.from(radialGlowSvg(width, height))).png().toBuffer(),
    sharp(Buffer.from(vignetteSvg(width, height))).png().toBuffer(),
  ]);

  const graded = base
    .clone()
    .composite([
      { input: tintedLayer, blend: "over" },
      { input: glowLayer, blend: "screen" },
      { input: vignetteLayer, blend: "multiply" },
    ])
    .modulate({ saturation: 1.12 })
    .linear(1.06, -10);

  if (!hasAlpha) return graded.png().toBuffer();

  // The glow/vignette layers are sized for full-bleed photos and would
  // otherwise leave a colored halo outside a cut-out — clip the graded
  // result back to the source's own silhouette.
  const [gradedPng, alphaMask] = await Promise.all([
    graded.png().toBuffer(),
    base.clone().ensureAlpha().extractChannel("alpha").raw().toBuffer(),
  ]);
  const maskPng = await sharp({
    create: { width, height, channels: 3, background: { r: 0, g: 0, b: 0 } },
  })
    .joinChannel(alphaMask, { raw: { width, height, channels: 1 } })
    .png()
    .toBuffer();

  return sharp(gradedPng)
    .composite([{ input: maskPng, blend: "dest-in" }])
    .png()
    .toBuffer();
}

/**
 * Re-encodes a raster image at a bounded size and a lossy-but-clean
 * compression level. SVG (vector) and GIF (may be animated) pass through
 * untouched — sharp's raster pipeline isn't the right tool for either.
 */
async function optimizeImage(
  buffer: Buffer,
  mimeType: string,
  options?: { brandGrade?: boolean }
): Promise<Buffer> {
  if (mimeType === "image/svg+xml" || mimeType === "image/gif") {
    return buffer;
  }

  const { hasAlpha } = await sharp(buffer).metadata();

  let pipeline = sharp(buffer).rotate(); // apply EXIF orientation before the metadata that stores it is stripped

  // A cut-out subject (transparent background) uploaded on a huge canvas
  // with lots of empty margin — e.g. a stock photo cropped for print —
  // would otherwise get resized as a whole and end up looking small once
  // placed in a fixed-size box. Trimming to the subject's own bounding box
  // first means the size cap below, and the site's layout, both work with
  // the actual content instead of mostly-empty canvas. Skipped for opaque
  // photos: a real photograph's edge pixels are content, not padding, and
  // trimming those would crop into the scene.
  if (options?.brandGrade && hasAlpha) {
    pipeline = pipeline.trim({ threshold: 10 });
  }

  pipeline = pipeline.resize({
    width: MAX_IMAGE_DIMENSION,
    height: MAX_IMAGE_DIMENSION,
    fit: "inside",
    withoutEnlargement: true,
  });

  let working = await pipeline.toBuffer();
  if (options?.brandGrade) {
    working = await applyBrandGrade(working);
  }
  const final = sharp(working);

  if (mimeType === "image/jpeg") return final.jpeg({ quality: 82, mozjpeg: true }).toBuffer();
  if (mimeType === "image/webp") return final.webp({ quality: 82 }).toBuffer();
  return final.png({ compressionLevel: 9 }).toBuffer();
}

export type ImageUploadFolder =
  | "brand"
  | "hero"
  | "overview"
  | "team"
  | "services"
  | "icons"
  | "products"
  | "projects"
  | "gallery"
  | "news"
  | "testimonials"
  | "partners"
  | "clients";

// Folders where a photo is scene/lifestyle imagery, so pushing it toward
// the brand palette makes the site feel cohesive. Deliberately excludes
// "brand" (logos/favicon — a partner's or Bensal's own mark must render
// at its true colors), "team" (headshots shouldn't be tinted), "products"
// (a customer needs to see a product's actual color), and "gallery"
// (documentary project photos). Extend this set if another section's
// photography should get the same treatment.
const BRAND_GRADED_FOLDERS = new Set<ImageUploadFolder>(["hero", "overview", "services"]);

/**
 * Validate-and-persist for admin-managed images (logos, photos, gallery,
 * product/project images, news covers).
 */
export async function saveImageUpload(file: File, folder: ImageUploadFolder): Promise<string> {
  validate(file, IMAGE_MIME_TYPES, "Unsupported image type. Allowed: PNG, JPG, WEBP, GIF, SVG.");

  const filename = `${randomUUID()}-${sanitizeFilename(file.name)}`;
  const rawBuffer = Buffer.from(await file.arrayBuffer());
  // Scene photography gets graded toward the brand palette automatically,
  // so new uploads always match the treatment applied to existing ones —
  // no manual editing step for admins. Every upload is also resized and
  // recompressed regardless of folder, which is what keeps page loads fast.
  const optimized = await optimizeImage(rawBuffer, file.type, {
    brandGrade: BRAND_GRADED_FOLDERS.has(folder),
  });

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
