export const SERVICE_IMAGES: Record<string, string> = {
  "residential-pest-control": "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&h=400&q=80",
  "commercial-pest-control": "https://images.unsplash.com/photo-1604147706283-d7119b5b822c?auto=format&fit=crop&w=600&h=400&q=80",
  "cockroach-control": "https://images.unsplash.com/photo-1600132806370-bf17e65e942f?auto=format&fit=crop&w=600&h=400&q=80",
  "mosquito-fumigation": "https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?auto=format&fit=crop&w=600&h=400&q=80",
  "bed-bug-treatment": "https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&w=600&h=400&q=80",
  "rodent-control": "https://images.unsplash.com/photo-1605647540924-852290f6b0d5?auto=format&fit=crop&w=600&h=400&q=80",
  "termite-control": "https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=600&h=400&q=80",
  "agri-advisory": "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=600&h=400&q=80",
};

export const FALLBACK_SERVICE_IMAGE = "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&h=400&q=80";

export function getServiceImage(slug: string): string {
  return SERVICE_IMAGES[slug] || FALLBACK_SERVICE_IMAGE;
}
