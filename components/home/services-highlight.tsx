import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Service } from "@/lib/generated/prisma/client";
import { Container, Section } from "@/components/ui/container";
import { FadeIn, Stagger, StaggerItem } from "@/components/motion/fade-in";
import { getIcon } from "@/lib/icon-map";

export function ServicesHighlight({ services }: { services: Service[] }) {
  if (services.length === 0) return null;

  return (
    <Section className="bg-surface-muted">
      <Container>
        <FadeIn className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-accent">
            What we do
          </span>
          <h2 className="mt-3 font-display text-3xl font-bold text-balance sm:text-4xl">
            Four service lines, one dependable partner
          </h2>
        </FadeIn>

        <Stagger className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => {
            const Icon = getIcon(service.icon);
            return (
              <StaggerItem key={service.id}>
                <Link
                  href={`/services/${service.slug}`}
                  className="group flex h-full flex-col rounded-2xl border border-border bg-card p-7 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-primary/10"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors duration-300 group-hover:bg-accent group-hover:text-accent-foreground">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 font-display text-lg font-semibold">{service.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {service.shortDescription}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-accent">
                    Learn more
                    <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </Link>
              </StaggerItem>
            );
          })}
        </Stagger>
      </Container>
    </Section>
  );
}
