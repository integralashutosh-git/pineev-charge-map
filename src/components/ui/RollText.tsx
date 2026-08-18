import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface RollTextProps {
  from: string;
  to: string;
  hovered: boolean;
  className?: string;
  charDelay?: number;
}

/**
 * Slot-reel text animation with natural character spacing.
 * Both rows render as natural flex text — no per-character width constraints.
 * Hover state is controlled by the parent.
 */
export function RollText({ from, to, hovered, className, charDelay = 30 }: RollTextProps) {
  return (
    <span
      className={cn("relative inline-block overflow-hidden", className)}
      style={{ height: "1.2em", lineHeight: "1.2em" }}
      aria-label={hovered ? to : from}
    >
      {/* Row 1 — "from" text. Each character rolls UP on hover. */}
      <span className="flex whitespace-pre">
        {from.split("").map((ch, i) => (
          <motion.span
            key={`f${i}`}
            className="inline-block"
            animate={{ y: hovered ? "-100%" : "0%" }}
            transition={{
              duration: 0.38,
              delay: (i * charDelay) / 1000,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {ch}
          </motion.span>
        ))}
      </span>

      {/* Row 2 — "to" text. Starts below; rolls UP into view on hover. */}
      <span className="absolute left-0 top-full flex whitespace-pre">
        {to.split("").map((ch, i) => (
          <motion.span
            key={`t${i}`}
            className="inline-block"
            animate={{ y: hovered ? "-100%" : "0%" }}
            transition={{
              duration: 0.38,
              delay: (i * charDelay) / 1000,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {ch}
          </motion.span>
        ))}
      </span>
    </span>
  );
}
