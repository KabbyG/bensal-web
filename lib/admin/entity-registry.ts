import { prisma } from "@/lib/prisma";
import type { ExportColumn } from "@/lib/admin/export";

type EntityRow = { id: string } & Record<string, unknown>;

export type EntityConfig = {
  key: string;
  label: string;
  adminPath: string;
  listNonDeleted: () => Promise<EntityRow[]>;
  listDeleted: () => Promise<EntityRow[]>;
  restore: (id: string) => Promise<unknown>;
  permanentDelete: (id: string) => Promise<unknown>;
  exportColumns: ExportColumn<EntityRow>[];
  rowLabel: (row: EntityRow) => string;
};

const date = (v: unknown) => (v instanceof Date ? v.toISOString().slice(0, 10) : "");
const str = (v: unknown) => (v == null ? "" : String(v));

export const entityRegistry: Record<string, EntityConfig> = {
  team: {
    key: "team",
    label: "Team Members",
    adminPath: "/admin/team",
    listNonDeleted: () => prisma.teamMember.findMany({ where: { deletedAt: null }, orderBy: { order: "asc" } }),
    listDeleted: () => prisma.teamMember.findMany({ where: { deletedAt: { not: null } }, orderBy: { name: "asc" } }),
    restore: (id) => prisma.teamMember.update({ where: { id }, data: { deletedAt: null } }),
    permanentDelete: (id) => prisma.teamMember.delete({ where: { id } }),
    rowLabel: (r) => str(r.name),
    exportColumns: [
      { header: "Name", value: (r) => str(r.name) },
      { header: "Title", value: (r) => str(r.title) },
      { header: "Leadership", value: (r) => (r.isLeadership ? "Yes" : "No") },
      { header: "Order", value: (r) => str(r.order) },
      { header: "Created", value: (r) => date(r.createdAt) },
    ],
  },
  services: {
    key: "services",
    label: "Services",
    adminPath: "/admin/services",
    listNonDeleted: () => prisma.service.findMany({ where: { deletedAt: null }, orderBy: { order: "asc" } }),
    listDeleted: () => prisma.service.findMany({ where: { deletedAt: { not: null } }, orderBy: { title: "asc" } }),
    restore: (id) => prisma.service.update({ where: { id }, data: { deletedAt: null } }),
    permanentDelete: (id) => prisma.service.delete({ where: { id } }),
    rowLabel: (r) => str(r.title),
    exportColumns: [
      { header: "Title", value: (r) => str(r.title) },
      { header: "Slug", value: (r) => str(r.slug) },
      { header: "Short description", value: (r) => str(r.shortDescription) },
      { header: "Featured", value: (r) => (r.isFeatured ? "Yes" : "No") },
      { header: "Order", value: (r) => str(r.order) },
      { header: "Updated", value: (r) => date(r.updatedAt) },
    ],
  },
  "product-categories": {
    key: "product-categories",
    label: "Product Categories",
    adminPath: "/admin/product-categories",
    listNonDeleted: () =>
      prisma.productCategory.findMany({
        where: { deletedAt: null },
        orderBy: { order: "asc" },
        include: { _count: { select: { products: true } } },
      }),
    listDeleted: () => prisma.productCategory.findMany({ where: { deletedAt: { not: null } }, orderBy: { name: "asc" } }),
    restore: (id) => prisma.productCategory.update({ where: { id }, data: { deletedAt: null } }),
    permanentDelete: (id) => prisma.productCategory.delete({ where: { id } }),
    rowLabel: (r) => str(r.name),
    exportColumns: [
      { header: "Name", value: (r) => str(r.name) },
      { header: "Slug", value: (r) => str(r.slug) },
      { header: "Order", value: (r) => str(r.order) },
    ],
  },
  products: {
    key: "products",
    label: "Products",
    adminPath: "/admin/products",
    listNonDeleted: () =>
      prisma.product.findMany({ where: { deletedAt: null }, orderBy: { createdAt: "desc" }, include: { category: true } }),
    listDeleted: () => prisma.product.findMany({ where: { deletedAt: { not: null } }, orderBy: { name: "asc" } }),
    restore: (id) => prisma.product.update({ where: { id }, data: { deletedAt: null } }),
    permanentDelete: (id) => prisma.product.delete({ where: { id } }),
    rowLabel: (r) => str(r.name),
    exportColumns: [
      { header: "Name", value: (r) => str(r.name) },
      { header: "Slug", value: (r) => str(r.slug) },
      { header: "SKU", value: (r) => str(r.sku) },
      { header: "Status", value: (r) => str(r.status) },
      { header: "Featured", value: (r) => (r.isFeatured ? "Yes" : "No") },
      { header: "Created", value: (r) => date(r.createdAt) },
    ],
  },
  projects: {
    key: "projects",
    label: "Projects",
    adminPath: "/admin/projects",
    listNonDeleted: () => prisma.project.findMany({ where: { deletedAt: null }, orderBy: { createdAt: "desc" } }),
    listDeleted: () => prisma.project.findMany({ where: { deletedAt: { not: null } }, orderBy: { title: "asc" } }),
    restore: (id) => prisma.project.update({ where: { id }, data: { deletedAt: null } }),
    permanentDelete: (id) => prisma.project.delete({ where: { id } }),
    rowLabel: (r) => str(r.title),
    exportColumns: [
      { header: "Title", value: (r) => str(r.title) },
      { header: "Client", value: (r) => str(r.client) },
      { header: "Category", value: (r) => str(r.category) },
      { header: "Status", value: (r) => str(r.status) },
      { header: "Year", value: (r) => str(r.year) },
    ],
  },
  gallery: {
    key: "gallery",
    label: "Gallery",
    adminPath: "/admin/gallery",
    listNonDeleted: () => prisma.galleryItem.findMany({ where: { deletedAt: null }, orderBy: { order: "asc" } }),
    listDeleted: () => prisma.galleryItem.findMany({ where: { deletedAt: { not: null } }, orderBy: { title: "asc" } }),
    restore: (id) => prisma.galleryItem.update({ where: { id }, data: { deletedAt: null } }),
    permanentDelete: (id) => prisma.galleryItem.delete({ where: { id } }),
    rowLabel: (r) => str(r.title),
    exportColumns: [
      { header: "Title", value: (r) => str(r.title) },
      { header: "Type", value: (r) => str(r.type) },
      { header: "Category", value: (r) => str(r.category) },
      { header: "Order", value: (r) => str(r.order) },
    ],
  },
  news: {
    key: "news",
    label: "News",
    adminPath: "/admin/news",
    listNonDeleted: () => prisma.newsPost.findMany({ where: { deletedAt: null }, orderBy: { createdAt: "desc" } }),
    listDeleted: () => prisma.newsPost.findMany({ where: { deletedAt: { not: null } }, orderBy: { title: "asc" } }),
    restore: (id) => prisma.newsPost.update({ where: { id }, data: { deletedAt: null } }),
    permanentDelete: (id) => prisma.newsPost.delete({ where: { id } }),
    rowLabel: (r) => str(r.title),
    exportColumns: [
      { header: "Title", value: (r) => str(r.title) },
      { header: "Slug", value: (r) => str(r.slug) },
      { header: "Category", value: (r) => str(r.category) },
      { header: "Published", value: (r) => (r.published ? "Yes" : "No") },
      { header: "Published at", value: (r) => date(r.publishedAt) },
    ],
  },
  testimonials: {
    key: "testimonials",
    label: "Testimonials",
    adminPath: "/admin/testimonials",
    listNonDeleted: () => prisma.testimonial.findMany({ where: { deletedAt: null }, orderBy: { order: "asc" } }),
    listDeleted: () => prisma.testimonial.findMany({ where: { deletedAt: { not: null } }, orderBy: { name: "asc" } }),
    restore: (id) => prisma.testimonial.update({ where: { id }, data: { deletedAt: null } }),
    permanentDelete: (id) => prisma.testimonial.delete({ where: { id } }),
    rowLabel: (r) => str(r.name),
    exportColumns: [
      { header: "Name", value: (r) => str(r.name) },
      { header: "Company", value: (r) => str(r.company) },
      { header: "Rating", value: (r) => str(r.rating) },
      { header: "Published", value: (r) => (r.published ? "Yes" : "No") },
    ],
  },
  partners: {
    key: "partners",
    label: "Partners",
    adminPath: "/admin/partners",
    listNonDeleted: () => prisma.partner.findMany({ where: { deletedAt: null }, orderBy: { order: "asc" } }),
    listDeleted: () => prisma.partner.findMany({ where: { deletedAt: { not: null } }, orderBy: { name: "asc" } }),
    restore: (id) => prisma.partner.update({ where: { id }, data: { deletedAt: null } }),
    permanentDelete: (id) => prisma.partner.delete({ where: { id } }),
    rowLabel: (r) => str(r.name),
    exportColumns: [
      { header: "Name", value: (r) => str(r.name) },
      { header: "URL", value: (r) => str(r.url) },
      { header: "Order", value: (r) => str(r.order) },
    ],
  },
  clients: {
    key: "clients",
    label: "Clients",
    adminPath: "/admin/clients",
    listNonDeleted: () => prisma.client.findMany({ where: { deletedAt: null }, orderBy: { order: "asc" } }),
    listDeleted: () => prisma.client.findMany({ where: { deletedAt: { not: null } }, orderBy: { name: "asc" } }),
    restore: (id) => prisma.client.update({ where: { id }, data: { deletedAt: null } }),
    permanentDelete: (id) => prisma.client.delete({ where: { id } }),
    rowLabel: (r) => str(r.name),
    exportColumns: [
      { header: "Name", value: (r) => str(r.name) },
      { header: "URL", value: (r) => str(r.url) },
      { header: "Order", value: (r) => str(r.order) },
    ],
  },
  faqs: {
    key: "faqs",
    label: "FAQs",
    adminPath: "/admin/faqs",
    listNonDeleted: () => prisma.faq.findMany({ where: { deletedAt: null }, orderBy: { order: "asc" } }),
    listDeleted: () => prisma.faq.findMany({ where: { deletedAt: { not: null } }, orderBy: { question: "asc" } }),
    restore: (id) => prisma.faq.update({ where: { id }, data: { deletedAt: null } }),
    permanentDelete: (id) => prisma.faq.delete({ where: { id } }),
    rowLabel: (r) => str(r.question),
    exportColumns: [
      { header: "Question", value: (r) => str(r.question) },
      { header: "Category", value: (r) => str(r.category) },
      { header: "Order", value: (r) => str(r.order) },
    ],
  },
  careers: {
    key: "careers",
    label: "Job Postings",
    adminPath: "/admin/careers",
    listNonDeleted: () => prisma.jobPosting.findMany({ where: { deletedAt: null }, orderBy: { createdAt: "desc" } }),
    listDeleted: () => prisma.jobPosting.findMany({ where: { deletedAt: { not: null } }, orderBy: { title: "asc" } }),
    restore: (id) => prisma.jobPosting.update({ where: { id }, data: { deletedAt: null } }),
    permanentDelete: (id) => prisma.jobPosting.delete({ where: { id } }),
    rowLabel: (r) => str(r.title),
    exportColumns: [
      { header: "Title", value: (r) => str(r.title) },
      { header: "Department", value: (r) => str(r.department) },
      { header: "Location", value: (r) => str(r.location) },
      { header: "Type", value: (r) => str(r.type) },
      { header: "Active", value: (r) => (r.isActive ? "Yes" : "No") },
    ],
  },
  applications: {
    key: "applications",
    label: "Job Applications",
    adminPath: "/admin/applications",
    listNonDeleted: () =>
      prisma.jobApplication.findMany({ where: { deletedAt: null }, orderBy: { createdAt: "desc" }, include: { jobPosting: true } }),
    listDeleted: () => prisma.jobApplication.findMany({ where: { deletedAt: { not: null } }, orderBy: { fullName: "asc" } }),
    restore: (id) => prisma.jobApplication.update({ where: { id }, data: { deletedAt: null } }),
    permanentDelete: (id) => prisma.jobApplication.delete({ where: { id } }),
    rowLabel: (r) => str(r.fullName),
    exportColumns: [
      { header: "Full name", value: (r) => str(r.fullName) },
      { header: "Email", value: (r) => str(r.email) },
      { header: "Phone", value: (r) => str(r.phone) },
      { header: "Status", value: (r) => str(r.status) },
      { header: "Applied", value: (r) => date(r.createdAt) },
    ],
  },
  messages: {
    key: "messages",
    label: "Contact Messages",
    adminPath: "/admin/messages",
    listNonDeleted: () => prisma.contactMessage.findMany({ where: { deletedAt: null }, orderBy: { createdAt: "desc" } }),
    listDeleted: () => prisma.contactMessage.findMany({ where: { deletedAt: { not: null } }, orderBy: { fullName: "asc" } }),
    restore: (id) => prisma.contactMessage.update({ where: { id }, data: { deletedAt: null } }),
    permanentDelete: (id) => prisma.contactMessage.delete({ where: { id } }),
    rowLabel: (r) => str(r.fullName),
    exportColumns: [
      { header: "Full name", value: (r) => str(r.fullName) },
      { header: "Email", value: (r) => str(r.email) },
      { header: "Subject", value: (r) => str(r.subject) },
      { header: "Status", value: (r) => str(r.status) },
      { header: "Received", value: (r) => date(r.createdAt) },
    ],
  },
  quotations: {
    key: "quotations",
    label: "Quotation Requests",
    adminPath: "/admin/quotations",
    listNonDeleted: () => prisma.quotationRequest.findMany({ where: { deletedAt: null }, orderBy: { createdAt: "desc" } }),
    listDeleted: () => prisma.quotationRequest.findMany({ where: { deletedAt: { not: null } }, orderBy: { fullName: "asc" } }),
    restore: (id) => prisma.quotationRequest.update({ where: { id }, data: { deletedAt: null } }),
    permanentDelete: (id) => prisma.quotationRequest.delete({ where: { id } }),
    rowLabel: (r) => str(r.fullName),
    exportColumns: [
      { header: "Full name", value: (r) => str(r.fullName) },
      { header: "Email", value: (r) => str(r.email) },
      { header: "Product/Service", value: (r) => str(r.productOrService) },
      { header: "Status", value: (r) => str(r.status) },
      { header: "Received", value: (r) => date(r.createdAt) },
    ],
  },
  newsletter: {
    key: "newsletter",
    label: "Newsletter Subscribers",
    adminPath: "/admin/newsletter",
    listNonDeleted: () => prisma.newsletterSubscriber.findMany({ where: { deletedAt: null }, orderBy: { subscribedAt: "desc" } }),
    listDeleted: () => prisma.newsletterSubscriber.findMany({ where: { deletedAt: { not: null } }, orderBy: { email: "asc" } }),
    restore: (id) => prisma.newsletterSubscriber.update({ where: { id }, data: { deletedAt: null } }),
    permanentDelete: (id) => prisma.newsletterSubscriber.delete({ where: { id } }),
    rowLabel: (r) => str(r.email),
    exportColumns: [
      { header: "Email", value: (r) => str(r.email) },
      { header: "Active", value: (r) => (r.isActive ? "Yes" : "No") },
      { header: "Subscribed", value: (r) => date(r.subscribedAt) },
    ],
  },
};

export function getEntityConfig(key: string): EntityConfig | undefined {
  return entityRegistry[key];
}
