import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getServices } from "@/lib/queries";
import { getIcon } from "@/lib/icon-map";
import { PageHeader } from "@/components/layout/page-header";
import { Container, Section } from "@/components/ui/container";
import { Stagger, StaggerItem } from "@/components/motion/fade-in";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Cleaning & Gardening, Fumigation & Pest Control, Electronics & ICT Equipment Supply, and Building Materials Supply — Bensal Investment Co. Ltd.",
};

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <>
      <PageHeader
        eyebrow="What We're Capable Of ⭐"
        title="Capabilities that keep your business moving"
        description="Four service lines delivered with professionalism and compliance, across Tanzania."
        crumb="Capabilities"
      />

      <Section>
        <Container>
          <Stagger className="grid gap-8 sm:grid-cols-2">
            {services.map((service) => {
              const Icon = getIcon(service.icon);
              return (
                <StaggerItem key={service.id}>
                  <Link
                    href={`/services/${service.slug}`}
                    className="group flex h-full flex-col rounded-3xl border border-border bg-card p-10 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-primary/10"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent transition-colors duration-300 group-hover:bg-accent group-hover:text-accent-foreground">
                      <Icon className="h-7 w-7" />
                    </div>
                    <h2 className="mt-6 font-display text-2xl font-semibold">{service.title}</h2>
                    <p className="mt-3 flex-1 leading-relaxed text-muted-foreground">
                      {service.shortDescription}
                    </p>
                    <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-accent">
                      View service details
                      <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  </Link>
                </StaggerItem>
              );
            })}
          </Stagger>
        </Container>
      </Section>
    </>
  );
}
