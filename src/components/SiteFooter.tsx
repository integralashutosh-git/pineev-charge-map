import { Link } from "@tanstack/react-router";
import { PineLogo } from "./PineLogo";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto grid w-full max-w-6xl gap-10 pad-x py-12 md:py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center">
            <PineLogo className="h-7 w-auto" />
          </div>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            Find it. Reserve it. Charge it. PineEV connects EV drivers with verified commercial
            properties for reserved parking and charging.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold">Drivers</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/find" className="hover:text-foreground block py-2 touch-target">
                Find a charger
              </Link>
            </li>
            <li>
              <Link to="/bookings" className="hover:text-foreground block py-2 touch-target">
                My bookings
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-foreground block py-2 touch-target">
                About us
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold">Partners</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/partner" className="hover:text-foreground block py-2 touch-target">
                Become a partner
              </Link>
            </li>
            <li>
              <Link to="/dashboard" className="hover:text-foreground block py-2 touch-target">
                Business dashboard
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-foreground block py-2 touch-target">
                Contact
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="relative border-t border-border/40 pt-16 pb-8 md:pt-24 md:pb-10 overflow-hidden flex flex-col items-center mt-8">
        {/* Decorative elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-primary/10 blur-[100px] rounded-full pointer-events-none opacity-40 dark:opacity-20" />

        <div className="pad-x relative z-10 w-full flex flex-col items-center">
          {/* aria-hidden: purely decorative display text, not a real page heading */}
          <p
            aria-hidden="true"
            className="w-full text-center font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-foreground/90 to-foreground/30 select-none leading-[1.05]"
            style={{ fontSize: "clamp(1.25rem, 5.5vw, 6.5rem)" }}
          >
            <span className="inline">Plug</span>
            <span className="text-primary/60 dark:text-primary">.</span>
            <span className="inline"> Infrastructure</span>
            <span className="text-primary/60 dark:text-primary">.</span>
            <br />
            <span className="inline"> Network</span>
            <span className="text-primary/60 dark:text-primary">.</span>
            <span className="inline"> Energy</span>
            <span className="text-primary/60 dark:text-primary">.</span>
          </p>

          <div className="w-full max-w-6xl mt-16 flex flex-col md:flex-row items-center justify-between border-t border-border/50 pt-8 text-xs text-muted-foreground/80">
            <p>© {new Date().getFullYear()} PineEV. All rights reserved.</p>
            <div className="flex items-center gap-6 mt-4 md:mt-0 font-medium">
              <Link to="/" className="hover:text-foreground transition-colors duration-200">
                Privacy Policy
              </Link>
              <Link to="/" className="hover:text-foreground transition-colors duration-200">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
