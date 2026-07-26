export const SERVICE_IMAGES: Record<string, string> = {
  "general-pest-control": "https://images.unsplash.com/photo-1627690060934-7bbd2243d63c?auto=format&fit=crop&w=600&h=400&q=80",
  "termite-control": "https://images.unsplash.com/photo-1595275372297-f0d6f45c43d8?auto=format&fit=crop&w=600&h=400&q=80",
  "cockroach-control": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&h=400&q=80",
  "rodent-control": "https://images.unsplash.com/photo-1605647540924-852290f6b0d5?auto=format&fit=crop&w=600&h=400&q=80",
  "bed-bug-treatment": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&h=400&q=80",
  "mosquito-control": "https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?auto=format&fit=crop&w=600&h=400&q=80",
  "commercial-pest-control": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&h=400&q=80",
  "residential-pest-control": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&h=400&q=80",
};

export const FALLBACK_SERVICE_IMAGE = "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&h=400&q=80";

export function getServiceImage(slug: string): string {
  return SERVICE_IMAGES[slug] || FALLBACK_SERVICE_IMAGE;
}
