import { prisma } from "@/lib/prisma";
import { MessageManager } from "@/components/admin/message-manager";

export default async function AdminMessagesPage() {
  const messages = await prisma.contactMessage.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="font-display text-xl font-semibold">Messages</h1>
      <p className="mt-1 text-sm text-muted-foreground">Contact form submissions from the public site.</p>
      <div className="mt-6">
        <MessageManager data={messages} />
      </div>
    </div>
  );
}
