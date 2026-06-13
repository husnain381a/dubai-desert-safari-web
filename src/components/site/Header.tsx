import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo1 from "@/assets/logo-1.png";
import logo2 from "@/assets/logo-2.png";
import { SITE } from "@/lib/site";
import { BookingDialog } from "./BookingDialog";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/services", label: "Services" },
  { to: "/packages", label: "Packages" },
  { to: "/blog", label: "Blog" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [pathname, setPathname] = useState<string>(() =>
    typeof window !== "undefined" ? window.location?.pathname ?? "/" : "/"
  );
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    setPathname(window.location?.pathname ?? "/");
  }, []);
  const isBlogRead = /^\/blog\/.+/.test(pathname);
  const isAuth = pathname === "/auth";
  const darkText = scrolled || isBlogRead || isAuth;
  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-all duration-300 ${
        scrolled ? "glass shadow-md" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
        <Link to="/" className="flex items-center gap-2.5 min-w-0">
          <img
            src={scrolled || isAuth ? logo1 : logo2}
            alt="Red Sand Dunes DXB"
            width={40}
            height={40}
            className="h-25 w-25 shrink-0"
          />
          <div className="sm:block leading-tight">
            <div className={`font-display text-lg font-bold ${darkText ? "text-foreground" : "text-white"}`}>
              Red Sand Dunes
            </div>
            <div className={`text-[10px] uppercase tracking-[0.2em] ${darkText ? "text-muted-foreground" : "text-white/80"}`}>
              Dubai · UAE
            </div>
          </div>
        </Link>
        <nav className="hidden lg:flex items-center gap-1">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                darkText
                  ? "text-foreground/80 hover:text-primary hover:bg-secondary"
                  : "text-white/90 hover:text-white hover:bg-white/10"
              }`}
              activeProps={{ className: "text-primary" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a href={`tel:${SITE.phone}`} className={`hidden md:inline-flex items-center gap-1.5 text-sm font-medium ${darkText ? "text-foreground" : "text-white"}`}>
            <Phone className="h-4 w-4" /> {SITE.phone}
          </a>
          <BookingDialog>
            <Button className="hidden sm:inline-flex bg-primary text-primary-foreground hover:bg-primary/90 shadow-md">
              Book Now
            </Button>
          </BookingDialog>
          <button
            className={`lg:hidden grid place-items-center h-10 w-10 rounded-md ${
              darkText ? "bg-secondary text-foreground" : "bg-white/10 text-white"
            }`}
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="lg:hidden glass border-t border-border">
          <nav className="mx-auto max-w-7xl px-4 py-4 flex flex-col gap-1">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="px-3 py-3 rounded-md text-foreground hover:bg-secondary"
                activeProps={{ className: "text-primary bg-secondary" }}
              >
                {n.label}
              </Link>
            ))}
            <BookingDialog>
              <Button className="mt-2 bg-primary text-primary-foreground">Book Now</Button>
            </BookingDialog>
          </nav>
        </div>
      )}
    </header>
  );
}
