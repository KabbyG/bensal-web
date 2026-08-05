import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin } from "lucide-react";
import type { Company } from "@/lib/generated/prisma/client";
import type { NavLink } from "@/lib/queries";
import { Container } from "@/components/ui/container";
import { NewsletterForm } from "@/components/forms/newsletter-form";
import { SocialLinks } from "@/components/layout/social-links";

export function Footer({ company, links }: { company: Company; links: NavLink[] }) {
  const socials = (company.socials as Record<string, string>) ?? {};
  const year = new Date().getFullYear();

  return (
    <footer className="bg-brand-gradient text-white">
      <Container className="grid gap-12 py-16 lg:grid-cols-[1.3fr_1fr_1fr_1.1fr]">
        <div className="space-y-5">
          <Image
            src={company.logoInverseUrl ?? "/brand/logo-inverse.png"}
            alt={company.name}
            width={261}
            height={100}
            className="h-14 w-auto"
          />
          <p className="max-w-sm text-sm leading-relaxed text-white/70">
            {company.description}
          </p>
          <SocialLinks socials={socials} variant="dark" className="pt-1" />
        </div>

        <div>
          <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-white/60">
            Explore
          </h3>
          <ul className="mt-5 space-y-3">
            {links.map((link) => (
              <li key={link.id}>
                <Link
                  href={link.url}
                  target={link.openInNewTab ? "_blank" : undefined}
                  rel={link.openInNewTab ? "noopener noreferrer" : undefined}
                  className="text-sm text-white/80 transition-colors hover:text-accent"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-white/60">
            Our Branches
          </h3>
          <ul className="mt-5 grid grid-cols-1 gap-2.5 text-sm text-white/80">
            {company.branches.map((branch) => (
              <li key={branch}>{branch}</li>
            ))}
          </ul>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-white/60">
              Get in touch
            </h3>
            <ul className="mt-5 space-y-3 text-sm text-white/80">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <span>
                  {company.address}, {company.city}, {company.country}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0 text-accent" />
                <a href={`tel:${company.phone.replace(/\s+/g, "")}`} className="hover:text-accent">
                  {company.phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 text-accent" />
                <a href={`mailto:${company.email}`} className="hover:text-accent">
                  {company.email}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-white/60">
              Newsletter
            </h3>
            <p className="mt-2 text-sm text-white/70">Company news and updates, occasionally.</p>
            <NewsletterForm />
          </div>
        </div>
      </Container>

      <div className="border-t border-white/10">
        <Container className="flex flex-col items-center gap-3 py-6 text-center text-xs text-white/60 sm:grid sm:grid-cols-3 sm:text-left">
          <p>
            &copy; {year} {company.legalName}. All rights reserved.
          </p>
          <p className="sm:text-center">Created by Yok Tech Africa</p>
          <div className="flex gap-5 sm:justify-end">
            <Link href="/privacy-policy" className="hover:text-accent">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-accent">
              Terms &amp; Conditions
            </Link>
          </div>
        </Container>
      </div>
    </footer>
  );
}
