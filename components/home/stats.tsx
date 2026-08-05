import type { Company } from "@/lib/generated/prisma/client";
import { Container, Section } from "@/components/ui/container";
import { FadeIn } from "@/components/motion/fade-in";
import { Counter } from "@/components/motion/counter";

type Stat = { label: string; value: number; suffix?: string };

export function Stats({ company }: { company: Company }) {
  const stats = company.stats as unknown as Stat[];

  return (
    <Section className="relative overflow-hidden bg-brand-gradient text-white">
      <div className="pointer-events-none absolute inset-0 bg-mesh opacity-50" />
      <Container className="relative grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <FadeIn key={stat.label} delay={i * 0.1} className="text-center">
            <div className="font-display text-5xl font-extrabold text-accent">
              <Counter value={stat.value} suffix={stat.suffix ?? ""} />
            </div>
            <div className="mt-2 text-sm text-white/70">{stat.label}</div>
          </FadeIn>
        ))}
        <FadeIn delay={stats.length * 0.1} className="text-center">
          <div className="font-display text-5xl font-extrabold text-accent">
            <Counter value={company.branches.length} />
          </div>
          <div className="mt-2 text-sm text-white/70">Branches Nationwide</div>
        </FadeIn>
        <FadeIn delay={(stats.length + 1) * 0.1} className="text-center">
          <div className="font-display text-5xl font-extrabold text-accent">
            <Counter value={new Date().getFullYear() - company.foundedYear} suffix="+" />
          </div>
          <div className="mt-2 text-sm text-white/70">Years of Operation</div>
        </FadeIn>
      </Container>
    </Section>
  );
}
