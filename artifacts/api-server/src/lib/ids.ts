import crypto from "node:crypto";

function randomSuffix(length: number): string {
  return crypto.randomBytes(length).toString("hex").toUpperCase().slice(0, length * 2);
}

export function generateBookingNumber(): string {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `UPC-${y}${m}${d}-${randomSuffix(3)}`;
}

export function generateInvoiceNumber(): string {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `INV-${y}${m}-${randomSuffix(4)}`;
}
