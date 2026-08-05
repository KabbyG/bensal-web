import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Container } from "@/components/ui/container";

export function PageHeader({
  eyebrow,
  title,
  description,
  crumb,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  crumb: string;
}) {
  return (
    <div className="relative overflow-hidden bg-brand-gradient pb-20 pt-36 text-white sm:pt-40">
      <div className="pointer-events-none absolute inset-0 bg-mesh opacity-60" />
      <Container className="relative">
        <nav className="mb-4 flex items-center gap-1.5 text-xs text-white/60">
          <Link href="/" className="transition-colors hover:text-white">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-white/90">{crumb}</span>
        </nav>
        {eyebrow && (
          <span className="mb-3 inline-block rounded-full bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-accent">
            {eyebrow}
          </span>
        )}
        <h1 className="max-w-2xl font-display text-4xl font-bold text-balance sm:text-5xl">{title}</h1>
        {description && (
          <p className="mt-4 max-w-xl text-base text-white/75 sm:text-lg">{description}</p>
        )}
      </Container>
    </div>
  );
}
