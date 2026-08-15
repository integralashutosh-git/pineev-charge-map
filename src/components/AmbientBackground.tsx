import { useEffect, useRef } from "react";

interface Node {
  x: number;
  y: number;
}

interface Traveller {
  from: number;
  to: number;
  t: number;
  speed: number;
  trail: { x: number; y: number }[];
}

/** Canvas network of host buildings with vehicles travelling between them. */
export function AmbientBackground({ className }: { className?: string | undefined }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;
    let nodes: Node[] = [];
    let travellers: Traveller[] = [];
    let raf = 0;

    const styles = getComputedStyle(document.documentElement);
    const primary = styles.getPropertyValue("--primary").trim() || "oklch(0.38 0.15 275)";
    const energy = styles.getPropertyValue("--energy").trim() || "oklch(0.72 0.19 152)";
    const amber = styles.getPropertyValue("--amber").trim() || "oklch(0.83 0.17 80)";

    const mix = (color: string, pct: number) =>
      `color-mix(in oklch, ${color} ${pct}%, transparent)`;

    const build = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = width < 640 ? 7 : 12;
      nodes = Array.from({ length: count }, (_, i) => ({
        x: ((i % 4) + 0.5) * (width / 4) + (Math.random() - 0.5) * width * 0.08,
        y: (Math.floor(i / 4) + 0.5) * (height / Math.ceil(count / 4)) +
          (Math.random() - 0.5) * height * 0.08,
      }));

      travellers = Array.from({ length: Math.min(count, 8) }, () => {
        const from = Math.floor(Math.random() * nodes.length);
        let to = Math.floor(Math.random() * nodes.length);
        if (to === from) to = (to + 1) % nodes.length;
        return { from, to, t: Math.random(), speed: 0.0018 + Math.random() * 0.0022, trail: [] };
      });
    };

    const drawNode = (node: Node, index: number) => {
      ctx.save();
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = mix(index % 3 === 0 ? amber : primary, 26);
      ctx.beginPath();
      ctx.roundRect(node.x - 11, node.y - 14, 22, 28, 6);
      ctx.fill();
      ctx.strokeStyle = mix(primary, 40);
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = mix(energy, 70);
      ctx.beginPath();
      ctx.arc(node.x, node.y - 20, 2.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const frame = () => {
      ctx.clearRect(0, 0, width, height);

      // network links
      ctx.lineWidth = 1;
      ctx.strokeStyle = mix(primary, 12);
      for (let i = 0; i < nodes.length; i += 1) {
        for (let j = i + 1; j < nodes.length; j += 1) {
          const a = nodes[i]!;
          const b = nodes[j]!;
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist > width * 0.34) continue;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      travellers.forEach((traveller) => {
        const a = nodes[traveller.from];
        const b = nodes[traveller.to];
        if (!a || !b) return;
        if (!reduce) traveller.t += traveller.speed;
        if (traveller.t >= 1) {
          traveller.t = 0;
          traveller.from = traveller.to;
          traveller.to = Math.floor(Math.random() * nodes.length);
          traveller.trail = [];
        }
        const x = a.x + (b.x - a.x) * traveller.t;
        const y = a.y + (b.y - a.y) * traveller.t;
        traveller.trail.push({ x, y });
        if (traveller.trail.length > 26) traveller.trail.shift();

        traveller.trail.forEach((point, index) => {
          const alpha = (index / traveller.trail.length) * 55;
          ctx.fillStyle = mix(energy, alpha);
          ctx.beginPath();
          ctx.arc(point.x, point.y, 1.6, 0, Math.PI * 2);
          ctx.fill();
        });

        ctx.fillStyle = mix(energy, 95);
        ctx.beginPath();
        ctx.arc(x, y, 3.1, 0, Math.PI * 2);
        ctx.fill();
      });

      nodes.forEach(drawNode);
      raf = requestAnimationFrame(frame);
    };

    build();
    frame();
    const onResize = () => build();
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={`pointer-events-none absolute inset-0 size-full ${className ?? ""}`}
    />
  );
}
