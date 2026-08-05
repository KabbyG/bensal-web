import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { PackageSearch, ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { Container, Section } from "@/components/ui/container";
import { FadeIn } from "@/components/motion/fade-in";
import { QuotationForm } from "@/components/forms/quotation-form";
import { Badge } from "@/components/ui/badge";
import { safeStaticParams } from "@/lib/safe-static-params";

export async function generateStaticParams() {
  const products = await safeStaticParams(() =>
    prisma.product.findMany({ where: { deletedAt: null }, select: { slug: true } })
  );
  return products.map((p) => ({ slug: p.slug }));
}

async function getProduct(slug: string) {
  return prisma.product.findFirst({ where: { slug, deletedAt: null }, include: { category: true } });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return {};
  return { title: product.name, description: product.shortDescription };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  return (
    <>
      <PageHeader eyebrow={product.category.name} title={product.name} crumb={product.name} />

      <Section>
        <Container className="grid gap-16 lg:grid-cols-[1.3fr_1fr]">
          <FadeIn>
            <Link
              href="/products"
              className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-accent"
            >
              <ArrowLeft className="h-4 w-4" /> Back to products
            </Link>

            <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-surface-muted">
              {product.images[0] ? (
                <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                  <PackageSearch className="h-14 w-14" />
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Badge>{product.category.name}</Badge>
              {product.sku && <Badge variant="outline">SKU: {product.sku}</Badge>}
            </div>

            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              {product.description}
            </p>
          </FadeIn>

          <FadeIn delay={0.1}>
            <QuotationForm presetItem={product.name} />
          </FadeIn>
        </Container>
      </Section>
    </>
  );
}
