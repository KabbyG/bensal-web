import { prisma } from "@/lib/prisma";

export async function getCompany() {
  const company = await prisma.company.findFirst();
  if (!company) {
    throw new Error(
      "No Company record found — run `pnpm prisma:seed` to populate site content."
    );
  }
  return company;
}

export function getLeadership() {
  return prisma.teamMember.findMany({
    where: { isLeadership: true, deletedAt: null },
    orderBy: { order: "asc" },
  });
}

export function getServices() {
  return prisma.service.findMany({ where: { deletedAt: null }, orderBy: { order: "asc" } });
}

export function getService(slug: string) {
  return prisma.service.findFirst({ where: { slug, deletedAt: null } });
}

export function getProductCategories() {
  return prisma.productCategory.findMany({
    where: { deletedAt: null },
    orderBy: { order: "asc" },
    include: { _count: { select: { products: { where: { deletedAt: null } } } } },
  });
}

export function getProducts(params?: { categorySlug?: string; search?: string; page?: number; pageSize?: number }) {
  const { categorySlug, search, page = 1, pageSize = 12 } = params ?? {};
  const where = {
    status: "PUBLISHED" as const,
    deletedAt: null,
    ...(categorySlug ? { category: { slug: categorySlug } } : {}),
    ...(search
      ? { name: { contains: search, mode: "insensitive" as const } }
      : {}),
  };
  return Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.product.count({ where }),
  ]);
}

export function getProjects() {
  return prisma.project.findMany({ where: { deletedAt: null }, orderBy: { createdAt: "desc" } });
}

export function getGalleryItems() {
  return prisma.galleryItem.findMany({ where: { deletedAt: null }, orderBy: { order: "asc" } });
}

export function getNewsPosts() {
  return prisma.newsPost.findMany({
    where: { published: true, deletedAt: null },
    orderBy: { publishedAt: "desc" },
  });
}

export function getTestimonials() {
  return prisma.testimonial.findMany({
    where: { published: true, deletedAt: null },
    orderBy: { order: "asc" },
  });
}

export function getPartners() {
  return prisma.partner.findMany({ where: { deletedAt: null }, orderBy: { order: "asc" } });
}

export function getFaqs() {
  return prisma.faq.findMany({ where: { deletedAt: null }, orderBy: { order: "asc" } });
}

export function getActiveJobPostings() {
  return prisma.jobPosting.findMany({
    where: { isActive: true, deletedAt: null },
    orderBy: { createdAt: "desc" },
  });
}

export type NavLink = {
  id: string;
  label: string;
  url: string;
  openInNewTab: boolean;
  children: { id: string; label: string; url: string; openInNewTab: boolean }[];
};

export async function getMenu(key: string): Promise<NavLink[]> {
  const menu = await prisma.menu.findUnique({
    where: { key },
    include: { items: { orderBy: { order: "asc" } } },
  });
  if (!menu) return [];
  const topLevel = menu.items.filter((item) => !item.parentId);
  return topLevel.map((item) => ({
    id: item.id,
    label: item.label,
    url: item.url,
    openInNewTab: item.openInNewTab,
    children: menu.items
      .filter((child) => child.parentId === item.id)
      .map((child) => ({
        id: child.id,
        label: child.label,
        url: child.url,
        openInNewTab: child.openInNewTab,
      })),
  }));
}
