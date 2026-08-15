import { useRef, useState, type ReactNode } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { Link } from "@tanstack/react-router";

interface LusionButtonProps {
  children: ReactNode;
  to?: string;
  onClick?: (() => void) | undefined;
  variant?: "amber" | "primary" | "outline";
  className?: string | undefined;
}

/**
 * Premium magnetic CTA: the shell and the label follow the cursor with
 * separate spring physics, and a radial mask "un-fills" from the pointer.
 */
export function LusionButton({
  children,
  to,
  onClick,
  variant = "amber",
  className,
}: LusionButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState(false);
  const [pos, setPos] = useState({ x: 50, y: 50 });

  const shellX = useSpring(useMotionValue(0), { stiffness: 180, damping: 18, mass: 0.5 });
  const shellY = useSpring(useMotionValue(0), { stiffness: 180, damping: 18, mass: 0.5 });
  const textX = useSpring(useMotionValue(0), { stiffness: 320, damping: 22, mass: 0.4 });
  const textY = useSpring(useMotionValue(0), { stiffness: 320, damping: 22, mass: 0.4 });

  const onMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const relX = event.clientX - rect.left;
    const relY = event.clientY - rect.top;
    const dx = relX - rect.width / 2;
    const dy = relY - rect.height / 2;
    shellX.set(dx * 0.16);
    shellY.set(dy * 0.28);
    textX.set(dx * 0.3);
    textY.set(dy * 0.42);
    setPos({ x: (relX / rect.width) * 100, y: (relY / rect.height) * 100 });
  };

  const reset = () => {
    shellX.set(0);
    shellY.set(0);
    textX.set(0);
    textY.set(0);
    setHover(false);
  };

  const base =
    variant === "amber"
      ? "bg-amber text-amber-foreground"
      : variant === "primary"
        ? "bg-primary text-primary-foreground"
        : "border border-border bg-card/70 text-foreground backdrop-blur";

  const inner = (
    <motion.div
      ref={ref}
      style={{ x: shellX, y: shellY }}
      onPointerMove={onMove}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={reset}
      className={`relative isolate inline-flex h-12 cursor-pointer items-center justify-center overflow-hidden rounded-full px-7 text-sm font-semibold transition-shadow duration-300 elev-2 hover:elev-3 ${base} ${className ?? ""}`}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 transition-[clip-path,opacity] duration-500 ease-out"
        style={{
          background:
            variant === "outline"
              ? "color-mix(in oklch, var(--primary) 12%, transparent)"
              : "color-mix(in oklch, var(--primary) 92%, transparent)",
          clipPath: hover
            ? `circle(140% at ${pos.x}% ${pos.y}%)`
            : `circle(0% at ${pos.x}% ${pos.y}%)`,
        }}
      />
      <motion.span
        style={{ x: textX, y: textY }}
        className={`relative z-10 whitespace-nowrap transition-colors duration-300 ${
          hover && variant !== "outline" ? "text-primary-foreground" : ""
        }`}
      >
        {children}
      </motion.span>
    </motion.div>
  );

  if (to) {
    return (
      <Link to={to} className="inline-flex">
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className="inline-flex">
      {inner}
    </button>
  );
}
