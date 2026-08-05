import { prisma } from "@/lib/prisma";
import { TeamManager } from "@/components/admin/team-manager";

export default async function AdminTeamPage() {
  const members = await prisma.teamMember.findMany({
    where: { deletedAt: null },
    orderBy: { order: "asc" },
  });

  return (
    <div>
      <h1 className="font-display text-xl font-semibold">Team</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Manage leadership and staff profiles shown on the About page.
      </p>
      <div className="mt-6">
        <TeamManager data={members} />
      </div>
    </div>
  );
}
