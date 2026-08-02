import { useState, useEffect } from "react";
import { Link } from "wouter";
import { TAGLINE, SERVICE_AREAS, WHATSAPP_URL, BUSINESS_NAME } from "@/config/business";
import { LogoLockup } from "@/components/logo";
import { motion, AnimatePresence } from "framer-motion";
import {
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  ArrowUp,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Leaf,
  Clock,
  ChevronRight,
  Download,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

// ─── APK Download URL ───────────────────────────────────────────────
// ⚠️  Update this with your actual APK download link when ready.
const APK_DOWNLOAD_URL = "https://base44.app/api/apps/6a68de79568a670980669a8f/files/mp/public/6a68de79568a670980669a8f/522fa955f_UtkalPestControl-APK.zip"; // ← Replace with your APK URL

const FOOTER_LINKS = {
  services: [
    { label: "Residential Pest Control", href: "/services/residential-pest-control" },
    { label: "Commercial Pest Control", href: "/services/commercial-pest-control" },
    { label: "Termite Control", href: "/services/termite-control" },
    { label: "Rodent Control", href: "/services/rodent-control" },
    { label: "Cockroach Control", href: "/services/cockroach-control" },
    { label: "Bed Bug Treatment", href: "/services/bed-bug-treatment" },
  ],
  quick: [
    { label: "Home", href: "/" },
    { label: "About Us", href: "/about" },
    { label: "Get a Quote", href: "/quote" },
    { label: "Contact", href: "/contact" },
    { label: "Our Services", href: "/services" },
  ],
};

const TRUST_BADGES = [
  { icon: ShieldCheck, label: "Licensed" },
  { icon: Leaf, label: "Eco-Friendly" },
  { icon: Clock, label: "24×7 Support" },
];

/** Inline Android robot icon (lucide-react doesn't ship one) */
function AndroidIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.6 9.48l1.84-3.18a.5.5 0 0 0-.87-.5l-1.87 3.24a10.7 10.7 0 0 0-9.4 0L5.43 5.8a.5.5 0 1 0-.87.5L6.4 9.48A10.8 10.8 0 0 0 1 18h22a10.8 10.8 0 0 0-5.4-8.52zM7 15.25a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5zm10 0a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5z"/>
    </svg>
  );
}

export default function SiteFooter() {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="relative w-full bg-primary text-primary-foreground overflow-hidden">
      {/* Decorative top accent */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-accent/60 via-accent to-accent/60" />

      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-3">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-8">
          {/* Brand & About — full width on mobile, 1 col on larger */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1 space-y-2">
            <LogoLockup size={34} textClass="text-primary-foreground text-lg" />
            <p className="text-xs sm:text-sm text-primary-foreground/70 leading-relaxed max-w-xs">
              {TAGLINE}. Serving homes and businesses with certified, safe, and effective pest management solutions.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {TRUST_BADGES.map((badge) => {
                const Icon = badge.icon;
                return (
                  <span
                    key={badge.label}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-foreground/10 border border-primary-foreground/15 text-[11px] font-medium text-primary-foreground/80"
                  >
                    <Icon className="h-3 w-3" />
                    {badge.label}
                  </span>
                );
              })}
            </div>
            {/* APK Download button — visible on desktop only here (mobile shows it separately) */}
            <a
              href={APK_DOWNLOAD_URL}
              download
              className="hidden lg:inline-flex items-center gap-2 mt-2 px-3 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-semibold hover:bg-accent/90 transition-colors w-fit"
            >
              <AndroidIcon className="h-4 w-4" />
              <Download className="h-4 w-4" />
              Download APK
            </a>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-primary-foreground/60 mb-2.5">
              Our Services
            </h3>
            <ul className="space-y-1.5 sm:space-y-2">
              {FOOTER_LINKS.services.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group flex items-center gap-1 text-xs sm:text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                  >
                    <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-1 transition-all" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-primary-foreground/60 mb-2.5">
              Quick Links
            </h3>
            <ul className="space-y-1.5 sm:space-y-2">
              {FOOTER_LINKS.quick.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group flex items-center gap-1 text-xs sm:text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                  >
                    <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-1 transition-all" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-2 sm:col-span-1">
            <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-primary-foreground/60 mb-2.5">
              Get in Touch
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-primary-foreground/70">
              <li className="flex items-start gap-2">
                <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0 text-accent" />
                <span>{SERVICE_AREAS.join(", ")}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 shrink-0 text-accent" />
                <a href="tel:+917093823752" className="hover:text-primary-foreground transition-colors">
                  +91 70938 23752
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 shrink-0 text-accent" />
                <a href="mailto:contact@utkalpestcontrol.com" className="hover:text-primary-foreground transition-colors break-all">
                  contact@utkalpestcontrol.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <FaWhatsapp className="h-3.5 w-3.5 shrink-0 text-accent" />
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="hover:text-primary-foreground transition-colors">
                  WhatsApp Us
                </a>
              </li>
            </ul>

            {/* Social */}
            <div className="flex items-center gap-2.5 mt-3">
              {[
                { Icon: Facebook, href: "#" },
                { Icon: Instagram, href: "#" },
                { Icon: Twitter, href: "#" },
                { Icon: Linkedin, href: "#" },
              ].map(({ Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-foreground/10 border border-primary-foreground/15 text-primary-foreground/70 hover:bg-accent hover:text-accent-foreground hover:scale-110 transition-all duration-300"
                  aria-label="Social media"
                >
                  <Icon className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* APK Download — mobile/tablet only (desktop shows it in brand column) */}
        <a
          href={APK_DOWNLOAD_URL}
          download
          className="lg:hidden mt-3 flex items-center justify-center gap-2 w-full sm:w-fit px-4 py-2.5 rounded-lg bg-accent text-accent-foreground text-sm font-semibold hover:bg-accent/90 transition-colors"
        >
          <AndroidIcon className="h-5 w-5" />
          Download Android App
          <Download className="h-4 w-4" />
        </a>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-primary-foreground/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-col sm:flex-row items-center justify-between gap-1.5 text-[11px] sm:text-xs text-primary-foreground/50">
          <p>
            © {new Date().getFullYear()} {BUSINESS_NAME}. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            <a href="#" className="hover:text-primary-foreground transition-colors">Privacy Policy</a>
            <span className="opacity-30">|</span>
            <a href="#" className="hover:text-primary-foreground transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>

      {/* Back to Top button */}
      <AnimatePresence>
        {showTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            onClick={scrollToTop}
            className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 z-[999] flex h-11 w-11 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300"
            aria-label="Back to top"
          >
            <ArrowUp className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </footer>
  );
}
