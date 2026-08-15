import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, MapPin } from "lucide-react";
import { PineLogo } from "./PineLogo";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/find", label: "Find charger" },
  { to: "/partner", label: "Become a partner" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <PineLogo className="h-9 w-9" />
          <span className="font-display text-lg font-bold tracking-tight">PineEV</span>
        </Link>

        <nav className="ml-auto hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-full px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "bg-secondary text-foreground" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 md:ml-2">
          {user ? (
            <>
              <Link to="/dashboard" className="hidden md:block">
                <Button variant="ghost" size="sm" className="rounded-full">
                  Dashboard
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                className="hidden rounded-full md:inline-flex"
                onClick={() => signOut()}
              >
                Sign out
              </Button>
            </>
          ) : (
            <Link to="/auth" className="hidden md:block">
              <Button variant="ghost" size="sm" className="rounded-full">
                Sign in
              </Button>
            </Link>
          )}
          <Link to="/find">
            <Button size="sm" className="rounded-full shadow-soft">
              <MapPin className="mr-1.5 size-4" />
              Open map
            </Button>
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            className="inline-flex size-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary md:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-border/70 bg-background px-4 pb-4 pt-2 md:hidden">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className="block rounded-xl px-3 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              {item.label}
            </Link>
          ))}
          {user ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setOpen(false)}
                className="block rounded-xl px-3 py-3 text-sm font-medium"
              >
                Dashboard
              </Link>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  void signOut();
                }}
                className="block w-full rounded-xl px-3 py-3 text-left text-sm font-medium text-muted-foreground"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              onClick={() => setOpen(false)}
              className="block rounded-xl px-3 py-3 text-sm font-medium"
            >
              Sign in
            </Link>
          )}
        </div>
      ) : null}
    </header>
  );
}
