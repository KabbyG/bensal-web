import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminDashboardPage() {
  const [
    messages,
    quotations,
    applications,
    subscribers,
    services,
    products,
    projects,
    news,
  ] = await Promise.all([
    prisma.contactMessage.count({ where: { status: "NEW", deletedAt: null } }),
    prisma.quotationRequest.count({ where: { status: "NEW", deletedAt: null } }),
    prisma.jobApplication.count({ where: { status: "PENDING", deletedAt: null } }),
    prisma.newsletterSubscriber.count({ where: { isActive: true, deletedAt: null } }),
    prisma.service.count({ where: { deletedAt: null } }),
    prisma.product.count({ where: { deletedAt: null } }),
    prisma.project.count({ where: { deletedAt: null } }),
    prisma.newsPost.count({ where: { deletedAt: null } }),
  ]);

  const inbox = [
    { label: "New Messages", value: messages, href: "/admin/messages" },
    { label: "New Quotation Requests", value: quotations, href: "/admin/quotations" },
    { label: "Pending Applications", value: applications, href: "/admin/applications" },
    { label: "Newsletter Subscribers", value: subscribers, href: "/admin/newsletter" },
  ];

  const content = [
    { label: "Services", value: services, href: "/admin/services" },
    { label: "Products", value: products, href: "/admin/products" },
    { label: "Projects", value: projects, href: "/admin/projects" },
    { label: "News Posts", value: news, href: "/admin/news" },
  ];

  return (
    <div>
      <h1 className="font-display text-xl font-semibold">Dashboard</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Live overview of your site content and inbound submissions.
      </p>

      <p className="mt-8 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Inbox
      </p>
      <div className="mt-3 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {inbox.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="transition-colors hover:border-accent">
              <CardHeader>
                <CardTitle className="text-3xl">{stat.value}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 text-sm text-muted-foreground">{stat.label}</CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <p className="mt-8 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Content
      </p>
      <div className="mt-3 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {content.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="transition-colors hover:border-accent">
              <CardHeader>
                <CardTitle className="text-3xl">{stat.value}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 text-sm text-muted-foreground">{stat.label}</CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
