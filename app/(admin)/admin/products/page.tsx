import { prisma } from "@/lib/prisma";
import { ProductManager } from "@/components/admin/product-manager";

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      include: { category: true },
    }),
    prisma.productCategory.findMany({ where: { deletedAt: null }, orderBy: { order: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="font-display text-xl font-semibold">Products</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Manage the products listed on the public Products page.
      </p>
      <div className="mt-6">
        <ProductManager data={products} categories={categories} />
      </div>
    </div>
  );
}
