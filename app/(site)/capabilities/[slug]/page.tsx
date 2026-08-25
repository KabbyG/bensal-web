import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
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

            {service.image && (
              <div className="group relative mt-10">
                <div
                  aria-hidden
                  className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-accent/20 opacity-60 blur-3xl transition-opacity duration-500 group-hover:opacity-90"
                />
                <div className="relative aspect-[16/11] w-full overflow-hidden rounded-[2rem] border border-accent/15 bg-surface-muted shadow-xl shadow-black/5 ring-1 ring-black/[0.02]">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    sizes="(min-width: 1024px) 768px, 100vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-brand-forest/85 via-brand-forest/10 to-transparent" />
                  <div className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-brand-forest/70 px-3.5 py-1.5 text-xs font-medium text-white backdrop-blur-sm sm:bottom-5 sm:left-5">
                    <Icon className="h-3.5 w-3.5 text-brand-green" />
                    {service.title} in action
                  </div>
                </div>
              </div>
            )}

            {service.items.length > 0 && (
              <div className="mt-8 rounded-2xl border border-border bg-surface-muted p-6 sm:p-8">
                <h2 className="font-display text-base font-semibold">
                  Items included in {service.title}
                </h2>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {service.items.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                      <span className="leading-snug">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
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
                      href={`/capabilities/${s.slug}`}
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
