import { prisma } from "@/lib/prisma";
import { QuotationManager } from "@/components/admin/quotation-manager";

export default async function AdminQuotationsPage() {
  const quotations = await prisma.quotationRequest.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="font-display text-xl font-semibold">Quotation Requests</h1>
      <p className="mt-1 text-sm text-muted-foreground">Quotation requests from the public site.</p>
      <div className="mt-6">
        <QuotationManager data={quotations} />
      </div>
    </div>
  );
}
