import { MapPin } from "lucide-react";
import type { Company } from "@/lib/generated/prisma/client";
import { Container, Section } from "@/components/ui/container";
import { FadeIn, Stagger, StaggerItem } from "@/components/motion/fade-in";

export function Branches({ company }: { company: Company }) {
  return (
    <Section className="bg-surface-muted">
      <Container>
        <FadeIn className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-accent">
            Nationwide reach
          </span>
          <h2 className="mt-3 font-display text-3xl font-bold text-balance sm:text-4xl">
            Present across {company.branches.length} regions in {company.country}
          </h2>
        </FadeIn>

        <Stagger className="mt-12 flex flex-wrap justify-center gap-3">
          {company.branches.map((branch) => (
            <StaggerItem key={branch}>
              <div className="flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium shadow-sm transition-colors hover:border-accent hover:text-accent">
                <MapPin className="h-4 w-4 text-accent" />
                {branch}
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </Section>
  );
}
