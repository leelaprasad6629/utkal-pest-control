import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import NotificationBell from "@/components/notification-bell";
import { LogoLockup } from "@/components/logo";
import { useUserContext, isAdmin, isTechnician } from "@/lib/user-context";
import { Menu } from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Home", testId: "link-home-nav" },
  { href: "/services", label: "Services", testId: "link-services" },
  { href: "/about", label: "About", testId: "link-about" },
  { href: "/contact", label: "Contact", testId: "link-contact" },
];

function useDashboardLink() {
  const { user } = useUserContext();
  if (isAdmin(user)) return { href: "/dashboard/admin", label: "Admin Panel" };
  if (isTechnician(user)) return { href: "/dashboard/technician", label: "My Jobs" };
  return { href: "/dashboard", label: "Dashboard" };
}

export default function SiteHeader() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { href: dashHref, label: dashLabel } = useDashboardLink();

  const isDashActive =
    location === "/dashboard" ||
    location === "/dashboard/admin" ||
    location === "/dashboard/technician";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-500",
        scrolled ? "nav-solid shadow-lg" : "glass-nav"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16 lg:h-18">
        <Link href="/" data-testid="link-home" className="transition-transform duration-300 hover:scale-105">
          <LogoLockup
            size={32}
            textClass={cn(
              "text-base inline transition-colors duration-300",
              scrolled ? "text-white" : "text-primary"
            )}
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 md:gap-2 text-sm">
          {NAV_LINKS.map((link) => {
            const isActive = location === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                data-testid={link.testId}
                className={cn(
                  "px-4 py-2 rounded-full font-medium text-sm transition-all duration-300 hover:scale-105 active:scale-95 ease-out relative group",
                  scrolled
                    ? isActive
                      ? "text-white bg-white/20 font-semibold shadow-sm border border-white/20"
                      : "text-white/80 hover:text-white hover:bg-white/15"
                    : isActive
                      ? "text-primary-foreground bg-primary font-semibold shadow-sm"
                      : "text-foreground/70 hover:text-primary hover:bg-primary/10"
                )}
              >
                {link.label}
                {isActive && (
                  <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-accent" />
                )}
              </Link>
            );
          })}

          <SignedIn>
            <Link
              href={dashHref}
              data-testid="link-dashboard"
              className={cn(
                "px-4 py-2 rounded-full font-medium text-sm transition-all duration-300 hover:scale-105 active:scale-95 ease-out",
                scrolled
                  ? isDashActive
                    ? "text-white bg-white/20 font-semibold shadow-sm border border-white/20"
                    : "text-white/80 hover:text-white hover:bg-white/15"
                  : isDashActive
                    ? "text-primary-foreground bg-primary font-semibold shadow-sm"
                    : "text-foreground/70 hover:text-primary hover:bg-primary/10"
              )}
            >
              {dashLabel}
            </Link>
          </SignedIn>

          <Link href="/quote" className="ml-2">
            <Button
              size="sm"
              className="btn-shine bg-primary/90 text-primary-foreground hover:bg-primary border border-primary/20 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
              data-testid="button-get-quote"
            >
              Get Quote
            </Button>
          </Link>

          <SignedOut>
            <SignInButton mode="modal">
              <Button
                size="sm"
                variant="outline"
                className={cn(
                  "ml-1 transition-all duration-300 hover:scale-105",
                  scrolled
                    ? "border-white/50 text-white bg-transparent hover:bg-white/15 hover:text-white"
                    : "border-primary/30 text-primary hover:bg-primary/10"
                )}
                data-testid="button-sign-in"
              >
                Sign in
              </Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <NotificationBell scrolled={scrolled} />
            <div className="ml-1">
              <UserButton afterSignOutUrl={import.meta.env.BASE_URL} />
            </div>
          </SignedIn>
        </nav>

        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center gap-2">
          <SignedIn>
            <NotificationBell scrolled={scrolled} />
            <UserButton afterSignOutUrl={import.meta.env.BASE_URL} />
          </SignedIn>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-9 w-9 p-0 transition-colors",
                  scrolled ? "text-white hover:bg-white/10" : "text-primary hover:bg-primary/10"
                )}
                aria-label="Toggle Navigation Menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[80vw] max-w-xs p-6 flex flex-col justify-between">
              <div className="space-y-6 pt-4">
                <SheetHeader className="text-left">
                  <SheetTitle>
                    <LogoLockup size={28} textClass="text-primary text-base inline" />
                  </SheetTitle>
                </SheetHeader>

                <nav className="flex flex-col gap-2">
                  {NAV_LINKS.map((link) => {
                    const isActive = location === link.href;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        data-testid={link.testId}
                        className={cn(
                          "px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300",
                          isActive
                            ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                            : "text-foreground/80 hover:bg-muted hover:translate-x-1"
                        )}
                      >
                        {link.label}
                      </Link>
                    );
                  })}

                  <SignedIn>
                    <Link
                      href={dashHref}
                      onClick={() => setMobileOpen(false)}
                      data-testid="link-dashboard"
                      className={cn(
                        "px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300",
                        isDashActive
                          ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                          : "text-foreground/80 hover:bg-muted hover:translate-x-1"
                      )}
                    >
                      {dashLabel}
                    </Link>
                  </SignedIn>
                </nav>
              </div>

              <div className="space-y-3 pt-6 border-t border-border">
                <Link href="/quote" onClick={() => setMobileOpen(false)} className="w-full block">
                  <Button className="btn-shine w-full h-11 text-sm font-semibold shadow-sm" data-testid="button-get-quote">
                    Get Quote
                  </Button>
                </Link>

                <SignedOut>
                  <SignInButton mode="modal">
                    <Button variant="outline" className="w-full h-11 text-sm font-semibold" data-testid="button-sign-in">
                      Sign in
                    </Button>
                  </SignInButton>
                </SignedOut>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
