import { prisma } from "@/lib/prisma";
import { JobPostingManager } from "@/components/admin/job-posting-manager";

export default async function AdminCareersPage() {
  const postings = await prisma.jobPosting.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="font-display text-xl font-semibold">Job Postings</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Manage open positions shown on the public Careers page.
      </p>
      <div className="mt-6">
        <JobPostingManager data={postings} />
      </div>
    </div>
  );
}
