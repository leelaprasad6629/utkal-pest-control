import type { ServiceItem } from "@/lib/types";

/**
 * Static fallback service catalog.
 *
 * The Services page renders these instantly (no network round-trip) and then
 * attempts to refresh from the API in the background.  If the API is slow or
 * the database is not seeded, the user still sees the full list immediately.
 *
 * Values mirror the seed script so the UI is consistent with the DB.
 */
export const STATIC_SERVICES: ServiceItem[] = [
  {
    _id: "static-cockroach-control",
    name: "Cockroach & General Pest Control",
    slug: "cockroach-control",
    category: "General",
    description: "Cockroach and general pests",
    basePrice: 900,
    icon: "cockroach",
    active: true,
  },
  {
    _id: "static-mosquito-fumigation",
    name: "Mosquito & Fumigation",
    slug: "mosquito-fumigation",
    category: "Mosquito",
    description: "Mosquito fogging and fumigation",
    basePrice: 1500,
    icon: "cloud",
    active: true,
  },
  {
    _id: "static-residential",
    name: "Residential Pest Control",
    slug: "residential-pest-control",
    category: "Residential",
    description: "Safe home pest management",
    basePrice: 1200,
    icon: "home",
    active: true,
  },
  {
    _id: "static-rodent",
    name: "Rodent Control",
    slug: "rodent-control",
    category: "Rodent",
    description: "Rodent trapping and proofing",
    basePrice: 1800,
    icon: "mouse",
    active: true,
  },
  {
    _id: "static-bed-bug",
    name: "Bed Bug Treatment",
    slug: "bed-bug-treatment",
    category: "Specialist",
    description: "Bed bug heat and chemical treatment",
    basePrice: 4000,
    icon: "bed",
    active: true,
  },
  {
    _id: "static-agri",
    name: "Agricultural Pest Advisory",
    slug: "agri-advisory",
    category: "Agriculture",
    description: "Crop pest advisory and treatment",
    basePrice: 2500,
    icon: "leaf",
    active: true,
  },
  {
    _id: "static-commercial",
    name: "Commercial Pest Control",
    slug: "commercial-pest-control",
    category: "Commercial",
    description: "Pest solutions for businesses",
    basePrice: 3500,
    icon: "building",
    active: true,
  },
  {
    _id: "static-termite",
    name: "Termite Control",
    slug: "termite-control",
    category: "Specialist",
    description: "Termite inspection and treatment",
    basePrice: 5000,
    icon: "bug",
    active: true,
  },
];
