import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, MapPin, Calendar, Building } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { Container, Section } from "@/components/ui/container";
import { FadeIn } from "@/components/motion/fade-in";
import { Badge } from "@/components/ui/badge";
import { safeStaticParams } from "@/lib/safe-static-params";

export async function generateStaticParams() {
  const projects = await safeStaticParams(() =>
    prisma.project.findMany({ where: { deletedAt: null }, select: { slug: true } })
  );
  return projects.map((p) => ({ slug: p.slug }));
}

async function getProject(slug: string) {
  return prisma.project.findFirst({ where: { slug, deletedAt: null } });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return {};
  return { title: project.title, description: project.summary };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();

  return (
    <>
      <PageHeader eyebrow={project.category} title={project.title} crumb={project.title} />

      <Section>
        <Container className="grid gap-16 lg:grid-cols-[1.4fr_1fr]">
          <FadeIn>
            <Link
              href="/projects"
              className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-accent"
            >
              <ArrowLeft className="h-4 w-4" /> Back to projects
            </Link>

            {project.coverImage && (
              <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-surface-muted">
                <Image src={project.coverImage} alt={project.title} fill className="object-cover" />
              </div>
            )}

            <p className="mt-8 text-lg leading-relaxed text-muted-foreground">
              {project.description}
            </p>
          </FadeIn>

          <FadeIn delay={0.1} className="space-y-4 rounded-2xl border border-border bg-card p-7 h-fit">
            <h3 className="font-display text-lg font-semibold">Project details</h3>
            {project.client && (
              <div className="flex items-center gap-3 text-sm">
                <Building className="h-4 w-4 text-accent" />
                <span className="text-muted-foreground">{project.client}</span>
              </div>
            )}
            {project.location && (
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="h-4 w-4 text-accent" />
                <span className="text-muted-foreground">{project.location}</span>
              </div>
            )}
            {project.year && (
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-accent" />
                <span className="text-muted-foreground">{project.year}</span>
              </div>
            )}
            <Badge variant={project.status === "COMPLETED" ? "default" : "accent"}>
              {project.status === "COMPLETED" ? "Completed" : "Ongoing"}
            </Badge>
          </FadeIn>
        </Container>
      </Section>
    </>
  );
}
