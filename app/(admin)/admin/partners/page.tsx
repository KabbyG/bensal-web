import { prisma } from "@/lib/prisma";
import { LogoEntityManager } from "@/components/admin/logo-entity-manager";
import { createPartner, updatePartner, softDeletePartner } from "@/actions/admin/partners";

export default async function AdminPartnersPage() {
  const partners = await prisma.partner.findMany({ where: { deletedAt: null }, orderBy: { order: "asc" } });

  return (
    <div>
      <h1 className="font-display text-xl font-semibold">Partners</h1>
      <p className="mt-1 text-sm text-muted-foreground">Manage partner logos shown on the homepage.</p>
      <div className="mt-6">
        <LogoEntityManager
          data={partners}
          entityKey="partners"
          labelSingular="Partner"
          createAction={createPartner}
          updateAction={updatePartner}
          softDeleteAction={softDeletePartner}
        />
      </div>
    </div>
  );
}
