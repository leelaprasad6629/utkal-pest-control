export const BUSINESS_NAME = import.meta.env.VITE_BUSINESS_NAME ?? "Utkal Pest Control";
export const TAGLINE =
  import.meta.env.VITE_TAGLINE ?? "Trusted, eco-friendly pest control near you";
export const SERVICE_AREAS = (import.meta.env.VITE_SERVICE_AREAS ?? "Your City")
  .split(",")
  .map((s: string) => s.trim());
