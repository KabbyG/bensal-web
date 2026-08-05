import { prisma } from "@/lib/prisma";
import { ProjectManager } from "@/components/admin/project-manager";

export default async function AdminProjectsPage() {
  const projects = await prisma.project.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="font-display text-xl font-semibold">Projects</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Manage the projects listed on the public Projects page.
      </p>
      <div className="mt-6">
        <ProjectManager data={projects} />
      </div>
    </div>
  );
}
