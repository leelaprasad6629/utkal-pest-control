import { BUSINESS_NAME, SERVICE_AREAS } from "@/config/business";

export default function SiteFooter() {
  return (
    <footer className="mt-12 border-t bg-white">
      <div className="max-w-5xl mx-auto px-4 py-6 text-sm text-gray-500">
        © {new Date().getFullYear()} {BUSINESS_NAME} — Serving: {SERVICE_AREAS.join(", ")}
      </div>
    </footer>
  );
}
