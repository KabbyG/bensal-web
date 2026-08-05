import { prisma } from "@/lib/prisma";
import { ServiceManager } from "@/components/admin/service-manager";

export default async function AdminServicesPage() {
  const services = await prisma.service.findMany({
    where: { deletedAt: null },
    orderBy: { order: "asc" },
  });

  return (
    <div>
      <h1 className="font-display text-xl font-semibold">Services</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Manage the services listed on the public Services page.
      </p>
      <div className="mt-6">
        <ServiceManager data={services} />
      </div>
    </div>
  );
}
