import { useRef, useEffect, useId } from "react";
import { cn } from "@/lib/utils";

export function HoverParallaxImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const maskId = useId();

  useEffect(() => {
    const container = containerRef.current;
    const img = imgRef.current;
    const overlay = overlayRef.current;
    // Find the closest parent card to react to card-level hover
    const card = container?.closest(".group") as HTMLElement | null;
    const target = card ?? container;
    if (!target || !img || !overlay) return;

    let rafId: number;

    // Direct DOM mutation — bypasses React reconciler entirely.
    // Runs on compositor thread, zero re-renders, true 60fps.
    const handleMouseMove = (e: MouseEvent) => {
      const { left, top, width, height } = target.getBoundingClientRect();
      const x = (e.clientX - left) / width - 0.5;
      const y = (e.clientY - top) / height - 0.5;

      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        img.style.transform = `translate3d(${x * -14}px, ${y * -14}px, 0) scale(1.06)`;
      });
    };

    const handleMouseEnter = () => {
      img.style.transition = "transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)";
      overlay.style.opacity = "1";
    };

    const handleMouseLeave = () => {
      cancelAnimationFrame(rafId);
      img.style.transition = "transform 0.8s cubic-bezier(0.23, 1, 0.32, 1)";
      img.style.transform = "translate3d(0, 0, 0) scale(1)";
      overlay.style.opacity = "0";
    };

    target.addEventListener("mousemove", handleMouseMove, { passive: true });
    target.addEventListener("mouseenter", handleMouseEnter, { passive: true });
    target.addEventListener("mouseleave", handleMouseLeave, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      target.removeEventListener("mousemove", handleMouseMove);
      target.removeEventListener("mouseenter", handleMouseEnter);
      target.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn("overflow-hidden relative", className)}
    >
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className="size-full object-cover will-change-transform"
        style={{ transform: "translate3d(0,0,0) scale(1)" }}
      />

      {/* Inline SVG mask — defines a frame with smooth inner rounded corners */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
        <defs>
          <filter id={`${maskId}-blur`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" />
          </filter>
          <mask id={maskId}>
            <rect width="100%" height="100%" fill="white" />
            <rect
              x="24"
              y="24"
              width="calc(100% - 48px)"
              height="calc(100% - 48px)"
              rx="12"
              fill="black"
              filter={`url(#${maskId}-blur)`}
            />
          </mask>
        </defs>
      </svg>

      {/* Glassmorphism edge — fades in on hover via direct DOM ref */}
      <div
        ref={overlayRef}
        className="absolute inset-0 pointer-events-none z-10 backdrop-blur-[6px]"
        style={{
          opacity: 0,
          transition: "opacity 0.5s ease",
          maskImage: `url(#${maskId})`,
          WebkitMaskImage: `url(#${maskId})`,
        }}
      />
    </div>
  );
}
