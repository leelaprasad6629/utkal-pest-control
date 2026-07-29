/**
 * Reusable PageHero component.
 * Premium hero banner occupying ~50% of the first viewport.
 * Consistent across all pages with dark gradient overlay.
 */

import type { ReactNode } from "react";

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
      className={`relative overflow-hidden flex items-center justify-center text-center text-white min-h-[320px] h-[50vh] ${className ?? ""}`}
    >
      {/* Background image */}
      {backgroundImage && (
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('${backgroundImage}')` }}
        />
      )}

      {/* Gradient fallback */}
      {!backgroundImage && (
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-primary via-primary to-primary/90" />
      )}

      {/* Dark overlay for readability */}
      <div
        className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-b from-black/40 via-black/40 to-black/60"
        style={overlayOpacity !== 55 ? { backgroundColor: `rgba(0,0,0,${overlayOpacity / 100})` } : undefined}
      />

      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-4 w-full">
        {badge && (
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 border border-white/25 text-white text-xs sm:text-sm font-semibold uppercase tracking-wider backdrop-blur-sm">
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

      {/* Smooth fade into page content */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-b from-transparent to-background pointer-events-none z-[5]" />
    </section>
  );
}
