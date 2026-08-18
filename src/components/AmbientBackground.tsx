import { useEffect, useRef } from "react";
import { useTheme } from "@/lib/theme";

const SVG = {
  home: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <polyline points="15.5,3.5 15.5,2 18,2 18,6.5"/>
  <polyline points="2.5,11 12,2.5 21.5,11"/>
  <polyline points="5,9.5 5,22 10.5,22 10.5,16 13.5,16 13.5,22 19,22 19,9.5"/>
  <rect x="6.5" y="12.5" width="3" height="2.8" rx=".4"/>
  <rect x="14.5" y="12.5" width="3" height="2.8" rx=".4"/>
  <line x1="8"  y1="12.5" x2="8"  y2="15.3"/>
  <line x1="6.5" y1="14"  x2="9.5" y2="14"/>
  <line x1="16" y1="12.5" x2="16" y2="15.3"/>
  <line x1="14.5" y1="14" x2="17.5" y2="14"/>
</svg>`,
  shop: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <path d="M2.5 9 Q12 3.5 21.5 9"/>
  <line x1="2.5" y1="9" x2="21.5" y2="9"/>
  <rect x="2.5" y="9" width="19" height="13" rx=".5"/>
  <rect x="4"   y="10.5" width="16" height="3" rx=".4"/>
  <rect x="3.5" y="15" width="7" height="6" rx=".4"/>
  <rect x="13.5" y="15" width="7" height="6" rx=".4"/>
  <path d="M10.5 22 v-5.5 a1.5,1.5 0 0,1 3,0 V22"/>
  <line x1="7"   y1="15" x2="7"   y2="21"/>
  <line x1="17"  y1="15" x2="17"  y2="21"/>
</svg>`,
  office: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <rect x="3" y="2" width="18" height="20" rx="1"/>
  <line x1="3" y1="8.5"  x2="21" y2="8.5"/>
  <line x1="3" y1="14.5" x2="21" y2="14.5"/>
  <rect x="5.5"  y="4" width="3.5" height="3" rx=".4"/>
  <rect x="10.25" y="4" width="3.5" height="3" rx=".4"/>
  <rect x="15"   y="4" width="3.5" height="3" rx=".4"/>
  <rect x="5.5"  y="10" width="3.5" height="3" rx=".4"/>
  <rect x="10.25" y="10" width="3.5" height="3" rx=".4"/>
  <rect x="15"   y="10" width="3.5" height="3" rx=".4"/>
  <rect x="5.5"  y="16" width="3.5" height="3" rx=".4"/>
  <rect x="15"   y="16" width="3.5" height="3" rx=".4"/>
  <path d="M10.25 22 v-5 h3.5 v5"/>
</svg>`,
  restaurant: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <path d="M2 11 Q12 2 22 11"/>
  <rect x="2" y="11" width="20" height="11" rx=".5"/>
  <rect x="3.5" y="12.5" width="17" height="3" rx=".4"/>
  <rect x="3.5" y="17" width="6" height="4.5" rx=".4"/>
  <rect x="14.5" y="17" width="6" height="4.5" rx=".4"/>
  <path d="M10.5 22 v-5 h3 v5"/>
  <line x1="5.5" y1="11" x2="5.5" y2="8"/>
  <circle cx="5.5" cy="6.5" r="1.8"/>
  <line x1="18.5" y1="11" x2="18.5" y2="8"/>
  <circle cx="18.5" cy="6.5" r="1.8"/>
  <circle cx="5.5"  cy="6.5" r=".7" style="fill:currentColor;stroke:none;opacity:.6"/>
  <circle cx="18.5" cy="6.5" r=".7" style="fill:currentColor;stroke:none;opacity:.6"/>
</svg>`,
  car: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <rect x="1" y="13" width="22" height="5.5" rx="2"/>
  <path d="M4.5 13 L7 8 L17 8 L19.5 13"/>
  <line x1="12.5" y1="8" x2="12.5" y2="13"/>
  <path d="M7.5 8.3 L8.5 13 L12.5 13 L12 8.3 Z" style="fill:currentColor;opacity:.09;stroke:currentColor"/>
  <path d="M13 8.3 L16.5 13 L12.5 13 L13 8.3 Z" style="fill:currentColor;opacity:.09;stroke:currentColor"/>
  <circle cx="6.5" cy="18.5" r="2.5"/>
  <circle cx="17.5" cy="18.5" r="2.5"/>
  <circle cx="6.5"  cy="18.5" r=".9" style="fill:currentColor;opacity:.4;stroke:none"/>
  <circle cx="17.5" cy="18.5" r=".9" style="fill:currentColor;opacity:.4;stroke:none"/>
  <rect x="1"  y="14.5" width="1.5" height="2" rx=".4" style="fill:currentColor;opacity:.5;stroke:none"/>
  <rect x="21.5" y="14" width="1.5" height="2" rx=".4" style="fill:currentColor;opacity:.6;stroke:none"/>
</svg>`,
  bike: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <circle cx="5.5" cy="17" r="4"/>
  <circle cx="18.5" cy="17" r="4"/>
  <circle cx="5.5"  cy="17" r="1" style="fill:currentColor;opacity:.4;stroke:none"/>
  <circle cx="18.5" cy="17" r="1" style="fill:currentColor;opacity:.4;stroke:none"/>
  <line x1="10" y1="17" x2="12" y2="10"/>
  <line x1="10" y1="17" x2="5.5" y2="17"/>
  <line x1="12" y1="10" x2="15" y2="10"/>
  <line x1="15" y1="10" x2="18.5" y2="17"/>
  <line x1="10" y1="17" x2="15" y2="10"/>
  <line x1="15" y1="10" x2="15.5" y2="7"/>
  <line x1="13.5" y1="7" x2="17.5" y2="7"/>
  <line x1="12" y1="10" x2="11.5" y2="7.5"/>
  <path d="M10 7.5 Q11.5 6.5 13 7.5"/>
</svg>`,
};

