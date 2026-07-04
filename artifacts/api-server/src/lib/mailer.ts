import nodemailer from "nodemailer";
import { logger } from "./logger";

interface ContactPayload {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (transporter) return transporter;
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !port || !user || !pass) {
    return null;
  }
  transporter = nodemailer.createTransport({
    host,
    port: Number(port),
    secure: Number(port) === 465,
    auth: { user, pass },
  });
  return transporter;
}

export async function sendContactNotification(payload: ContactPayload): Promise<void> {
  const t = getTransporter();
  if (!t) {
    logger.info({ payload }, "SMTP not configured; skipping contact notification email");
    return;
  }
  const to = process.env.CONTACT_NOTIFICATION_EMAIL || process.env.SMTP_USER;
  await t.sendMail({
    from: process.env.SMTP_USER,
    to,
    subject: `New contact message from ${payload.name}`,
    text: `Name: ${payload.name}\nEmail: ${payload.email}\nPhone: ${payload.phone ?? "-"}\n\n${payload.message}`,
  });
}
