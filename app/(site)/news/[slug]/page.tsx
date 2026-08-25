import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Calendar } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { Container, Section } from "@/components/ui/container";
import { FadeIn } from "@/components/motion/fade-in";
import { safeStaticParams } from "@/lib/safe-static-params";

export async function generateStaticParams() {
  const posts = await safeStaticParams(() =>
    prisma.newsPost.findMany({ where: { published: true, deletedAt: null }, select: { slug: true } })
  );
  return posts.map((p) => ({ slug: p.slug }));
}

async function getPost(slug: string) {
  return prisma.newsPost.findFirst({ where: { slug, deletedAt: null } });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  return { title: post.seoTitle ?? post.title, description: post.seoDescription ?? post.excerpt };
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post || !post.published) notFound();

  return (
    <>
      <PageHeader eyebrow={post.category ?? "News"} title={post.title} crumb={post.title} />

      <Section>
        <Container className="mx-auto max-w-3xl">
          <FadeIn>
            <Link
              href="/news"
              className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-accent"
            >
              <ArrowLeft className="h-4 w-4" /> Back to news
            </Link>

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

            {post.coverImage && (
              <div className="relative mt-6 aspect-video w-full overflow-hidden rounded-2xl bg-surface-muted">
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  sizes="(min-width: 768px) 768px, 100vw"
                  className="object-cover"
                />
              </div>
            )}

            <div
              className="prose prose-neutral mt-8 max-w-none dark:prose-invert prose-headings:font-display"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {post.tags.length > 0 && (
              <div className="mt-10 flex flex-wrap gap-2 border-t border-border pt-6">
                {post.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-surface-muted px-3 py-1 text-xs font-medium">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </FadeIn>
        </Container>
      </Section>
    </>
  );
}
