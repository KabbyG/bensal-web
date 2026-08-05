import type { Metadata } from "next";
import { Briefcase, MapPin, Clock } from "lucide-react";
import { getActiveJobPostings } from "@/lib/queries";
import { PageHeader } from "@/components/layout/page-header";
import { Container, Section } from "@/components/ui/container";
import { FadeIn, Stagger, StaggerItem } from "@/components/motion/fade-in";
import { Badge } from "@/components/ui/badge";
import { CareerForm } from "@/components/forms/career-form";

export const metadata: Metadata = {
  title: "Careers",
  description: "Join the Bensal Investment Co. Ltd. team — current openings and how to apply.",
};

const jobTypeLabels: Record<string, string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  CONTRACT: "Contract",
  INTERNSHIP: "Internship",
};

export default async function CareersPage() {
  const jobs = await getActiveJobPostings();

  return (
    <>
      <PageHeader
        eyebrow="Join us"
        title="Build your career with Bensal"
        description="We're a growing team of 50+ professionals across Tanzania. Explore open roles or send a general application."
        crumb="Careers"
      />

      <Section>
        <Container className="grid gap-16 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <h2 className="font-display text-2xl font-semibold">Open Positions</h2>
            {jobs.length === 0 ? (
              <FadeIn className="mt-6 flex flex-col items-center justify-center rounded-3xl border border-dashed border-border py-20 text-center">
                <Briefcase className="h-10 w-10 text-muted-foreground" />
                <p className="mt-4 font-display text-lg font-semibold">No open positions right now</p>
                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                  We&apos;re not actively hiring at the moment, but we welcome general applications —
                  submit yours and we&apos;ll reach out when a fitting role opens up.
                </p>
              </FadeIn>
            ) : (
              <Stagger className="mt-6 space-y-4">
                {jobs.map((job) => (
                  <StaggerItem key={job.id}>
                    <div className="rounded-2xl border border-border bg-card p-6">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="font-display text-lg font-semibold">{job.title}</h3>
                          <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                              <MapPin className="h-4 w-4" /> {job.location}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Clock className="h-4 w-4" /> {jobTypeLabels[job.type]}
                            </span>
                          </div>
                        </div>
                        <Badge variant="accent">{job.department ?? "General"}</Badge>
                      </div>
                      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                        {job.description}
                      </p>
                    </div>
                  </StaggerItem>
                ))}
              </Stagger>
            )}
          </div>

          <FadeIn delay={0.1}>
            <CareerForm />
          </FadeIn>
        </Container>
      </Section>
    </>
  );
}
