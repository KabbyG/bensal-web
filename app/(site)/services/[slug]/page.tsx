import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getService, getServices } from "@/lib/queries";
import { safeStaticParams } from "@/lib/safe-static-params";
import { getIcon } from "@/lib/icon-map";
import { PageHeader } from "@/components/layout/page-header";
import { Container, Section } from "@/components/ui/container";
import { FadeIn } from "@/components/motion/fade-in";

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
  const [service, allServices] = await Promise.all([getService(slug), getServices()]);

  if (!service) notFound();

  const Icon = getIcon(service.icon);
  const otherServices = allServices.filter((s) => s.id !== service.id);

  return (
    <>
      <PageHeader eyebrow="Service" title={service.title} crumb={service.title} />

      <Section>
        <Container>
          <FadeIn className="mx-auto max-w-3xl">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10 text-accent">
              <Icon className="h-8 w-8" />
            </div>
            <div
              className="prose prose-neutral prose-lg mt-8 max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: service.description }}
            />
          </FadeIn>

          {otherServices.length > 0 && (
            <FadeIn delay={0.1} className="mx-auto mt-20 max-w-5xl border-t border-border pt-14">
              <div className="text-center">
                <span className="text-sm font-semibold uppercase tracking-wider text-accent">
                  Explore more
                </span>
                <h3 className="mt-2 font-display text-2xl font-bold text-balance sm:text-3xl">
                  Other services
                </h3>
              </div>
              <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {otherServices.map((s) => {
                  const OtherIcon = getIcon(s.icon);
                  return (
                    <Link
                      key={s.id}
                      href={`/services/${s.slug}`}
                      className="group flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 transition-all duration-200 hover:-translate-y-1 hover:border-accent hover:shadow-md"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors group-hover:bg-accent group-hover:text-white">
                        <OtherIcon className="h-5 w-5" />
                      </div>
                      <div className="flex items-center gap-1.5 text-sm font-semibold">
                        {s.title}
                        <ArrowRight className="h-3.5 w-3.5 shrink-0 text-accent transition-transform group-hover:translate-x-1" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </FadeIn>
          )}
        </Container>
      </Section>
    </>
  );
}
