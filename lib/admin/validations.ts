import { z } from "zod";

const optionalString = z.string().trim().optional().or(z.literal(""));

export const businessHourSchema = z.object({
  day: z.string().trim().min(1),
  open: z.string().trim().min(1),
  // Empty on purpose for fully-closed days (e.g. "Sunday" / "Closed") — the
  // public site renders `open` alone when `close` is blank.
  close: optionalString,
});

export const statSchema = z.object({
  label: z.string().trim().min(1),
  value: z.coerce.number(),
  suffix: optionalString,
});

export const contractHistoryPointSchema = z.object({
  year: z.coerce.number(),
  cleaning: z.coerce.number().nullable(),
  fumigation: z.coerce.number().nullable(),
});

export const companySchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  legalName: z.string().trim().min(1, "Legal name is required"),
  slogan: z.string().trim().min(1, "Slogan is required"),
  description: z.string().trim().min(1, "Description is required"),
  mission: z.string().trim().min(1, "Mission is required"),
  vision: z.string().trim().min(1, "Vision is required"),
  foundedYear: z.coerce.number().int().min(1900).max(2100),
  staffCount: z.string().trim().min(1),
  email: z.string().trim().email("Enter a valid email"),
  altEmails: z.array(z.string().trim().email()).default([]),
  phone: z.string().trim().min(1),
  altPhones: z.array(z.string().trim().min(1)).default([]),
  whatsapp: z.string().trim().min(1),
  address: z.string().trim().min(1),
  city: z.string().trim().min(1),
  country: z.string().trim().min(1),
  mapEmbedUrl: optionalString,
  businessHours: z.array(businessHourSchema).default([]),
  socials: z.record(z.string(), z.string()).default({}),
  stats: z.array(statSchema).default([]),
  branches: z.array(z.string().trim().min(1)).default([]),
  contractHistory: z.array(contractHistoryPointSchema).default([]),
  seoTitle: optionalString,
  seoDescription: optionalString,
});

export const teamMemberSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  title: z.string().trim().min(1, "Title is required"),
  bio: optionalString,
  isLeadership: z.coerce.boolean().default(false),
  order: z.coerce.number().int().default(0),
});

export const serviceSchema = z.object({
  slug: z.string().trim().min(1, "Slug is required"),
  title: z.string().trim().min(1, "Title is required"),
  shortDescription: z.string().trim().min(1, "Short description is required"),
  description: z.string().trim().min(1, "Description is required"),
  icon: z.string().trim().min(1, "Icon is required"),
  order: z.coerce.number().int().default(0),
  isFeatured: z.coerce.boolean().default(true),
  seoTitle: optionalString,
  seoDescription: optionalString,
});

export const productCategorySchema = z.object({
  slug: z.string().trim().min(1, "Slug is required"),
  name: z.string().trim().min(1, "Name is required"),
  description: optionalString,
  order: z.coerce.number().int().default(0),
});

export const productSchema = z.object({
  slug: z.string().trim().min(1, "Slug is required"),
  name: z.string().trim().min(1, "Name is required"),
  categoryId: z.string().trim().min(1, "Category is required"),
  shortDescription: z.string().trim().min(1, "Short description is required"),
  description: z.string().trim().min(1, "Description is required"),
  sku: optionalString,
  isFeatured: z.coerce.boolean().default(false),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("PUBLISHED"),
});

export const projectSchema = z.object({
  slug: z.string().trim().min(1, "Slug is required"),
  title: z.string().trim().min(1, "Title is required"),
  client: optionalString,
  category: z.string().trim().min(1, "Category is required"),
  location: optionalString,
  year: z.coerce.number().int().optional(),
  summary: z.string().trim().min(1, "Summary is required"),
  description: z.string().trim().min(1, "Description is required"),
  status: z.enum(["ONGOING", "COMPLETED"]).default("COMPLETED"),
});

export const galleryItemSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  type: z.enum(["IMAGE", "VIDEO"]).default("IMAGE"),
  url: optionalString,
  category: optionalString,
  order: z.coerce.number().int().default(0),
});

export const newsPostSchema = z.object({
  slug: z.string().trim().min(1, "Slug is required"),
  title: z.string().trim().min(1, "Title is required"),
  excerpt: z.string().trim().min(1, "Excerpt is required"),
  content: z.string().trim().min(1, "Content is required"),
  category: optionalString,
  tags: z.array(z.string().trim().min(1)).default([]),
  author: optionalString,
  published: z.coerce.boolean().default(false),
  seoTitle: optionalString,
  seoDescription: optionalString,
});

export const testimonialSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  company: optionalString,
  role: optionalString,
  message: z.string().trim().min(1, "Message is required"),
  rating: z.coerce.number().int().min(1).max(5).default(5),
  order: z.coerce.number().int().default(0),
  published: z.coerce.boolean().default(true),
});

export const partnerSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  url: optionalString,
  order: z.coerce.number().int().default(0),
});

export const clientSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  url: optionalString,
  order: z.coerce.number().int().default(0),
});

export const faqSchema = z.object({
  question: z.string().trim().min(1, "Question is required"),
  answer: z.string().trim().min(1, "Answer is required"),
  category: optionalString,
  order: z.coerce.number().int().default(0),
});

export const menuItemSchema = z.object({
  label: z.string().trim().min(1, "Label is required"),
  url: z.string().trim().min(1, "URL is required"),
  parentId: z.string().trim().optional().or(z.literal("")),
  openInNewTab: z.coerce.boolean().default(false),
});

export const seoMetaSchema = z.object({
  page: z.string().trim().min(1, "Page key is required"),
  title: optionalString,
  description: optionalString,
});

export const jobPostingSchema = z.object({
  slug: z.string().trim().min(1, "Slug is required"),
  title: z.string().trim().min(1, "Title is required"),
  department: optionalString,
  location: z.string().trim().min(1, "Location is required"),
  type: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP"]).default("FULL_TIME"),
  description: z.string().trim().min(1, "Description is required"),
  requirements: z.string().trim().min(1, "Requirements are required"),
  isActive: z.coerce.boolean().default(true),
  closingDate: optionalString,
});
