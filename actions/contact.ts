"use server";

import { headers } from "next/headers";
import path from "path";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { contactSchema } from "@/lib/validations";
import { saveUpload, UploadValidationError } from "@/lib/upload";
import { sendMail } from "@/lib/mailer";
import { contactAdminEmail, contactConfirmationEmail } from "@/lib/email-templates";
import type { ActionResult } from "@/actions/newsletter";

export async function submitContactForm(formData: FormData): Promise<ActionResult> {
  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for") ?? "unknown";

  const { success: withinLimit } = rateLimit(`contact:${ip}`);
  if (!withinLimit) {
    return { success: false, message: "Too many requests. Please try again in a minute." };
  }

  const parsed = contactSchema.safeParse({
    fullName: formData.get("fullName"),
    company: formData.get("company") ?? "",
    email: formData.get("email"),
    phone: formData.get("phone") ?? "",
    subject: formData.get("subject"),
    message: formData.get("message"),
    website: formData.get("website") ?? "",
  });

  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  // Honeypot triggered — silently pretend success to not tip off bots.
  if (parsed.data.website) {
    return { success: true, message: "Thank you! We'll be in touch shortly." };
  }

  const { fullName, company, email, phone, subject, message } = parsed.data;

  let attachmentUrl: string | null = null;
  const file = formData.get("attachment");
  if (file instanceof File && file.size > 0) {
    try {
      attachmentUrl = await saveUpload(file, "contact");
    } catch (error) {
      if (error instanceof UploadValidationError) {
        return { success: false, message: error.message };
      }
      throw error;
    }
  }

  try {
    await prisma.contactMessage.create({
      data: {
        fullName,
        company: company || null,
        email,
        phone: phone || null,
        subject,
        message,
        attachmentUrl,
      },
    });
  } catch (error) {
    console.error("[contact] failed to save message:", error);
    return { success: false, message: "Something went wrong. Please try again." };
  }

  const notifyEmail = process.env.CONTACT_NOTIFICATION_EMAIL ?? "md@bensal.co.tz";

  await sendMail({
    to: notifyEmail,
    subject: `New contact message: ${subject}`,
    html: contactAdminEmail({ fullName, company, email, phone, subject, message }),
    attachments: attachmentUrl
      ? [{ filename: path.basename(attachmentUrl), path: `./public${attachmentUrl}` }]
      : undefined,
  });

  await sendMail({
    to: email,
    subject: "We've received your message — Bensal Investment Co. Ltd.",
    html: contactConfirmationEmail(fullName),
  });

  return { success: true, message: "Thank you! We'll be in touch shortly." };
}
