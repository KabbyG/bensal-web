import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { FolderKanban } from "lucide-react";
import { getProjects } from "@/lib/queries";
import { PageHeader } from "@/components/layout/page-header";
import { Container, Section } from "@/components/ui/container";
import { Stagger, StaggerItem } from "@/components/motion/fade-in";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Projects",
  description: "Completed and ongoing projects delivered by Bensal Investment Co. Ltd.",
};

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <>
      <PageHeader
        eyebrow="Portfolio"
        title="Projects & Case Studies"
        description="A look at the work we've delivered for clients across Tanzania."
        crumb="Projects"
      />

      <Section>
        <Container>
          {projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border py-24 text-center">
              <FolderKanban className="h-10 w-10 text-muted-foreground" />
              <p className="mt-4 font-display text-lg font-semibold">Project showcase coming soon</p>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                We&apos;re documenting our completed projects. Check back shortly.
              </p>
            </div>
          ) : (
            <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <StaggerItem key={project.id}>
                  <Link
                    href={`/projects/${project.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10"
                  >
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-muted">
                      {project.coverImage && (
                        <Image
                          src={project.coverImage}
                          alt={project.title}
                          fill
                          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <Badge className="w-fit">{project.category}</Badge>
                      <h3 className="mt-3 font-display text-lg font-semibold">{project.title}</h3>
                      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                        {project.summary}
                      </p>
                    </div>
                  </Link>
                </StaggerItem>
              ))}
            </Stagger>
          )}
        </Container>
      </Section>
    </>
  );
}
