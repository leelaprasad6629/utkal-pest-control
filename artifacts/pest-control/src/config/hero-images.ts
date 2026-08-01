/** Optimized hero background images (1920px wide, compressed). */
const HERO_WIDTH = 1920;

function pexelsHero(id: number): string {
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${HERO_WIDTH}&h=1080&fit=crop`;
}

/** Pest-control hero imagery — Pexels (royalty-free). */
export const HERO_IMAGES = {
  /** Technician spraying indoors */
  technician: pexelsHero(5691544),
  /** Home / residential treatment */
  homeTreatment: pexelsHero(4176311),
  /** Commercial / office pest control */
  commercial: pexelsHero(6474489),
  /** Outdoor eco-friendly fogging / spraying */
  ecoFriendly: pexelsHero(19789837),
} as const;

export const PAGE_HERO_IMAGES = {
  home: HERO_IMAGES.technician,
  services: HERO_IMAGES.commercial,
  about: HERO_IMAGES.ecoFriendly,
  contact: HERO_IMAGES.homeTreatment,
  quote: HERO_IMAGES.technician,
  cta: HERO_IMAGES.ecoFriendly,
} as const;
