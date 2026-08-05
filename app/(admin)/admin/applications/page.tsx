import { prisma } from "@/lib/prisma";
import { ApplicationManager } from "@/components/admin/application-manager";

export default async function AdminApplicationsPage() {
  const applications = await prisma.jobApplication.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: { jobPosting: true },
  });

  return (
    <div>
      <h1 className="font-display text-xl font-semibold">Job Applications</h1>
      <p className="mt-1 text-sm text-muted-foreground">Applications submitted through the Careers page.</p>
      <div className="mt-6">
        <ApplicationManager data={applications} />
      </div>
    </div>
  );
}
