import { prisma } from "@/lib/prisma";
import { GalleryManager } from "@/components/admin/gallery-manager";

export default async function AdminGalleryPage() {
  const items = await prisma.galleryItem.findMany({
    where: { deletedAt: null },
    orderBy: { order: "asc" },
  });

  return (
    <div>
      <h1 className="font-display text-xl font-semibold">Gallery</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Manage the photos and videos shown on the public Gallery page.
      </p>
      <div className="mt-6">
        <GalleryManager data={items} />
      </div>
    </div>
  );
}
