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

/**
 * One unique, pest-control-specific image per canonical service slug.
 * Sources: Pexels, Unsplash, Wikimedia Commons (royalty-free).
 */
export const SERVICE_IMAGES: Record<string, string> = {
  /** Technician spraying pesticide indoors */
  "residential-pest-control": pexels(5691544),
  /** Pest control service in a commercial/office setting */
  "commercial-pest-control": pexels(6474489),
  /** Cockroach close-up for targeted treatment */
  "cockroach-control": pexels(2608958),
  /** Outdoor mosquito fogging / fumigation */
  "mosquito-fumigation": pexels(19789837),
  /** Bed bug (Cimex lectularius) — CDC public domain */
  "bed-bug-treatment": wikimedia("Adult_bed_bug,_Cimex_lectularius.jpg"),
  /** Rat / rodent control */
  "rodent-control": unsplash("photo-1598300042247-d088f8ab3a91"),
  /** Fumigation of wooden furniture / structural treatment */
  "termite-control": pexels(4176545),
  /** Agricultural pesticide spraying */
  "agri-advisory": pexels(6345502),
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
