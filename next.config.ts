import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output requires creating symlinks while tracing files, which
  // fails on Windows without Developer Mode / admin rights. Only enable it
  // inside the Docker build (Linux), where it's needed to keep the runtime
  // image slim. Local `pnpm build` on Windows still fully type-checks and
  // statically generates every page — it just skips this packaging step.
  output: process.env.DOCKER_BUILD ? "standalone" : undefined,
  // pdfkit reads its font metric (.afm) files from disk at runtime via its
  // own __dirname, which Next's bundler can't trace — externalizing it means
  // Next copies the whole package (data files included) into the standalone
  // output instead of trying to inline it.
  serverExternalPackages: ["pdfkit"],
  // Next.js Server Actions cap the request body at 1MB by default, and the
  // contact/career forms submit file attachments straight through a
  // "use server" action — so any attachment over 1MB was being rejected
  // before saveUpload() ever ran. Raised, but capped at 4MB rather than
  // MAX_UPLOAD_SIZE_MB: Vercel enforces a hard, non-configurable 4.5MB
  // request body limit on serverless functions (a platform limit, not a
  // Next.js one), so anything closer to that just fails with a raw 413
  // instead of a clean validation error. 4MB leaves headroom under that
  // ceiling for the rest of the form's fields and multipart overhead.
  experimental: {
    serverActions: {
      bodySizeLimit: "4mb",
    },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
