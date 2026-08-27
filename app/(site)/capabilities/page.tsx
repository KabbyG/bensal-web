import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getServices } from "@/lib/queries";
import { ServiceIcon } from "@/lib/icon-map";
import { PageHeader } from "@/components/layout/page-header";
import { Container, Section } from "@/components/ui/container";
import { Stagger, StaggerItem } from "@/components/motion/fade-in";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Cleaning & Gardening, Fumigation & Pest Control, Electronics & ICT Equipment Supply, Building Materials Supply, and Cleaning Materials Supply — Bensal Investment Co. Ltd.",
};

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <>
      <PageHeader
        eyebrow="What We're Capable Of ⭐"
        title="Services that keep your business moving"
        description="Five service lines delivered with professionalism and compliance, across Tanzania."
        crumb="Capabilities"
      />

      <Section>
        <Container>
          <Stagger className="flex flex-wrap justify-center gap-8">
            {services.map((service) => {
              return (
                <StaggerItem key={service.id} className="w-full sm:w-[calc(50%-1rem)]">
                  <Link
                    href={`/capabilities/${service.slug}`}
                    className="group flex h-full flex-col rounded-3xl border border-border bg-card p-10 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-primary/10"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent transition-colors duration-300 group-hover:bg-accent group-hover:text-accent-foreground">
                      <ServiceIcon icon={service.icon} customIconUrl={service.customIconUrl} className="h-7 w-7" />
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
