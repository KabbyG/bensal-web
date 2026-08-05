import { prisma } from "@/lib/prisma";
import { MenuBuilder } from "@/components/admin/menu-builder";

export default async function AdminMenusPage() {
  const menus = await prisma.menu.findMany({
    include: { items: true },
    orderBy: { key: "asc" },
  });

  return (
    <div>
      <h1 className="font-display text-xl font-semibold">Menus</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Drag to reorder. Edit an item to nest it under another as a dropdown.
      </p>
      <div className="mt-6">
        <MenuBuilder menus={menus} />
      </div>
    </div>
  );
}
