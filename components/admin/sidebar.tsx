"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Users,
  Wrench,
  Package,
  FolderTree,
  Images,
  Newspaper,
  Star,
  Handshake,
  Users2,
  HelpCircle,
  Briefcase,
  Mail,
  FileText,
  Send,
  Bell,
  Search,
  ListTree,
  Trash2,
  ScrollText,
  Menu as MenuIcon,
  BadgeCheck,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const NAV_SECTIONS: { label: string; items: { href: string; label: string; icon: LucideIcon }[] }[] = [
  {
    label: "Overview",
    items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Site",
    items: [
      { href: "/admin/company", label: "Company Settings", icon: Building2 },
      { href: "/admin/team", label: "Team", icon: Users },
      { href: "/admin/menus", label: "Menus", icon: ListTree },
      { href: "/admin/nest", label: "NEST Business Lines", icon: BadgeCheck },
      { href: "/admin/seo", label: "SEO", icon: Search },
    ],
  },
  {
    label: "Catalog",
    items: [
      { href: "/admin/services", label: "Services", icon: Wrench },
      { href: "/admin/product-categories", label: "Product Categories", icon: FolderTree },
      { href: "/admin/products", label: "Products", icon: Package },
      { href: "/admin/projects", label: "Projects", icon: Briefcase },
      { href: "/admin/gallery", label: "Gallery", icon: Images },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/news", label: "News", icon: Newspaper },
      { href: "/admin/testimonials", label: "Testimonials", icon: Star },
      { href: "/admin/partners", label: "Partners", icon: Handshake },
      { href: "/admin/clients", label: "Clients", icon: Users2 },
      { href: "/admin/faqs", label: "FAQs", icon: HelpCircle },
      { href: "/admin/careers", label: "Job Postings", icon: Briefcase },
    ],
  },
  {
    label: "Inbox",
    items: [
      { href: "/admin/messages", label: "Messages", icon: Mail },
      { href: "/admin/quotations", label: "Quotations", icon: FileText },
      { href: "/admin/applications", label: "Applications", icon: Send },
      { href: "/admin/newsletter", label: "Newsletter", icon: Bell },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/admin/trash", label: "Trash", icon: Trash2 },
      { href: "/admin/audit-log", label: "Audit Log", icon: ScrollText },
    ],
  },
];

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex-1 space-y-6 overflow-y-auto p-4">
      {NAV_SECTIONS.map((section) => (
        <div key={section.label}>
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {section.label}
          </p>
          <div className="mt-2 space-y-1">
            {section.items.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                    active ? "bg-accent/15 text-accent" : "text-foreground/80 hover:bg-surface-muted"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

export function AdminSidebar({ companyName }: { companyName: string }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-border bg-card lg:flex lg:flex-col">
      <div className="flex h-16 items-center border-b border-border px-6">
        <span className="font-display text-sm font-semibold">{companyName} Admin</span>
      </div>
      <NavLinks pathname={pathname} />
    </aside>
  );
}

export function AdminMobileNav({ companyName }: { companyName: string }) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Open admin menu" className="lg:hidden">
          <MenuIcon className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-72 p-0">
        <div className="flex h-16 items-center border-b border-border px-6">
          <span className="font-display text-sm font-semibold">{companyName} Admin</span>
        </div>
        <NavLinks pathname={pathname} onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
