import type { Metadata } from "next";
import { getProducts, getProductCategories } from "@/lib/queries";
import { PageHeader } from "@/components/layout/page-header";
import { Container, Section } from "@/components/ui/container";
import { ProductFilters } from "@/components/products/product-filters";
import { ProductGrid } from "@/components/products/product-grid";
import { Pagination } from "@/components/products/pagination";

export const metadata: Metadata = {
  title: "Products",
  description:
    "Browse Bensal Investment Co. Ltd.'s catalogue of Electronics & ICT Equipment and Building Materials.",
};

const PAGE_SIZE = 12;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page ?? 1) || 1;

  const [[products, totalCount], categories] = await Promise.all([
    getProducts({
      categorySlug: params.category,
      search: params.search,
      page,
      pageSize: PAGE_SIZE,
    }),
    getProductCategories(),
  ]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <>
      <PageHeader
        eyebrow="Catalogue"
        title="Products & Supplies"
        description="Electronics, ICT equipment, and building materials — sourced reliably for your project."
        crumb="Products"
      />

      <Section>
        <Container>
          <ProductFilters categories={categories} totalCount={totalCount} />
          <div className="mt-10">
            <ProductGrid products={products} />
          </div>
          <Pagination page={page} totalPages={totalPages} />
        </Container>
      </Section>
    </>
  );
}
