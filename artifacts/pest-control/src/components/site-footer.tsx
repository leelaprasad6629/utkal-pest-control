import { Link } from "wouter";
import { TAGLINE, SERVICE_AREAS } from "@/config/business";
import { LogoLockup } from "@/components/logo";

export default function SiteFooter() {
  return (
    <footer className="w-full bg-primary text-primary-foreground">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-12 grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div className="space-y-3">
          <LogoLockup size={28} textClass="text-primary-foreground text-base" />
          <p className="text-sm text-primary-foreground/70 leading-relaxed">{TAGLINE}</p>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/50">
            Navigate
          </div>
          <nav className="mt-3 flex flex-col gap-2 text-sm">
            <Link href="/services" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Services</Link>
            <Link href="/about" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">About</Link>
            <Link href="/contact" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Contact</Link>
            <Link href="/quote" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Get a Quote</Link>
          </nav>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/50">
            Service Areas
          </div>
          <p className="mt-3 text-sm text-primary-foreground/80 leading-relaxed">{SERVICE_AREAS.join(", ")}</p>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-4 text-xs text-primary-foreground/50">
          © {new Date().getFullYear()} Utkal Pest Control. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
