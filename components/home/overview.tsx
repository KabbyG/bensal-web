import Image from "next/image";
import { CalendarDays, Users, MapPinned, ShieldCheck } from "lucide-react";
import type { Company } from "@/lib/generated/prisma/client";
import { Container, Section } from "@/components/ui/container";
import { FadeIn } from "@/components/motion/fade-in";

export function Overview({ company }: { company: Company }) {
  const facts = [
    { icon: CalendarDays, label: "Founded", value: company.foundedYear },
    { icon: Users, label: "Staff", value: company.staffCount },
    { icon: MapPinned, label: "Branches", value: company.branches.length },
    { icon: ShieldCheck, label: "Service Lines", value: "4" },
  ];

  return (
    <Section>
      <Container className="grid items-center gap-16 lg:grid-cols-2">
        <FadeIn className="relative">
          <div className="relative aspect-square max-w-md overflow-hidden rounded-[2.5rem] bg-surface-muted p-12">
            <Image
              src={company.overviewImageUrl ?? "/brand/overview-team.png"}
              alt={company.name}
              fill
              sizes="(min-width: 1024px) 448px, 90vw"
              className="object-contain p-6"
            />
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <span className="text-sm font-semibold uppercase tracking-wider text-accent">
            Who we are
          </span>
          <h2 className="mt-3 font-display text-3xl font-bold text-balance sm:text-4xl">
            A trusted Tanzanian business corporation since {company.foundedYear}
          </h2>
          <p className="mt-5 leading-relaxed text-muted-foreground">{company.description}</p>

          <div className="mt-10 grid grid-cols-2 gap-6">
            {facts.map((fact) => (
              <div key={fact.label} className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <fact.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-display text-lg font-bold">{fact.value}</div>
                  <div className="text-xs text-muted-foreground">{fact.label}</div>
                </div>
              </div>
            ))}
          </div>
        </FadeIn>
      </Container>
    </Section>
  );
}
