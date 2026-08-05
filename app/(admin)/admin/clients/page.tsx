import { prisma } from "@/lib/prisma";
import { LogoEntityManager } from "@/components/admin/logo-entity-manager";
import { createClient, updateClient, softDeleteClient } from "@/actions/admin/clients";

export default async function AdminClientsPage() {
  const clients = await prisma.client.findMany({ where: { deletedAt: null }, orderBy: { order: "asc" } });

  return (
    <div>
      <h1 className="font-display text-xl font-semibold">Clients</h1>
      <p className="mt-1 text-sm text-muted-foreground">Manage client logos shown on the site.</p>
      <div className="mt-6">
        <LogoEntityManager
          data={clients}
          entityKey="clients"
          labelSingular="Client"
          createAction={createClient}
          updateAction={updateClient}
          softDeleteAction={softDeleteClient}
        />
      </div>
    </div>
  );
}
