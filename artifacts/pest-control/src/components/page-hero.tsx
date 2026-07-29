/**
 * Reusable PageHero component.
 *
 * Renders a premium hero banner that occupies only the top ~45-50% of the
 * first viewport (h-[45vh] min-h-[280px]). The rest of the page flows
 * naturally on a clean background.
 *
 * Features:
 *  - background-size: cover with proper positioning
 *  - dark overlay 40-60% for text readability
 *  - smooth fade from hero into page content
 *  - fully responsive on desktop / tablet / mobile
 *  - centered, properly-spaced content
 */

import type { ReactNode } from "react";

interface PageHeroProps {
  /** Background image URL. Leave empty for a gradient-only hero. */
  backgroundImage?: string;
  /** Overlay opacity (0-100). Default: 55 (≈ mid-range for readability). */
  overlayOpacity?: number;
  /** Optional badge text shown above the title (small pill). */
  badge?: ReactNode;
  /** Hero title. */
  title: ReactNode;
  /** Hero subtitle / description. */
  subtitle?: ReactNode;
  /** Optional CTA buttons row. */
  actions?: ReactNode;
  /** Extra content below the subtitle (e.g. stat cards). */
  children?: ReactNode;
  /** Override default min-height. Default: "min-h-[280px] h-[45vh]". */
  className?: string;
}

export default function PageHero({
  backgroundImage,
  overlayOpacity = 55,
  badge,
  title,
  subtitle,
  actions,
  children,
  className,
}: PageHeroProps) {
  return (
    <section
      className={`relative overflow-hidden flex items-center justify-center text-center text-white ${className ?? "min-h-[280px] h-[45vh]"}`}
    >
      {/* Background image (covers only the hero area, not the whole page) */}
      {backgroundImage && (
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('${backgroundImage}')` }}
        />
      )}

      {/* Gradient fallback / base color when no image */}
      {!backgroundImage && (
        <div className="absolute inset-0 z-0 bg-linear-to-br from-primary via-[hsl(155,43%,18%)] to-[hsl(155,43%,12%)]" />
      )}

      {/* Dark overlay for readability */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{ backgroundColor: `rgba(0,0,0,${overlayOpacity / 100})` }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4 w-full">
        {badge && (
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/20 border border-accent/30 text-accent text-xs sm:text-sm font-semibold uppercase tracking-wider">
              {badge}
            </div>
          </div>
        )}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight text-white">
          {title}
        </h1>
        {subtitle && (
          <p className="max-w-xl mx-auto text-sm sm:text-base text-white/85 leading-relaxed">
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

      {/* Fade transition from hero into white page content */}
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-b from-transparent to-background pointer-events-none z-5" />
    </section>
  );
}
