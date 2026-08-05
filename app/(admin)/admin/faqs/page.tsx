import { prisma } from "@/lib/prisma";
import { FaqManager } from "@/components/admin/faq-manager";

export default async function AdminFaqsPage() {
  const faqs = await prisma.faq.findMany({ where: { deletedAt: null }, orderBy: { order: "asc" } });

  return (
    <div>
      <h1 className="font-display text-xl font-semibold">FAQs</h1>
      <p className="mt-1 text-sm text-muted-foreground">Manage frequently asked questions.</p>
      <div className="mt-6">
        <FaqManager data={faqs} />
      </div>
    </div>
  );
}
