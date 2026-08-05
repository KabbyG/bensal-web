import { prisma } from "@/lib/prisma";
import { SeoManager } from "@/components/admin/seo-manager";

export default async function AdminSeoPage() {
  const entries = await prisma.seoMeta.findMany({ orderBy: { page: "asc" } });

  return (
    <div>
      <h1 className="font-display text-xl font-semibold">SEO</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Per-page title/description/social image overrides. Pages without an entry fall back to the
        default title and description set in Company Settings.
      </p>
      <div className="mt-6">
        <SeoManager data={entries} />
      </div>
    </div>
  );
}
