"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { careerApplicationSchema } from "@/lib/validations";
import { saveUpload, UploadValidationError } from "@/lib/upload";
import { sendMail } from "@/lib/mailer";
import { careerAdminEmail, careerConfirmationEmail } from "@/lib/email-templates";
import type { ActionResult } from "@/actions/newsletter";

export async function submitJobApplication(formData: FormData): Promise<ActionResult> {
  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for") ?? "unknown";

  const { success: withinLimit } = rateLimit(`career:${ip}`);
  if (!withinLimit) {
    return { success: false, message: "Too many requests. Please try again in a minute." };
  }

  const parsed = careerApplicationSchema.safeParse({
    jobPostingId: formData.get("jobPostingId") ?? "",
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    coverLetter: formData.get("coverLetter") ?? "",
    website: formData.get("website") ?? "",
  });

  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  if (parsed.data.website) {
    return { success: true, message: "Application submitted successfully." };
  }

  const { jobPostingId, fullName, email, phone, coverLetter } = parsed.data;

  const cvFile = formData.get("cv");
  if (!(cvFile instanceof File) || cvFile.size === 0) {
    return { success: false, message: "Please attach your CV." };
  }

  let cvUrl: string;
  try {
    cvUrl = await saveUpload(cvFile, "careers");
  } catch (error) {
    if (error instanceof UploadValidationError) {
      return { success: false, message: error.message };
    }
    throw error;
  }

  const certificateUrls: string[] = [];
  const certFiles = formData.getAll("certificates");
  for (const cert of certFiles) {
    if (cert instanceof File && cert.size > 0) {
      try {
        certificateUrls.push(await saveUpload(cert, "careers"));
      } catch (error) {
        if (error instanceof UploadValidationError) {
          return { success: false, message: error.message };
        }
        throw error;
      }
    }
  }

  let jobTitle: string | undefined;
  try {
    if (jobPostingId) {
      const posting = await prisma.jobPosting.findUnique({ where: { id: jobPostingId } });
      jobTitle = posting?.title;
    }

    await prisma.jobApplication.create({
      data: {
        jobPostingId: jobPostingId || null,
        fullName,
        email,
        phone,
        coverLetter: coverLetter || null,
        cvUrl,
        certificateUrls,
      },
    });
  } catch (error) {
    console.error("[career] failed to save application:", error);
    return { success: false, message: "Something went wrong. Please try again." };
  }

  await sendMail({
    to: process.env.CONTACT_NOTIFICATION_EMAIL ?? "md@bensal.co.tz",
    subject: `New job application: ${fullName}`,
    html: careerAdminEmail({ fullName, email, phone, jobTitle }),
    attachments: [{ filename: cvUrl.split("/").pop() ?? "cv", path: `./public${cvUrl}` }],
  });

  await sendMail({
    to: email,
    subject: "Application received — Bensal Investment Co. Ltd.",
    html: careerConfirmationEmail(fullName),
  });

  return { success: true, message: "Application submitted successfully." };
}