const BLDG_CFG = [
  { type: "home", px: 92, py: 15 },
  { type: "shop", px: 92, py: 50 },
  { type: "home", px: 92, py: 83 },
  { type: "shop", px: 80, py: 27 },
  { type: "home", px: 80, py: 63 },
  { type: "home", px: 68, py: 13 },
  { type: "restaurant", px: 68, py: 47 },
  { type: "shop", px: 68, py: 80 },
  { type: "office", px: 56, py: 30 },
  { type: "home", px: 56, py: 65 },
  { type: "shop", px: 44, py: 15 },
  { type: "home", px: 44, py: 50 },
  { type: "restaurant", px: 44, py: 82 },
  { type: "office", px: 32, py: 33 },
  { type: "shop", px: 32, py: 68 },
  { type: "home", px: 20, py: 18 },
  { type: "shop", px: 20, py: 52 },
  { type: "home", px: 20, py: 84 },
  { type: "shop", px: 8, py: 35 },
  { type: "home", px: 8, py: 68 },
];

const EDGES: [number, number][] = [
  [0, 3],
  [0, 4],
  [1, 3],
  [1, 4],
  [2, 4],
  [3, 5],
  [3, 6],
  [4, 6],
  [4, 7],
  [5, 8],
  [6, 8],
  [6, 9],
  [7, 9],
  [8, 10],
  [8, 11],
  [9, 11],
  [9, 12],
  [10, 13],
  [11, 13],
  [11, 14],
  [12, 14],
  [13, 15],
  [13, 16],
  [14, 16],
  [14, 17],
  [15, 18],
  [16, 18],
  [16, 19],
  [17, 19],
];

const OUT: Record<number, number[]> = {};
BLDG_CFG.forEach((_, i) => {
  OUT[i] = [];
});
EDGES.forEach(([a, b]) => OUT[a]!.push(b));

const ENTRY_IDS = [0, 1, 2];

interface Building {
  x: number;
  y: number;
  ox: number;
  oy: number;
  el: HTMLDivElement;
  type: string;
  dax: number;
  day: number;
  dfx: number;
  dfy: number;
  dpx: number;
  dpy: number;
}

interface Vehicle {
  type: string;
  nodeId: number;
  x: number;
  y: number;
  tx: number;
  ty: number;
  state: string;
  chargeT: number;
  speed: number;
  trail: { x: number; y: number }[];
  opacity: number;
  dead: boolean;
  el: HTMLDivElement;
}

