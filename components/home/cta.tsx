import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import type { Company } from "@/lib/generated/prisma/client";
import { Container, Section } from "@/components/ui/container";
import { FadeIn } from "@/components/motion/fade-in";
import { Button } from "@/components/ui/button";

export function Cta({ company }: { company: Company }) {
  return (
    <Section>
      <Container>
        <FadeIn className="relative overflow-hidden rounded-[2.5rem] bg-brand-gradient px-8 py-16 text-center text-white sm:px-16">
          <div className="pointer-events-none absolute inset-0 bg-mesh opacity-50" />
          <div className="relative">
            <h2 className="mx-auto max-w-xl font-display text-3xl font-bold text-balance sm:text-4xl">
              Ready to work with a partner you can rely on?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-white/75">
              Get in touch for a tailored quotation on cleaning, fumigation, or supply services.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button asChild variant="accent" size="lg">
                <Link href="/lets-talk">
                  Let&apos;s Talk <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="glass" size="lg">
                <a href={`tel:${company.phone.replace(/\s+/g, "")}`}>
                  <Phone className="h-4 w-4" /> {company.phone}
                </a>
              </Button>
            </div>
          </div>
        </FadeIn>
      </Container>
    </Section>
  );
}
