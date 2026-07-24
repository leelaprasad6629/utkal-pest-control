import { useState } from "react";
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
  { href: "/services", label: "Services", testId: "link-services" },
  { href: "/about", label: "About", testId: "link-about" },
  { href: "/contact", label: "Contact", testId: "link-contact" },
];

/** Returns the correct dashboard href and label for the current user's role. */
function useDashboardLink() {
  const { user } = useUserContext();
  if (isAdmin(user)) return { href: "/dashboard/admin", label: "Admin Panel" };
  if (isTechnician(user)) return { href: "/dashboard/technician", label: "My Jobs" };
  return { href: "/dashboard", label: "Dashboard" };
}

export default function SiteHeader() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { href: dashHref, label: dashLabel } = useDashboardLink();

  const isDashActive =
    location === "/dashboard" ||
    location === "/dashboard/admin" ||
    location === "/dashboard/technician";

  return (
    <header className="border-b border-border bg-card/95 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        <Link href="/" data-testid="link-home">
          <LogoLockup size={30} textClass="text-primary text-base inline" />
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
                  "px-3 py-2 rounded-md font-medium text-sm transition-colors duration-150",
                  isActive
                    ? "text-primary bg-secondary border-b-2 border-primary"
                    : "text-foreground/70 hover:text-foreground hover:bg-muted border-b-2 border-transparent"
                )}
              >
                {link.label}
              </Link>
            );
          })}

          <SignedIn>
            <Link
              href={dashHref}
              data-testid="link-dashboard"
              className={cn(
                "px-3 py-2 rounded-md font-medium text-sm transition-colors duration-150",
                isDashActive
                  ? "text-primary bg-secondary border-b-2 border-primary"
                  : "text-foreground/70 hover:text-foreground hover:bg-muted border-b-2 border-transparent"
              )}
            >
              {dashLabel}
            </Link>
          </SignedIn>

          <Link href="/quote" className="ml-1 md:ml-2">
            <Button size="sm" data-testid="button-get-quote">
              Get Quote
            </Button>
          </Link>

          <SignedOut>
            <SignInButton mode="modal">
              <Button size="sm" variant="outline" className="ml-1" data-testid="button-sign-in">
                Sign in
              </Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <NotificationBell />
            <div className="ml-1">
              <UserButton afterSignOutUrl={import.meta.env.BASE_URL} />
            </div>
          </SignedIn>
        </nav>

        {/* Mobile Navigation Controls */}
        <div className="flex md:hidden items-center gap-2">
          <SignedIn>
            <NotificationBell />
            <UserButton afterSignOutUrl={import.meta.env.BASE_URL} />
          </SignedIn>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 p-0" aria-label="Toggle Navigation Menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[80vw] max-w-xs p-6 flex flex-col justify-between">
              <div className="space-y-6 pt-4">
                <SheetHeader className="text-left">
                  <SheetTitle>
                    <LogoLockup size={26} textClass="text-primary text-base inline" />
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
                          "px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                          isActive
                            ? "bg-primary text-primary-foreground font-semibold"
                            : "text-foreground/80 hover:bg-muted"
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
                        "px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                        isDashActive
                          ? "bg-primary text-primary-foreground font-semibold"
                          : "text-foreground/80 hover:bg-muted"
                      )}
                    >
                      {dashLabel}
                    </Link>
                  </SignedIn>
                </nav>
              </div>

              <div className="space-y-3 pt-6 border-t border-border">
                <Link href="/quote" onClick={() => setMobileOpen(false)} className="w-full block">
                  <Button className="w-full h-11 text-sm font-semibold" data-testid="button-get-quote">
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

