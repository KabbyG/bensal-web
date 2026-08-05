"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { quotationSchema } from "@/lib/validations";
import { sendMail } from "@/lib/mailer";
import type { ActionResult } from "@/actions/newsletter";

export async function submitQuotationRequest(formData: FormData): Promise<ActionResult> {
  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for") ?? "unknown";

  const { success: withinLimit } = rateLimit(`quotation:${ip}`);
  if (!withinLimit) {
    return { success: false, message: "Too many requests. Please try again in a minute." };
  }

  const parsed = quotationSchema.safeParse({
    fullName: formData.get("fullName"),
    company: formData.get("company") ?? "",
    email: formData.get("email"),
    phone: formData.get("phone") ?? "",
    productOrService: formData.get("productOrService"),
    details: formData.get("details"),
    website: formData.get("website") ?? "",
  });

  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  if (parsed.data.website) {
    return { success: true, message: "Quotation request submitted." };
  }

  const { fullName, company, email, phone, productOrService, details } = parsed.data;

  try {
    await prisma.quotationRequest.create({
      data: {
        fullName,
        company: company || null,
        email,
        phone: phone || null,
        productOrService,
        details,
      },
    });
  } catch (error) {
    console.error("[quotation] failed to save request:", error);
    return { success: false, message: "Something went wrong. Please try again." };
  }

  await sendMail({
    to: process.env.CONTACT_NOTIFICATION_EMAIL ?? "md@bensal.co.tz",
    subject: `New quotation request: ${productOrService}`,
    html: `<p><strong>Name:</strong> ${fullName}</p><p><strong>Company:</strong> ${company || "-"}</p><p><strong>Email:</strong> ${email}</p><p><strong>Phone:</strong> ${phone || "-"}</p><p><strong>Product/Service:</strong> ${productOrService}</p><p>${details}</p>`,
  });

  return { success: true, message: "Quotation request submitted. Our team will reach out shortly." };
}
