import nodemailer from "nodemailer";
import { logger } from "./logger";

interface ContactPayload {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

let transporter: nodemailer.Transporter | null = null;
let warnedNoSmtp = false;

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

async function send(to: string | undefined, subject: string, text: string): Promise<void> {
  const t = getTransporter();
  if (!t) {
    if (!warnedNoSmtp) {
      logger.info("SMTP not configured; skipping outbound email notifications");
      warnedNoSmtp = true;
    }
    return;
  }
  if (!to) return;
  try {
    await t.sendMail({ from: process.env.SMTP_USER, to, subject, text });
  } catch (err) {
    logger.error({ err, to, subject }, "Failed to send email");
  }
}

export async function sendContactNotification(payload: ContactPayload): Promise<void> {
  const to = process.env.CONTACT_NOTIFICATION_EMAIL || process.env.SMTP_USER;
  await send(
    to,
    `New contact message from ${payload.name}`,
    `Name: ${payload.name}\nEmail: ${payload.email}\nPhone: ${payload.phone ?? "-"}\n\n${payload.message}`,
  );
}

export async function sendBookingConfirmation(params: {
  to: string;
  customerName: string;
  bookingNumber: string;
  serviceName: string;
  scheduledDate: string;
  timeSlot: string;
}): Promise<void> {
  await send(
    params.to,
    `Booking Confirmed — ${params.bookingNumber}`,
    `Hi ${params.customerName},\n\nYour booking for ${params.serviceName} has been received.\n\nBooking ID: ${params.bookingNumber}\nScheduled: ${params.scheduledDate} (${params.timeSlot})\n\nWe'll notify you as your technician is assigned and on the way.\n\nThank you for choosing Utkal Pest Control.`,
  );
}

export async function sendStatusUpdateEmail(params: {
  to: string;
  customerName: string;
  bookingNumber: string;
  status: string;
}): Promise<void> {
  await send(
    params.to,
    `Booking Update — ${params.bookingNumber}`,
    `Hi ${params.customerName},\n\nYour booking ${params.bookingNumber} status has been updated to: ${params.status}.\n\nTrack it any time from your dashboard.`,
  );
}

export async function sendTechnicianAssignedEmail(params: {
  to: string;
  customerName: string;
  bookingNumber: string;
  technicianName: string;
}): Promise<void> {
  await send(
    params.to,
    `Technician Assigned — ${params.bookingNumber}`,
    `Hi ${params.customerName},\n\n${params.technicianName} has been assigned to your booking ${params.bookingNumber} and will contact you before arrival.`,
  );
}

export async function sendPaymentConfirmationEmail(params: {
  to: string;
  customerName: string;
  bookingNumber: string;
  amount: number;
}): Promise<void> {
  await send(
    params.to,
    `Payment Received — ${params.bookingNumber}`,
    `Hi ${params.customerName},\n\nWe've received your payment of ₹${params.amount} for booking ${params.bookingNumber}. Thank you!`,
  );
}

export async function sendCompletionEmail(params: {
  to: string;
  customerName: string;
  bookingNumber: string;
}): Promise<void> {
  await send(
    params.to,
    `Service Completed — ${params.bookingNumber}`,
    `Hi ${params.customerName},\n\nYour service for booking ${params.bookingNumber} has been completed. We'd love to hear your feedback — please leave a review from your dashboard.`,
  );
}
