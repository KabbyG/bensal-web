import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Newspaper, Calendar } from "lucide-react";
import { getNewsPosts } from "@/lib/queries";
import { PageHeader } from "@/components/layout/page-header";
import { Container, Section } from "@/components/ui/container";
import { Stagger, StaggerItem } from "@/components/motion/fade-in";

export const metadata: Metadata = {
  title: "News",
  description: "Latest news and updates from Bensal Investment Co. Ltd.",
};

export default async function NewsPage() {
  const posts = await getNewsPosts();

  return (
    <>
      <PageHeader
        eyebrow="Newsroom"
        title="News & Updates"
        description="Announcements, milestones, and stories from across the company."
        crumb="News"
      />

      <Section>
        <Container>
          {posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border py-24 text-center">
              <Newspaper className="h-10 w-10 text-muted-foreground" />
              <p className="mt-4 font-display text-lg font-semibold">No news posted yet</p>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Check back soon for company news and updates.
              </p>
            </div>
          ) : (
            <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <StaggerItem key={post.id}>
                  <Link
                    href={`/news/${post.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10"
                  >
                    {post.coverImage && (
                      <div className="relative aspect-[16/9] w-full overflow-hidden bg-surface-muted">
                        <Image
                          src={post.coverImage}
                          alt={post.title}
                          fill
                          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    )}
                    <div className="flex flex-1 flex-col p-6">
                      {post.publishedAt && (
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(post.publishedAt).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                      )}
                      <h3 className="mt-2 font-display text-lg font-semibold">{post.title}</h3>
                      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                        {post.excerpt}
                      </p>
                    </div>
                  </Link>
                </StaggerItem>
              ))}
            </Stagger>
          )}
        </Container>
      </Section>
    </>
  );
}
