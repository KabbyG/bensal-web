import { prisma } from "@/lib/prisma";
import { ProductCategoryManager } from "@/components/admin/product-category-manager";

export default async function AdminProductCategoriesPage() {
  const categories = await prisma.productCategory.findMany({
    where: { deletedAt: null },
    orderBy: { order: "asc" },
    include: { _count: { select: { products: { where: { deletedAt: null } } } } },
  });

  return (
    <div>
      <h1 className="font-display text-xl font-semibold">Product Categories</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Organize products into categories shown on the Products page.
      </p>
      <div className="mt-6">
        <ProductCategoryManager data={categories} />
      </div>
    </div>
  );
}
