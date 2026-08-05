import { z } from "zod";

export const contactSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required").max(120),
  company: z.string().trim().max(120).optional().or(z.literal("")),
  email: z.string().trim().email("Enter a valid email address"),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  subject: z.string().trim().min(2, "Subject is required").max(160),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(5000),
  // honeypot field — real users never fill this in
  website: z.string().max(0).optional().or(z.literal("")),
});

export const careerApplicationSchema = z.object({
  jobPostingId: z.string().optional().or(z.literal("")),
  fullName: z.string().trim().min(2, "Full name is required").max(120),
  email: z.string().trim().email("Enter a valid email address"),
  phone: z.string().trim().min(6, "Phone number is required").max(40),
  coverLetter: z.string().trim().max(5000).optional().or(z.literal("")),
  website: z.string().max(0).optional().or(z.literal("")),
});

export const newsletterSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
});

export const quotationSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required").max(120),
  company: z.string().trim().max(120).optional().or(z.literal("")),
  email: z.string().trim().email("Enter a valid email address"),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  productOrService: z.string().trim().min(2, "Please specify a product or service").max(200),
  details: z.string().trim().min(10, "Please add a few details").max(5000),
  website: z.string().max(0).optional().or(z.literal("")),
});
