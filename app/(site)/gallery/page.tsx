import type { Metadata } from "next";
import { ImageIcon } from "lucide-react";
import { getGalleryItems } from "@/lib/queries";
import { PageHeader } from "@/components/layout/page-header";
import { Container, Section } from "@/components/ui/container";
import { GalleryGrid } from "@/components/gallery/gallery-grid";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Photos and videos from Bensal Investment Co. Ltd.'s work across Tanzania.",
};

export default async function GalleryPage() {
  const items = await getGalleryItems();

  return (
    <>
      <PageHeader
        eyebrow="Media"
        title="Gallery"
        description="A visual look at our team, sites, and projects in action."
        crumb="Gallery"
      />

      <Section>
        <Container>
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border py-24 text-center">
              <ImageIcon className="h-10 w-10 text-muted-foreground" />
              <p className="mt-4 font-display text-lg font-semibold">Gallery coming soon</p>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                We&apos;re curating photos and videos from our projects. Check back shortly.
              </p>
            </div>
          ) : (
            <GalleryGrid items={items} />
          )}
        </Container>
      </Section>
    </>
  );
}
