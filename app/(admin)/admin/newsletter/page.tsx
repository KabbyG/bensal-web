import { prisma } from "@/lib/prisma";
import { NewsletterManager } from "@/components/admin/newsletter-manager";

export default async function AdminNewsletterPage() {
  const subscribers = await prisma.newsletterSubscriber.findMany({
    where: { deletedAt: null },
    orderBy: { subscribedAt: "desc" },
  });

  return (
    <div>
      <h1 className="font-display text-xl font-semibold">Newsletter Subscribers</h1>
      <p className="mt-1 text-sm text-muted-foreground">People subscribed via the footer newsletter form.</p>
      <div className="mt-6">
        <NewsletterManager data={subscribers} />
      </div>
    </div>
  );
}
