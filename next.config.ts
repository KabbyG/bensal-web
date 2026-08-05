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
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
