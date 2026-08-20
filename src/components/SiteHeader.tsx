import { Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { motion } from "framer-motion";
import { PineLogo } from "./PineLogo";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageToggle } from "./LanguageToggle";
import { Magnetic } from "./Magnetic";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LusionButton } from "@/components/ui/LusionButton";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/find", label: "Find charger" },
  { to: "/partner", label: "Become a partner" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

/** Nav pill with a radial-gradient fill that expands from wherever the cursor enters */
function FillNavLink({
  to,
  children,
  className,
}: {
  to: string;
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [fillPos, setFillPos] = useState({ x: 50, y: 50 });
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const trackMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    setFillPos({ x: clientX - left, y: clientY - top });
    setPosition({
      x: (clientX - (left + width / 2)) * 0.3,
      y: (clientY - (top + height / 2)) * 0.3,
    });
  };

  const onEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsHovered(true);
    if (!ref.current) return;
    const { left, top } = ref.current.getBoundingClientRect();
    setFillPos({ x: e.clientX - left, y: e.clientY - top });
  };

  const onLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsHovered(false);
    setPosition({ x: 0, y: 0 });
    if (!ref.current) return;
    const { left, top } = ref.current.getBoundingClientRect();
    setFillPos({ x: e.clientX - left, y: e.clientY - top });
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={trackMouse}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className="relative overflow-hidden rounded-full"
    >
      {/* Radial fill layer */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-0 rounded-full bg-secondary"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        initial={{ "--mask-size": "0%" } as any}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        animate={{ "--mask-size": isHovered ? "150%" : "0%" } as any}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        style={
          {
            WebkitMaskImage: `radial-gradient(circle at ${fillPos.x}px ${fillPos.y}px, black var(--mask-size), transparent var(--mask-size))`,
            maskImage: `radial-gradient(circle at ${fillPos.x}px ${fillPos.y}px, black var(--mask-size), transparent var(--mask-size))`,
          } as any
        }
      />
      <Link
        to={to}
        className={cn(
          "relative z-10 block px-4 py-3 text-sm font-medium text-muted-foreground transition-colors duration-200 touch-target",
          isHovered && "text-foreground",
          className,
        )}
        activeProps={{
          className: "bg-secondary text-foreground",
        }}
      >
        {children}
      </Link>
    </motion.div>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 pad-x">
        <Link to="/" className="flex items-center">
          <PineLogo className="h-7 w-auto" />
        </Link>

        <nav className="ml-auto hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <FillNavLink key={item.to} to={item.to}>
              {item.label}
            </FillNavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1 md:gap-2 md:ml-2">
          <LanguageToggle />
          <ThemeToggle />
          {user ? (
            <>
              <LusionButton
                to="/dashboard"
                className="!h-10 !px-5 !text-sm !shadow-md hidden md:flex"
              >
                Dashboard
              </LusionButton>
              <LusionButton
                onClick={() => signOut()}
                className="!h-10 !px-5 !text-sm !shadow-md hidden md:flex"
                variant="accent"
              >
                Sign out
              </LusionButton>
            </>
          ) : (
            <LusionButton
              to="/auth"
              className="!h-10 !px-6 !text-sm !shadow-md hidden md:flex"
              variant="accent"
            >
              Sign in
            </LusionButton>
          )}
          <Magnetic>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle menu"
              className="inline-flex size-12 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary md:hidden touch-target"
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </Magnetic>
        </div>
      </div>

      {open ? (
        <div className="border-t border-border/70 bg-background px-4 pb-4 pt-2 md:hidden">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className="block rounded-xl px-4 py-4 text-base font-medium text-foreground transition-colors hover:bg-secondary touch-target"
            >
              {item.label}
            </Link>
          ))}
          {user ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setOpen(false)}
                className="block rounded-xl px-4 py-4 text-base font-medium touch-target"
              >
                Dashboard
              </Link>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  void signOut();
                }}
                className="block w-full rounded-xl px-4 py-4 text-left text-base font-medium text-muted-foreground touch-target"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              onClick={() => setOpen(false)}
              className="block rounded-xl px-4 py-4 text-base font-medium touch-target"
            >
              Sign in
            </Link>
          )}
        </div>
      ) : null}
    </header>
  );
}
