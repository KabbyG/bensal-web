"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { newsletterSchema } from "@/lib/validations";

export interface ActionResult {
  success: boolean;
  message: string;
}

export async function subscribeToNewsletter(formData: FormData): Promise<ActionResult> {
  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for") ?? "unknown";

  const { success } = rateLimit(`newsletter:${ip}`);
  if (!success) {
    return { success: false, message: "Too many requests. Please try again in a minute." };
  }

  const parsed = newsletterSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid email." };
  }

  try {
    await prisma.newsletterSubscriber.upsert({
      where: { email: parsed.data.email },
      update: { isActive: true },
      create: { email: parsed.data.email },
    });
    return { success: true, message: "Thanks for subscribing!" };
  } catch (error) {
    console.error("[newsletter] subscribe failed:", error);
    return { success: false, message: "Something went wrong. Please try again." };
  }
}
