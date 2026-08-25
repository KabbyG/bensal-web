import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Target, Eye, MapPin } from "lucide-react";
import { getCompany, getLeadership, getNestProfile } from "@/lib/queries";
import { PageHeader } from "@/components/layout/page-header";
import { Container, Section } from "@/components/ui/container";
import { FadeIn, Stagger, StaggerItem } from "@/components/motion/fade-in";
import { Card, CardContent } from "@/components/ui/card";
import { NestBusinessLineDialog } from "@/components/about/nest-business-line-dialog";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Bensal Investment Co. Ltd. — a privately owned Tanzanian business corporation established in 2014, delivering Cleaning & Gardening, Fumigation, and Supply services.",
};

export default async function OurJourneyPage() {
  const [company, leadership, nestProfile] = await Promise.all([
    getCompany(),
    getLeadership(),
    getNestProfile(),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="About Bensal"
        title="Built on trust, driven by quality"
        description={`A privately owned Tanzanian business corporation, established in ${company.foundedYear}.`}
        crumb="Our Journey"
      />

      <Section>
        <Container className="grid gap-16 lg:grid-cols-2">
          <FadeIn>
            <span className="text-sm font-semibold uppercase tracking-wider text-accent">
              Our story
            </span>
            <h2 className="mt-3 font-display text-3xl font-bold text-balance">
              A decade of dependable service
            </h2>
            <p className="mt-5 leading-relaxed text-muted-foreground">{company.description}</p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Discover the confidence behind our work.{" "}
              {nestProfile?.pdfUrl ? (
                <NestBusinessLineDialog pdfUrl={nestProfile.pdfUrl} pdfName={nestProfile.pdfName}>
                  Download our NeST Business Line
                </NestBusinessLineDialog>
              ) : (
                <Link
                  href="/nest"
                  className="font-semibold text-foreground underline decoration-accent/40 decoration-2 underline-offset-4 transition-colors duration-200 hover:text-accent"
                >
                  View our NeST Business Line
                </Link>
              )}{" "}
              and learn more about who we are and what we stand for.
            </p>
          </FadeIn>

          <FadeIn delay={0.1} className="grid gap-6 sm:grid-cols-2">
            <Card>
              <CardContent className="p-7">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <Target className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold">Mission</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {company.mission}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-7">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <Eye className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold">Vision</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {company.vision}
                </p>
              </CardContent>
            </Card>
          </FadeIn>
        </Container>
      </Section>

      {leadership.length > 0 && (
        <Section className="bg-surface-muted">
          <Container>
            <FadeIn className="mx-auto max-w-2xl text-center">
              <span className="text-sm font-semibold uppercase tracking-wider text-accent">
                Leadership
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold text-balance sm:text-4xl">
                The people steering Bensal forward
              </h2>
            </FadeIn>

            <Stagger className="mt-14 grid gap-6 sm:grid-cols-2 lg:mx-auto lg:max-w-3xl">
              {leadership.map((member) => (
                <StaggerItem key={member.id}>
                  <Card className="h-full text-center">
                    <CardContent className="flex flex-col items-center p-8">
                      <div className="relative h-24 w-24 overflow-hidden rounded-full bg-accent/10">
                        {member.photoUrl ? (
                          <Image src={member.photoUrl} alt={member.name} fill sizes="96px" className="object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center font-display text-2xl font-bold text-accent">
                            {member.name
                              .split(" ")
                              .map((n) => n[0])
                              .slice(-2)
                              .join("")}
                          </div>
                        )}
                      </div>
                      <h3 className="mt-5 font-display text-lg font-semibold">{member.name}</h3>
                      <p className="mt-1 text-sm font-medium text-accent">{member.title}</p>
                    </CardContent>
                  </Card>
                </StaggerItem>
              ))}
            </Stagger>
          </Container>
        </Section>
      )}

      <Section>
        <Container>
          <FadeIn className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-accent">
              Where we operate
            </span>
            <h2 className="mt-3 font-display text-3xl font-bold text-balance sm:text-4xl">
              {company.branches.length} branches across {company.country}
            </h2>
            <p className="mt-3 text-muted-foreground">
              From our head office in {company.city}, we&apos;ve expanded our reach to serve clients
              nationwide.
            </p>
          </FadeIn>

          <Stagger className="mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-3">
            {company.branches.map((branch) => (
              <StaggerItem key={branch}>
                <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
                  <MapPin className="h-4 w-4 shrink-0 text-accent" />
                  <span className="text-sm font-medium">{branch}</span>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </Section>
    </>
  );
}
