import { prisma } from "@/lib/prisma";
import { NewsManager } from "@/components/admin/news-manager";

export default async function AdminNewsPage() {
  const posts = await prisma.newsPost.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="font-display text-xl font-semibold">News</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Manage blog/news posts shown on the public News page.
      </p>
      <div className="mt-6">
        <NewsManager data={posts} />
      </div>
    </div>
  );
}
