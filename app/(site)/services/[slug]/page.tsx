import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getService, getServices, getCompany } from "@/lib/queries";
import { safeStaticParams } from "@/lib/safe-static-params";
import { getIcon } from "@/lib/icon-map";
import { PageHeader } from "@/components/layout/page-header";
import { Container, Section } from "@/components/ui/container";
import { FadeIn } from "@/components/motion/fade-in";
import { Button } from "@/components/ui/button";
import { QuotationForm } from "@/components/forms/quotation-form";

export async function generateStaticParams() {
  const services = await safeStaticParams(() =>
    prisma.service.findMany({ where: { deletedAt: null }, select: { slug: true } })
  );
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = await getService(slug);
  if (!service) return {};
  return {
    title: service.seoTitle ?? service.title,
    description: service.seoDescription ?? service.shortDescription,
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [service, allServices, company] = await Promise.all([
    getService(slug),
    getServices(),
    getCompany(),
  ]);

  if (!service) notFound();

  const Icon = getIcon(service.icon);
  const otherServices = allServices.filter((s) => s.id !== service.id);

  return (
    <>
      <PageHeader eyebrow="Service" title={service.title} crumb={service.title} />

      <Section>
        <Container className="grid gap-16 lg:grid-cols-[1.4fr_1fr]">
          <FadeIn>
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10 text-accent">
              <Icon className="h-8 w-8" />
            </div>
            <p className="mt-8 text-lg leading-relaxed text-muted-foreground">
              {service.description}
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Button asChild variant="accent" size="lg">
                <a href={`https://wa.me/${company.whatsapp}`} target="_blank" rel="noopener noreferrer">
                  Chat on WhatsApp
                </a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/contact">
                  Contact Us <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            {otherServices.length > 0 && (
              <div className="mt-16 border-t border-border pt-10">
                <h3 className="font-display text-lg font-semibold">Other services</h3>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {otherServices.map((s) => {
                    const OtherIcon = getIcon(s.icon);
                    return (
                      <Link
                        key={s.id}
                        href={`/services/${s.slug}`}
                        className="flex items-center gap-3 rounded-xl border border-border p-4 text-sm font-medium transition-colors hover:border-accent hover:text-accent"
                      >
                        <OtherIcon className="h-4 w-4 shrink-0 text-accent" />
                        {s.title}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </FadeIn>

          <FadeIn delay={0.1}>
            <QuotationForm presetItem={service.title} />
          </FadeIn>
        </Container>
      </Section>
    </>
  );
}
