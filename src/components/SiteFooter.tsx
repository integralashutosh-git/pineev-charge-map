import { Link } from "@tanstack/react-router";
import { PineLogo } from "./PineLogo";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5">
            <PineLogo className="h-9 w-9" />
            <span className="font-display text-lg font-bold">PineEV</span>
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
      <div className="border-t border-border/70 px-4 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} PineEV. All rights reserved.
      </div>
    </footer>
  );
}
