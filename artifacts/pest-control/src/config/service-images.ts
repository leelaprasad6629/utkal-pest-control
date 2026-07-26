/** Shared dimensions for all service card images (3:2 aspect ratio). */
const CARD_WIDTH = 600;
const CARD_HEIGHT = 400;

function pexels(id: number): string {
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${CARD_WIDTH}&h=${CARD_HEIGHT}&fit=crop`;
}

function unsplash(photoId: string): string {
  return `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=${CARD_WIDTH}&h=${CARD_HEIGHT}&q=80`;
}

function wikimedia(fileName: string): string {
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}?width=${CARD_WIDTH}`;
}

export const SERVICE_IMAGES: Record<string, string> = {
  "residential-pest-control": "/images/services/residential-pest-control.jpg",
  "commercial-pest-control": "/images/services/commercial-pest-control.jpg",
  "cockroach-control": "/images/services/cockroach-control.jpg",
  "mosquito-fumigation": "/images/services/mosquito-fumigation.jpg",
  "bed-bug-treatment": "/images/services/bed-bug-treatment.jpg",
  "rodent-control": "/images/services/rodent-control.jpg",
  "termite-control": "/images/services/termite-control.jpg",
  "agri-advisory": "/images/services/agri-advisory.jpg",
};

/** Maps legacy DB slugs to canonical slugs (same image, no duplicate URLs). */
const SLUG_ALIASES: Record<string, keyof typeof SERVICE_IMAGES> = {
  "general-pest-control": "cockroach-control",
  "mosquito-control": "mosquito-fumigation",
};

export const FALLBACK_SERVICE_IMAGE = SERVICE_IMAGES["residential-pest-control"];

export function getServiceImage(slug: string): string {
  const canonical = SLUG_ALIASES[slug] ?? slug;
  return SERVICE_IMAGES[canonical] ?? FALLBACK_SERVICE_IMAGE;
}

export const SERVICE_CARD_IMAGE = {
  width: CARD_WIDTH,
  height: CARD_HEIGHT,
  className: "object-cover w-full h-full transition-transform duration-500 group-hover:scale-105",
  containerClassName: "overflow-hidden h-48 w-full relative bg-secondary/20",
} as const;
