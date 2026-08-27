import { prisma } from "@/lib/prisma";
import { IconSlotCard } from "@/components/admin/icon-slot-card";

export default async function AdminIconsPage() {
  const services = await prisma.service.findMany({
    where: { deletedAt: null },
    orderBy: { order: "asc" },
  });

  return (
    <div>
      <h1 className="font-display text-xl font-semibold">Icons</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Every icon slot on the public site — currently the five service/capability icons. Upload a
        PNG, SVG, or WEBP with a transparent background to replace one; it&rsquo;s automatically
        sized, centered, and recolored to match the site&rsquo;s accent color, exactly like the
        built-in icons. Reset at any time to go back to the default.
      </p>
      <div className="mt-6 space-y-3">
        {services.map((service) => (
          <IconSlotCard key={service.id} service={service} />
        ))}
      </div>
    </div>
  );
}