export function AmbientBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bldgLayerRef = useRef<HTMLDivElement>(null);
  const vehLayerRef = useRef<HTMLDivElement>(null);

  const { theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    let W = 0;
    let H = 0;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const bldgLayer = bldgLayerRef.current;
    const vehLayer = vehLayerRef.current;
    const container = containerRef.current;
    if (!bldgLayer || !vehLayer || !container) return;

    let rafId: number;
    let buildings: Building[] = [];
    let vehicles: Vehicle[] = [];
    let lastSpawn = -3800;
    const SPEED = 0.6;
    const CHARGE_FRAMES = 180;
    const MAX_VEHICLES = 6;
    const SPAWN_INTERVAL = 3800;

    const PCOL = isDark ? "#00e5b0" : "#0060c0";
    const PTRL = isDark ? "0,229,176" : "0,96,192";
    const ECOL = isDark ? "rgba(255,255,255,0.08)" : "rgba(20,40,90,0.10)";

    function buildBuildings() {
      if (!bldgLayer) return;
      bldgLayer.innerHTML = "";
      buildings = [];

      BLDG_CFG.forEach((cfg) => {
        const x = (cfg.px / 100) * W;
        const y = (cfg.py / 100) * H;
        const hash = (cfg.px * 7 + cfg.py * 13) % 100;
        const sz = 34 + (hash % 10);
        const bd = (5.5 + (hash % 6)).toFixed(1) + "s";
        const bk = -((hash % 60) / 10).toFixed(1) + "s";
        const lo = (0.26 + (hash % 12) / 100).toFixed(2);
        const hi = (0.46 + (hash % 16) / 100).toFixed(2);

        const wrap = document.createElement("div");
        wrap.className = "bldg-wrap";
        wrap.style.cssText = `left:${x}px;top:${y}px;--sz:${sz}px;--bd:${bd};--bk:${bk};--lo:${lo};--hi:${hi};`;
        wrap.innerHTML =
          SVG[cfg.type as keyof typeof SVG] + `<span class="bldg-label">${cfg.type}</span>`;
        bldgLayer.appendChild(wrap);
        buildings.push({
          x,
          y,
          ox: x,
          oy: y,
          el: wrap,
          type: cfg.type,
          dax: 22 + (hash % 16),
          day: 16 + (hash % 14),
          dfx: 0.00018 + (hash % 9) * 0.000018,
          dfy: 0.00015 + (hash % 11) * 0.000015,
          dpx: ((hash * 41) % 628) / 100,
          dpy: ((hash * 67) % 628) / 100,
        });
      });
    }

    class Vehicle {
      type: string;
      nodeId: number;
      x: number;
      y: number;
      tx: number;
      ty: number;
      state: string;
      chargeT: number;
      speed: number;
      trail: { x: number; y: number }[];
      opacity: number;
      dead: boolean;
      el: HTMLDivElement;

      constructor() {
        this.type = Math.random() < 0.55 ? "car" : "bike";
        const eIdx = ENTRY_IDS[Math.floor(Math.random() * ENTRY_IDS.length)] as number;
        this.nodeId = eIdx;
        const eb = buildings[eIdx];
        this.x = W + 70;
        this.y = eb.y + (Math.random() - 0.5) * 24;
        this.tx = eb.x;
        this.ty = eb.y;
        this.state = "TRAVELING";
        this.chargeT = 0;
        this.speed = SPEED + Math.random() * 0.5;
        this.trail = [];
        this.opacity = 0;
        this.dead = false;

        this.el = document.createElement("div");
        this.el.className = "veh-wrap";
        this.el.innerHTML =
          SVG[this.type as keyof typeof SVG] +
          `<span class="bolt">⚡</span>` +
          `<span class="veh-label">${this.type}</span>`;
        if (vehLayer) vehLayer.appendChild(this.el);
        this._dom();
      }

      _dom() {
        this.el.style.left = this.x + "px";
        this.el.style.top = this.y + "px";
        this.el.style.opacity = this.opacity.toString();
      }

      step() {
        if (this.opacity < 1) this.opacity = Math.min(1, this.opacity + 0.035);

        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 42) this.trail.shift();

        switch (this.state) {
          case "TRAVELING": {
            const bld = buildings[this.nodeId];
            const dx = bld.x - this.x,
              dy = bld.y - this.y;
            const d = Math.hypot(dx, dy);
            if (d < this.speed + 0.5) {
              this.x = bld.x;
              this.y = bld.y;
              this.state = "CHARGING";
              this.chargeT = 0;
              this.el.classList.add("charged");
            } else {
              this.x += (dx / d) * this.speed;
              this.y += (dy / d) * this.speed;
            }
            break;
          }

          case "CHARGING": {
            this.x = buildings[this.nodeId].x;
            this.y = buildings[this.nodeId].y;
            this.chargeT++;
            if (this.chargeT >= CHARGE_FRAMES) {
              this.el.classList.remove("charged");
              const outs = OUT[this.nodeId];
              if (!outs || outs.length === 0) {
                this.state = "EXITING";
                this.tx = -90;
                this.ty = this.y + (Math.random() - 0.5) * 30;
              } else {
                const nextId = outs[Math.floor(Math.random() * outs.length)] as number;
                this.nodeId = nextId;
                this.state = "TRAVELING";
              }
            }
            break;
          }

          case "EXITING": {
            const dx = this.tx - this.x,
              dy = this.ty - this.y;
            const d = Math.hypot(dx, dy);
            if (this.x < -80) {
              this.dead = true;
              this.el.remove();
              return;
            }
            this.x += (dx / d) * this.speed;
            this.y += (dy / d) * this.speed;
            this.opacity = Math.min(1, Math.max(0, this.x / (W * 0.12)));
            break;
          }
        }
        this._dom();
      }

      drawTrail() {
        if (!ctx) return;
        if (this.trail.length < 2) return;
        for (let i = 1; i < this.trail.length; i++) {
          const t = 1 - i / this.trail.length;
          const alpha = t * 0.55 * this.opacity;
          const lw = t * 2.4;
          ctx.save();
          ctx.strokeStyle = `rgba(${PTRL},${alpha})`;
          ctx.lineWidth = lw;
          ctx.shadowColor = PCOL;
          ctx.shadowBlur = 4;
          ctx.beginPath();
          ctx.moveTo(this.trail[i - 1]!.x, this.trail[i - 1]!.y);
          ctx.lineTo(this.trail[i]!.x, this.trail[i]!.y);
          ctx.stroke();
          ctx.restore();
        }
        if (this.state === "TRAVELING" || this.state === "EXITING") {
          ctx.save();
          ctx.shadowColor = PCOL;
          ctx.shadowBlur = 12;
          ctx.fillStyle = PCOL;
          ctx.beginPath();
          ctx.arc(this.x, this.y, 2.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }
    }

    function drawNetwork() {
      if (!ctx) return;
      EDGES.forEach(([a, b]) => {
        const na = buildings[a],
          nb = buildings[b];
        ctx.save();
        ctx.strokeStyle = ECOL;
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 8]);
        ctx.beginPath();
        ctx.moveTo(na.x, na.y);
        ctx.lineTo(nb.x, nb.y);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      });
    }

    function update(now: number) {
      if (buildings.length === 0) return;
      buildings.forEach((b) => {
        const dx = b.dax * Math.sin(now * b.dfx + b.dpx);
        const dy = b.day * Math.cos(now * b.dfy + b.dpy);
        b.x = b.ox + dx;
        b.y = b.oy + dy;
        b.el.style.transform = `translate(calc(-50% + ${dx.toFixed(2)}px), calc(-58% + ${dy.toFixed(2)}px))`;
      });

      if (vehicles.length < MAX_VEHICLES && now - lastSpawn >= SPAWN_INTERVAL) {
        vehicles.push(new Vehicle());
        lastSpawn = now;
      }

      vehicles = vehicles.filter((v) => !v.dead);
      vehicles.forEach((v) => v.step());
    }

    function render() {
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);
      drawNetwork();
      vehicles.forEach((v) => v.drawTrail());
    }

    function loop(now = 0) {
      rafId = requestAnimationFrame(loop);
      update(now);
      render();
    }

    function resize(entries?: ResizeObserverEntry[]) {
      if (entries && entries[0]) {
        W = entries[0].contentRect.width;
        H = entries[0].contentRect.height;
      } else if (container) {
        W = container.clientWidth;
        H = container.clientHeight;
      }
      if (canvas) {
        canvas.width = W;
        canvas.height = H;
      }

      vehicles.forEach((v) => v.el.remove());
      vehicles = [];
      lastSpawn = -SPAWN_INTERVAL;
      buildBuildings();
    }

    const ro = new ResizeObserver(resize);
    ro.observe(container);

    resize();
    loop();

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      if (bldgLayer) bldgLayer.innerHTML = "";
      if (vehLayer) vehLayer.innerHTML = "";
    };
  }, [isDark]);

  return (
    <div
      ref={containerRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden -z-10"
    >
      <style>{`
        .bldg-wrap {
          position: absolute;
          transform: translate(-50%, -58%);
          will-change: transform;
          display: flex; flex-direction: column; align-items: center; gap:5px;
          animation: breath var(--bd,7s) ease-in-out var(--bk,0s) infinite;
        }
        @keyframes breath {
          0%,100% { opacity: var(--lo,.30); }
          50%      { opacity: var(--hi,.54); }
        }
        .bldg-wrap svg {
          display:block; width:var(--sz,38px); height:var(--sz,38px);
          color: ${isDark ? "rgba(255,255,255,0.52)" : "rgba(20,40,80,0.48)"};
          stroke:currentColor; fill:none;
          stroke-width:1.35; stroke-linecap:round; stroke-linejoin:round;
          transition:color .5s;
        }
        .bldg-label {
          font:500 8px/1 system-ui,sans-serif;
          letter-spacing:.09em; text-transform:uppercase;
          color: ${isDark ? "rgba(255,255,255,0.26)" : "rgba(20,40,80,0.24)"};
          transition:color .5s;
        }
        .veh-wrap {
          position: absolute;
          transform: translate(-50%,-50%);
          display: flex; flex-direction:column; align-items:center; gap:3px;
          pointer-events:none; will-change:left,top;
        }
        .veh-wrap svg {
          display:block; width:30px; height:30px;
          color: ${isDark ? "rgba(255,255,255,0.52)" : "rgba(20,40,80,0.48)"};
          stroke:currentColor; fill:none;
          stroke-width:1.35; stroke-linecap:round; stroke-linejoin:round;
          transform:scaleX(-1);
          transition:color .5s, filter .3s;
        }
        .veh-label {
          font:500 7px/1 system-ui,sans-serif;
          letter-spacing:.08em; text-transform:uppercase;
          color: ${isDark ? "rgba(255,255,255,0.26)" : "rgba(20,40,80,0.24)"};
          transition:color .5s;
        }
        .bolt {
          position:absolute; top:-18px; left:50%;
          font-size:14px;
          opacity:0; transform:translateX(-50%) scale(.4) translateY(6px);
          transition:opacity .25s, transform .25s;
          pointer-events:none;
        }
        .veh-wrap.charged .bolt {
          opacity:1; transform:translateX(-50%) scale(1) translateY(0);
        }
        .veh-wrap.charged svg {
          filter:drop-shadow(0 0 6px currentColor);
        }
      `}</style>
      <canvas ref={canvasRef} className="absolute inset-0 block z-0" />
      <div ref={bldgLayerRef} className="absolute inset-0 z-10 pointer-events-none" />
      <div ref={vehLayerRef} className="absolute inset-0 z-20 pointer-events-none" />

      {/* Overlays to make the foreground text pop */}
      <div className="absolute inset-0 bg-background/40 z-30 pointer-events-none backdrop-blur-[1px]" />
      <div
        className="absolute inset-0 z-30 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 40%, ${isDark ? "rgba(10,10,12,0.9)" : "rgba(255,255,255,0.9)"} 0%, transparent 65%)`,
        }}
      />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-b from-transparent to-background z-30 pointer-events-none" />
    </div>
  );
}
