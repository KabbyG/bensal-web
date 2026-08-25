import type { Metadata } from "next";
import { Download, ExternalLink, FileWarning } from "lucide-react";
import { getNestProfile } from "@/lib/queries";
import { PageHeader } from "@/components/layout/page-header";
import { Container, Section } from "@/components/ui/container";
import { FadeIn } from "@/components/motion/fade-in";

export const metadata: Metadata = {
  title: "NEST Business Lines",
  description: "Explore our full NeST business line and see the range we're registered to supply.",
};

export default async function NestPage() {
  const profile = await getNestProfile();

  return (
    <>
      <PageHeader
        eyebrow="NEST"
        title="Our NeST Business Lines"
        description={
          profile?.description ??
          "Explore our full NeST business line and see the range we're registered to supply."
        }
        crumb="NEST"
      />

      <Section>
        <Container className="mx-auto max-w-4xl">
          <FadeIn>
            {profile?.pdfUrl ? (
              <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface-muted px-5 py-4">
                  <span className="truncate text-sm font-semibold">
                    {profile.pdfName ?? "NeST Business Line Certificate"}
                  </span>
                  <div className="flex shrink-0 items-center gap-2">
                    <a
                      href={profile.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-1.5 text-xs font-semibold transition-colors hover:border-accent hover:text-accent"
                    >
                      <ExternalLink className="h-3.5 w-3.5" /> Open
                    </a>
                    <a
                      href={profile.pdfUrl}
                      download={profile.pdfName ?? true}
                      className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3.5 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                    >
                      <Download className="h-3.5 w-3.5" /> Download
                    </a>
                  </div>
                </div>
                <iframe
                  src="/api/nest/pdf#toolbar=0"
                  title={profile.pdfName ?? "NeST Business Line Certificate"}
                  className="h-[70vh] w-full sm:h-[80vh]"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-surface-muted px-6 py-16 text-center">
                <FileWarning className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  The certificate PDF hasn&apos;t been uploaded yet. Check back soon.
                </p>
              </div>
            )}
          </FadeIn>
        </Container>
      </Section>
    </>
  );
}
