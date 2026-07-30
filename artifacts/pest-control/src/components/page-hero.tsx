/**
 * Reusable PageHero component — premium hero banner with parallax zoom.
 *
 * Features:
 *  - Background image with slow zoom animation (parallax-like)
 *  - Balanced dark gradient overlay (not green-tinted) for premium look
 *  - Smooth fade transition into page content
 *  - Fully responsive (~55vh height — occupies ~55% of first viewport)
 *  - Centered content with consistent typography
 *  - Badge, title, subtitle, CTA actions
 */

import { useRef, useEffect, type ReactNode } from "react";

interface PageHeroProps {
  backgroundImage?: string;
  overlayOpacity?: number;
  badge?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export default function PageHero({
  backgroundImage,
  overlayOpacity = 60,
  badge,
  title,
  subtitle,
  actions,
  children,
  className,
}: PageHeroProps) {
  const bgRef = useRef<HTMLDivElement>(null);

  // Subtle parallax: translate the bg slightly as user scrolls
  useEffect(() => {
    let rafId: number;
    const handleScroll = () => {
      if (!bgRef.current) return;
      const scrolled = window.scrollY;
      const section = bgRef.current.parentElement;
      if (!section) return;
      const sectionHeight = section.offsetHeight;
      if (scrolled < sectionHeight) {
        bgRef.current.style.transform = `scale(1.12) translateY(${scrolled * 0.15}px)`;
      }
      rafId = requestAnimationFrame(() => {});
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <section
      className={`relative overflow-hidden flex items-center justify-center text-center text-white h-[55vh] min-h-[380px] ${className ?? ""}`}
    >
      {/* Background image with zoom + parallax */}
      {backgroundImage && (
        <div
          ref={bgRef}
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat animate-hero-zoom will-change-transform"
          style={{ backgroundImage: `url('${backgroundImage}')` }}
        />
      )}

      {/* Gradient fallback when no image — neutral dark, not green-tinted */}
      {!backgroundImage && (
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-[hsl(0,0%,15%)] via-[hsl(155,30%,12%)] to-[hsl(0,0%,8%)]" />
      )}

      {/* Balanced dark gradient overlay for readability — no green tint */}
      <div
        className="absolute inset-0 z-0 pointer-events-none hero-overlay"
        style={{ opacity: overlayOpacity / 100 }}
      />

      {/* Content — vertically centered */}
      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4 w-full animate-fade-in-up">
        {badge && (
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-white text-xs sm:text-sm font-semibold uppercase tracking-wider shadow-lg">
              {badge}
            </div>
          </div>
        )}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight text-white drop-shadow-lg">
          {title}
        </h1>
        {subtitle && (
          <p className="max-w-xl mx-auto text-sm sm:text-lg text-white/90 leading-relaxed drop-shadow">
            {subtitle}
          </p>
        )}
        {actions && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {actions}
          </div>
        )}
        {children}
      </div>

      {/* Smooth fade transition from hero into page content */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-b from-transparent to-background pointer-events-none z-5" />
    </section>
  );
}
