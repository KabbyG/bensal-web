"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, Phone, ChevronDown } from "lucide-react";
import { useScroll, useMotionValueEvent } from "framer-motion";
import type { Company } from "@/lib/generated/prisma/client";
import type { NavLink } from "@/lib/queries";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger, SheetContent, SheetClose } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export function Navbar({ company, links }: { company: Company; links: NavLink[] }) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 40);
  });

  const transparent = isHome && !scrolled;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-all duration-500",
        transparent ? "bg-transparent" : "glass shadow-sm"
      )}
    >
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <Image
            src={transparent ? company.logoInverseUrl ?? "/brand/logo-inverse.png" : company.logoUrl ?? "/brand/logo.png"}
            alt={company.name}
            width={261}
            height={100}
            priority
            className="h-11 w-auto sm:h-12"
          />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((link) => {
            const active = pathname === link.url;
            const hasChildren = link.children.length > 0;
            return (
              <div key={link.id} className="group relative">
                <Link
                  href={link.url}
                  target={link.openInNewTab ? "_blank" : undefined}
                  rel={link.openInNewTab ? "noopener noreferrer" : undefined}
                  className={cn(
                    "relative inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    transparent ? "text-white/90 hover:text-white" : "text-foreground/80 hover:text-foreground"
                  )}
                >
                  {link.label}
                  {hasChildren && <ChevronDown className="h-3.5 w-3.5" />}
                  <span
                    className={cn(
                      "absolute inset-x-4 -bottom-0.5 h-0.5 origin-left scale-x-0 rounded-full bg-accent transition-transform duration-300 group-hover:scale-x-100",
                      active && "scale-x-100"
                    )}
                  />
                </Link>
                {hasChildren && (
                  <div className="invisible absolute left-0 top-full z-10 min-w-[180px] rounded-xl border border-border bg-card p-2 opacity-0 shadow-lg transition-all duration-150 group-hover:visible group-hover:opacity-100">
                    {link.children.map((child) => (
                      <Link
                        key={child.id}
                        href={child.url}
                        target={child.openInNewTab ? "_blank" : undefined}
                        rel={child.openInNewTab ? "noopener noreferrer" : undefined}
                        className="block rounded-lg px-3 py-2 text-sm text-foreground/80 hover:bg-surface-muted hover:text-foreground"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <a
            href={`tel:${company.phone.replace(/\s+/g, "")}`}
            className={cn(
              "flex items-center gap-2 text-sm font-semibold transition-colors",
              transparent ? "text-white" : "text-foreground"
            )}
          >
            <Phone className="h-4 w-4 text-accent" />
            {company.phone}
          </a>
          <ThemeToggle />
          <Button asChild variant="accent" size="sm">
            <Link href="/contact">Get a Quote</Link>
          </Button>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open menu"
                className={transparent ? "text-white hover:bg-white/10" : ""}
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="mb-8 flex items-center gap-2.5">
                <Image src="/brand/logo.png" alt={company.name} width={261} height={100} className="h-11 w-auto" />
              </div>
              <nav className="flex flex-col gap-1">
                {links.map((link) => (
                  <div key={link.id}>
                    <SheetClose asChild>
                      <Link
                        href={link.url}
                        target={link.openInNewTab ? "_blank" : undefined}
                        rel={link.openInNewTab ? "noopener noreferrer" : undefined}
                        className={cn(
                          "block rounded-xl px-4 py-3 text-base font-medium transition-colors hover:bg-surface-muted",
                          pathname === link.url && "bg-surface-muted text-accent"
                        )}
                      >
                        {link.label}
                      </Link>
                    </SheetClose>
                    {link.children.length > 0 && (
                      <div className="ml-4 flex flex-col gap-1 border-l border-border pl-3">
                        {link.children.map((child) => (
                          <SheetClose asChild key={child.id}>
                            <Link
                              href={child.url}
                              target={child.openInNewTab ? "_blank" : undefined}
                              rel={child.openInNewTab ? "noopener noreferrer" : undefined}
                              className="rounded-lg px-4 py-2 text-sm text-foreground/80 hover:bg-surface-muted"
                            >
                              {child.label}
                            </Link>
                          </SheetClose>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </nav>
              <div className="mt-8 space-y-3 border-t border-border pt-6">
                <a href={`tel:${company.phone.replace(/\s+/g, "")}`} className="flex items-center gap-2 text-sm font-semibold">
                  <Phone className="h-4 w-4 text-accent" />
                  {company.phone}
                </a>
                <Button asChild variant="accent" className="w-full">
                  <Link href="/contact">Get a Quote</Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
