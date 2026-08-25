import Link from "next/link";
import { Mail, Phone, MapPin, ArrowRight } from "lucide-react";
import type { Company } from "@/lib/generated/prisma/client";
import { Container, Section } from "@/components/ui/container";
import { FadeIn } from "@/components/motion/fade-in";
import { Button } from "@/components/ui/button";

export function ContactPreview({ company }: { company: Company }) {
  return (
    <Section className="bg-surface-muted">
      <Container className="grid gap-10 overflow-hidden rounded-[2rem] border border-border bg-card lg:grid-cols-2">
        <FadeIn className="p-10 sm:p-14">
          <span className="text-sm font-semibold uppercase tracking-wider text-accent">
            Talk to us
          </span>
          <h2 className="mt-3 font-display text-3xl font-bold text-balance">
            Visit our head office or reach out directly
          </h2>
          <div className="mt-8 space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
              <span className="text-muted-foreground">
                {company.address}, {company.city}, {company.country}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 shrink-0 text-accent" />
              <a href={`tel:${company.phone.replace(/\s+/g, "")}`} className="text-muted-foreground hover:text-accent">
                {company.phone}
              </a>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 shrink-0 text-accent" />
              <a href={`mailto:${company.email}`} className="text-muted-foreground hover:text-accent">
                {company.email}
              </a>
            </div>
          </div>
          <Button asChild variant="accent" className="mt-8">
            <Link href="/lets-talk">
              Get in Touch <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </FadeIn>

        <FadeIn delay={0.1} className="min-h-[320px]">
          {company.mapEmbedUrl && (
            <iframe
              src={company.mapEmbedUrl}
              className="h-full w-full grayscale-[15%]"
              style={{ border: 0, minHeight: 320 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Bensal Investment Co. Ltd. — Head Office"
            />
          )}
        </FadeIn>
      </Container>
    </Section>
  );
}
