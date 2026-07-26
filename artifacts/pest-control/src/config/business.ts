export const BUSINESS_NAME = import.meta.env.VITE_BUSINESS_NAME ?? "Utkal Pest Control";
export const TAGLINE =
  import.meta.env.VITE_TAGLINE ?? "Trusted, eco-friendly pest control near you";
export const SERVICE_AREAS = (import.meta.env.VITE_SERVICE_AREAS ?? "Pan-India")
  .split(",")
  .map((s: string) => s.trim());
export const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER ?? "917093823752";
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER.replace(/[^\d]/g, "")}`;
