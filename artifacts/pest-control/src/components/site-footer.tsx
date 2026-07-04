import { Link } from "wouter";
import { BUSINESS_NAME, TAGLINE, SERVICE_AREAS } from "@/config/business";

export default function SiteFooter() {
  return (
    <footer className="mt-16 bg-primary text-primary-foreground">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-10 grid gap-8 md:grid-cols-3">
        <div>
          <div className="font-display text-lg font-semibold">{BUSINESS_NAME}</div>
          <p className="mt-2 text-sm text-primary-foreground/75">{TAGLINE}</p>
        </div>
        <div>
          <div className="text-sm font-semibold uppercase tracking-wide text-primary-foreground/60">
            Navigate
          </div>
          <nav className="mt-3 flex flex-col gap-2 text-sm">
            <Link href="/services" className="text-primary-foreground/85 hover:text-primary-foreground">
              Services
            </Link>
            <Link href="/about" className="text-primary-foreground/85 hover:text-primary-foreground">
              About
            </Link>
            <Link href="/contact" className="text-primary-foreground/85 hover:text-primary-foreground">
              Contact
            </Link>
            <Link href="/quote" className="text-primary-foreground/85 hover:text-primary-foreground">
              Get a Quote
            </Link>
          </nav>
        </div>
        <div>
          <div className="text-sm font-semibold uppercase tracking-wide text-primary-foreground/60">
            Service Areas
          </div>
          <p className="mt-3 text-sm text-primary-foreground/85">{SERVICE_AREAS.join(", ")}</p>
        </div>
      </div>
      <div className="border-t border-primary-foreground/15">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-4 text-xs text-primary-foreground/60">
          © {new Date().getFullYear()} {BUSINESS_NAME}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
