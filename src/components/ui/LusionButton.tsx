import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { useDeviceCapability } from "@/hooks/useDeviceCapability";
import { cn } from "@/lib/utils";

/**
 * LusionButton — premium magnetic/liquid-fill button for desktop.
 *
 * On touch-only devices the magnetic spring, liquid mask fill, and parallax
 * text effects are all disabled. A visually identical but interaction-free
 * version is rendered instead — same border, color, and size tokens, but
 * none of the Framer Motion overhead that's wasted on touch.
 */
export function LusionButton({
  to,
  onClick,
  children,
  className,
  variant = "primary",
}: {
  to?: string;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "accent";
}) {
  const { isTouchOnly } = useDeviceCapability();
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [fillPos, setFillPos] = useState({ x: 50, y: 50 });

  const isPrimary = variant === "primary";
  const borderClass = isPrimary ? "border-primary" : "border-accent";
  const bgClass = isPrimary ? "bg-primary" : "bg-accent";
  const textColorClassHover = isPrimary ? "text-primary-foreground" : "text-accent-foreground";
  const textColorClassNormal = isPrimary ? "text-primary" : "text-accent";

  // ─── Touch-only path ────────────────────────────────────────────────────────
  // Renders a visually identical static button without any animation machinery.
  // Active state (tap) is handled natively by the browser.
  if (isTouchOnly) {
    const touchClass = cn(
      "relative flex h-14 items-center justify-center overflow-hidden rounded-full border-2 bg-transparent px-10 text-base font-semibold shadow-lg touch-target w-full sm:w-auto",
      borderClass,
      className,
    );
    const textClass = cn(
      "relative z-10 flex items-center gap-2 whitespace-nowrap",
      textColorClassNormal,
    );

    if (to) {
      return (
        <Link to={to} className="inline-block w-full sm:w-auto">
          <div className={touchClass}>
            <span className={textClass}>{children}</span>
          </div>
        </Link>
      );
    }
    return (
      <div className="inline-block w-full sm:w-auto">
        <div className={touchClass} onClick={onClick}>
          <span className={textClass}>{children}</span>
        </div>
      </div>
    );
  }

  // ─── Desktop / hover path ───────────────────────────────────────────────────
  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();

    // Magnetic pull for the button container
    const x = (clientX - (left + width / 2)) * 0.25;
    const y = (clientY - (top + height / 2)) * 0.25;
    setPosition({ x, y });

    // Stronger magnetic pull for the text to create parallax
    const tx = (clientX - (left + width / 2)) * 0.15;
    const ty = (clientY - (top + height / 2)) * 0.15;
    setTextPosition({ x: tx, y: ty });

    // Continuously track the exact mouse position inside the button for the fill
    setFillPos({ x: clientX - left, y: clientY - top });
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsHovered(true);
    if (!ref.current) return;
    const { left, top } = ref.current.getBoundingClientRect();
    setFillPos({ x: e.clientX - left, y: e.clientY - top });
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    setPosition({ x: 0, y: 0 });
    setTextPosition({ x: 0, y: 0 });
    setIsHovered(false);

    if (ref.current) {
      const { left, top } = ref.current.getBoundingClientRect();
      setFillPos({ x: e.clientX - left, y: e.clientY - top });
    }
  };

  const Inner = (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className={cn(
        "relative flex h-14 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 bg-transparent px-10 text-base font-semibold shadow-lg touch-target",
        borderClass,
        className,
      )}
    >
      {/* Liquid Fill Animation (Expanding Hole from Cursor) */}
      <motion.div
        className={cn("absolute inset-0 z-0", bgClass)}
        initial={{ "--mask-size": "0%" }}
        animate={{ "--mask-size": isHovered ? "150%" : "0%" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        style={{
          WebkitMaskImage: `radial-gradient(circle at ${fillPos.x}px ${fillPos.y}px, black var(--mask-size), transparent var(--mask-size))`,
          maskImage: `radial-gradient(circle at ${fillPos.x}px ${fillPos.y}px, black var(--mask-size), transparent var(--mask-size))`,
        }}
      />

      {/* Parallax Text */}
      <motion.span
        animate={{ x: textPosition.x, y: textPosition.y }}
        transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
        className={cn(
          "relative z-10 flex items-center gap-2 whitespace-nowrap transition-colors duration-300",
          isHovered ? textColorClassHover : textColorClassNormal,
        )}
      >
        {children}
      </motion.span>
    </motion.div>
  );

  if (to) {
    return (
      <Link to={to} className="inline-block w-full sm:w-auto">
        {Inner}
      </Link>
    );
  }

  return <div className="inline-block w-full sm:w-auto">{Inner}</div>;
}
