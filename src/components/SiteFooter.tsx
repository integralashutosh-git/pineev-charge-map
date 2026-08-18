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
              <Link to="/find" className="hover:text-foreground">
                Find a charger
              </Link>
            </li>
            <li>
              <Link to="/bookings" className="hover:text-foreground">
                My bookings
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-foreground">
                About us
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold">Partners</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/partner" className="hover:text-foreground">
                Become a partner
              </Link>
            </li>
            <li>
              <Link to="/dashboard" className="hover:text-foreground">
                Business dashboard
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-foreground">
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
          <h2 className="text-center font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-foreground/90 to-foreground/30 text-[9vw] sm:text-6xl md:text-7xl lg:text-8xl xl:text-[6.5rem] leading-[1.1] select-none">
            Plug<span className="text-primary/60 dark:text-primary">.</span>Infrastructure
            <span className="text-primary/60 dark:text-primary">.</span>
            <br className="xl:hidden" />
            Network<span className="text-primary/60 dark:text-primary">.</span>Energy
          </h2>

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
