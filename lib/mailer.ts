import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  return transporter;
}

export interface SendMailInput {
  to: string;
  subject: string;
  html: string;
  attachments?: { filename: string; path: string }[];
}

/**
 * Sends an email and never throws — logs the failure and returns false
 * instead. Contact/career/quotation forms must still succeed (the DB
 * write is the source of truth) even if SMTP isn't configured yet.
 */
export async function sendMail(input: SendMailInput): Promise<boolean> {
  try {
    await getTransporter().sendMail({
      from: process.env.MAIL_FROM ?? "no-reply@bensal.co.tz",
      to: input.to,
      subject: input.subject,
      html: input.html,
      attachments: input.attachments,
    });
    return true;
  } catch (error) {
    console.error("[mailer] Failed to send email:", error);
    return false;
  }
}
