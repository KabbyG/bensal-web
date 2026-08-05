import Link from "next/link";
import Image from "next/image";
import { PackageSearch } from "lucide-react";
import type { Product, ProductCategory } from "@/lib/generated/prisma/client";
import { Stagger, StaggerItem } from "@/components/motion/fade-in";

type ProductWithCategory = Product & { category: ProductCategory };

export function ProductGrid({ products }: { products: ProductWithCategory[] }) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border py-24 text-center">
        <PackageSearch className="h-10 w-10 text-muted-foreground" />
        <p className="mt-4 font-display text-lg font-semibold">No products listed yet</p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Our catalogue is being prepared. Contact us directly for current stock and pricing.
        </p>
      </div>
    );
  }

  return (
    <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <StaggerItem key={product.id}>
          <Link
            href={`/products/${product.slug}`}
            className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-muted">
              {product.images[0] ? (
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                  <PackageSearch className="h-10 w-10" />
                </div>
              )}
            </div>
            <div className="flex flex-1 flex-col p-6">
              <span className="text-xs font-semibold uppercase tracking-wider text-accent">
                {product.category.name}
              </span>
              <h3 className="mt-2 font-display text-lg font-semibold">{product.name}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                {product.shortDescription}
              </p>
            </div>
          </Link>
        </StaggerItem>
      ))}
    </Stagger>
  );
}
