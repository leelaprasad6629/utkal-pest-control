export const BUSINESS_NAME = import.meta.env.VITE_BUSINESS_NAME ?? "Utkal Pest Control";
export const TAGLINE =
  import.meta.env.VITE_TAGLINE ?? "Trusted, eco-friendly pest control near you";
export const SERVICE_AREAS = (import.meta.env.VITE_SERVICE_AREAS ?? "Pan-India")
  .split(",")
  .map((s: string) => s.trim());

/** E.164 digits only — country code + number, no + or spaces (e.g. 919876543210). */
export const WHATSAPP_NUMBER =
  import.meta.env.VITE_WHATSAPP_NUMBER ?? "919876543210";

export function getWhatsAppUrl(message?: string): string {
  const digits = WHATSAPP_NUMBER.replace(/\D/g, "");
  const base = `https://wa.me/${digits}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}
