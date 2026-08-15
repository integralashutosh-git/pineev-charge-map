import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Home, Compass, Building2, User, Mail } from "lucide-react";
import { PineLogo } from "./PineLogo";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageToggle } from "./LanguageToggle";
import { LusionButton } from "./LusionButton";
import { useI18n, type TranslationKey } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";

const NAV: { to: string; key: TranslationKey; icon: typeof Home }[] = [
  { to: "/", key: "nav.home", icon: Home },
  { to: "/discover", key: "nav.discover", icon: Compass },
  { to: "/host", key: "nav.host", icon: Building2 },
  { to: "/account", key: "nav.account", icon: User },
  { to: "/contact", key: "nav.contact", icon: Mail },
];

export function SiteHeader() {
  const { t } = useI18n();
  const { user, signOut } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

  return (
    <>
      {/* Desktop floating pill */}
      <header className="pointer-events-none fixed inset-x-0 top-4 z-50 hidden justify-center md:flex">
        <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-border bg-card/80 px-2 py-2 backdrop-blur-xl elev-3">
          <Link to="/" className="flex items-center gap-2 pl-2 pr-3">
            <PineLogo className="size-8" />
            <span className="font-display text-base font-bold tracking-tight">PineEV</span>
          </Link>

          <nav className="flex items-center gap-0.5">
            {NAV.map((item) => {
              const active = isActive(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`relative rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                    active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {active ? (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 -z-10 rounded-full bg-primary"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  ) : null}
                  <span className="relative">{t(item.key)}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mx-1 h-6 w-px bg-border" />
          <LanguageToggle />
          <ThemeToggle />
          {user ? (
            <button
              type="button"
              onClick={() => void signOut()}
              className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {t("nav.signout")}
            </button>
          ) : (
            <Link
              to="/auth"
              className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {t("nav.signin")}
            </Link>
          )}
          <LusionButton to="/discover" className="ml-1 h-10 px-5">
            {t("nav.cta")}
          </LusionButton>
        </div>
      </header>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-border bg-background/90 pad-x py-3 backdrop-blur-xl md:hidden">
        <Link to="/" className="flex items-center gap-2">
          <PineLogo className="size-8" />
          <span className="font-display text-base font-bold tracking-tight">PineEV</span>
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </header>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-50 flex items-stretch border-t border-border bg-card/95 backdrop-blur-xl md:hidden">
        {NAV.map((item) => {
          const active = isActive(item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className="size-5" />
              {t(item.key)}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
