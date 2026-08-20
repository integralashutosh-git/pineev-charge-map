import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { statusColor, type Property } from "@/lib/pineev";

const TILE = 256;

function lngToWorldX(lng: number) {
  return ((lng + 180) / 360) * TILE;
}
function latToWorldY(lat: number) {
  const s = Math.sin((lat * Math.PI) / 180);
  return (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * TILE;
}

export interface FallbackMapProps {
  properties: Property[];
  selectedId?: string | null | undefined;
  onSelect?: ((id: string) => void) | undefined;
  userLocation?: { lat: number; lng: number } | null | undefined;
  focus?: { lat: number; lng: number } | null | undefined;
  zoom?: number | undefined;
  className?: string | undefined;
  interactive?: boolean | undefined;
  colorFor?: ((property: Property) => string) | undefined;
  fitPoints?: { lat: number; lng: number }[] | undefined;
  fitKey?: string | undefined;
}

/**
 * Keyless map fallback — OpenStreetMap raster tiles with PineEV markers.
 * Used when the Google Maps key is unavailable or blocked on this domain.
 */
export default function FallbackMap({
  properties,
  selectedId,
  onSelect,
  userLocation,
  focus,
  zoom = 11,
  className = "size-full",
  interactive = true,
  colorFor,
  fitPoints,
  fitKey,
}: FallbackMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [view, setView] = useState<{ lat: number; lng: number; z: number } | null>(null);
  const dragRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setSize({ w: el.clientWidth, h: el.clientHeight });
    });
    ro.observe(el);
    setSize({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  // initial + fit view
  useEffect(() => {
    if (!size.w || !size.h) return;
    const points = fitPoints && fitPoints.length >= 2 ? fitPoints : null;
    if (points) {
      const lats = points.map((p) => p.lat);
      const lngs = points.map((p) => p.lng);
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);
      const spanX = Math.max(lngToWorldX(maxLng) - lngToWorldX(minLng), 1e-6);
      const spanY = Math.max(latToWorldY(minLat) - latToWorldY(maxLat), 1e-6);
      const z = Math.min(
        16,
        Math.max(3, Math.floor(Math.log2(Math.min((size.w - 96) / spanX, (size.h - 96) / spanY)))),
      );
      setView({ lat: (minLat + maxLat) / 2, lng: (minLng + maxLng) / 2, z });
      return;
    }
    setView((prev) => {
      if (prev) return prev;
      const base =
        focus ??
        (properties[0]
          ? { lat: Number(properties[0].latitude), lng: Number(properties[0].longitude) }
          : { lat: 20.5937, lng: 78.9629 });
      return { ...base, z: zoom };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size.w, size.h, fitKey]);

  // focus a property
  useEffect(() => {
    if (!focus) return;
    setView((prev) => ({ lat: focus.lat, lng: focus.lng, z: Math.max(prev?.z ?? zoom, 14) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus?.lat, focus?.lng]);

  const project = useCallback(
    (lat: number, lng: number) => {
      if (!view) return null;
      const scale = Math.pow(2, view.z);
      const cx = lngToWorldX(view.lng) * scale;
      const cy = latToWorldY(view.lat) * scale;
      return {
        x: lngToWorldX(lng) * scale - cx + size.w / 2,
        y: latToWorldY(lat) * scale - cy + size.h / 2,
      };
    },
    [view, size.w, size.h],
  );

  const tiles = useMemo(() => {
    if (!view || !size.w || !size.h) return [];
    const scale = Math.pow(2, view.z);
    const count = scale;
    const cx = lngToWorldX(view.lng) * scale;
    const cy = latToWorldY(view.lat) * scale;
    const left = cx - size.w / 2;
    const top = cy - size.h / 2;
    const x0 = Math.floor(left / TILE);
    const y0 = Math.floor(top / TILE);
    const x1 = Math.floor((left + size.w) / TILE);
    const y1 = Math.floor((top + size.h) / TILE);
    const out: { key: string; url: string; sx: number; sy: number }[] = [];
    for (let x = x0; x <= x1; x++) {
      for (let y = y0; y <= y1; y++) {
        if (y < 0 || y >= count) continue;
        const tx = ((x % count) + count) % count;
        out.push({
          key: `${view.z}/${x}/${y}`,
          url: `https://tile.openstreetmap.org/${view.z}/${tx}/${y}.png`,
          sx: x * TILE - left,
          sy: y * TILE - top,
        });
      }
    }
    return out;
  }, [view, size.w, size.h]);

  const pan = (dx: number, dy: number) => {
    if (!view) return;
    const scale = Math.pow(2, view.z) * TILE;
    setView({
      ...view,
      lng: view.lng - (dx / scale) * 360,
      lat: Math.max(
        -85,
        Math.min(85, view.lat + (dy / scale) * 360 * Math.cos((view.lat * Math.PI) / 180)),
      ),
    });
  };

  const hasPosition = /(?:^|\s)(?:absolute|fixed|relative|sticky)(?:\s|$)/.test(className);

  return (
    <div
      ref={containerRef}
      className={`${hasPosition ? "" : "relative"} overflow-hidden bg-surface ${className}`}
      onPointerDown={(e) => {
        if (!interactive) return;
        dragRef.current = { x: e.clientX, y: e.clientY };
      }}
      onPointerMove={(e) => {
        const start = dragRef.current;
        if (!start) return;
        pan(e.clientX - start.x, e.clientY - start.y);
        dragRef.current = { x: e.clientX, y: e.clientY };
      }}
      onPointerUp={() => {
        dragRef.current = null;
      }}
      onPointerLeave={() => {
        dragRef.current = null;
      }}
    >
      {tiles.map((t) => (
        <img
          key={t.key}
          src={t.url}
          alt=""
          draggable={false}
          loading="lazy"
          className="pointer-events-none absolute select-none"
          style={{ left: t.sx, top: t.sy, width: TILE, height: TILE }}
        />
      ))}

      {userLocation
        ? (() => {
            const p = project(userLocation.lat, userLocation.lng);
            if (!p) return null;
            return (
              <span
                className="pointer-events-none absolute size-4 rounded-full border-2 border-white bg-accent shadow-md"
                style={{ left: p.x - 8, top: p.y - 8 }}
              />
            );
          })()
        : null}

      {properties.map((property) => {
        const p = project(Number(property.latitude), Number(property.longitude));
        if (!p) return null;
        const selected = property.id === selectedId;
        const color = colorFor?.(property) ?? statusColor(property.status);
        const w = selected ? 44 : 34;
        const h = selected ? 54 : 42;
        return (
          <button
            key={property.id}
            type="button"
            title={property.name}
            onClick={() => onSelect?.(property.id)}
            className="absolute cursor-pointer touch-target transition-transform duration-200 hover:scale-110 focus:outline-none"
            style={{
              left: p.x - w / 2,
              top: p.y - h,
              width: w,
              height: h,
              zIndex: selected ? 30 : 20,
              filter: selected
                ? `drop-shadow(0 0 6px ${color}88) drop-shadow(0 3px 6px rgba(17,24,39,0.4))`
                : "drop-shadow(0 3px 5px rgba(17,24,39,0.35))",
              transform: selected ? "scale(1.15)" : "scale(1)",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={w}
              height={h}
              viewBox="0 0 44 54"
              aria-hidden="true"
            >
              {/* Pin body */}
              <path
                d="M22 3c9.4 0 17 7.4 17 16.6 0 11.9-13.4 24.3-16 28.9a1.2 1.2 0 0 1-2 0C18.4 43.9 5 31.5 5 19.6C5 10.4 12.6 3 22 3Z"
                fill={color}
              />
              {/* White highlight stroke */}
              <path
                d="M22 3c9.4 0 17 7.4 17 16.6 0 11.9-13.4 24.3-16 28.9a1.2 1.2 0 0 1-2 0C18.4 43.9 5 31.5 5 19.6C5 10.4 12.6 3 22 3Z"
                fill="none"
                stroke="rgba(255,255,255,0.9)"
                strokeWidth="1.5"
              />
              {/* Lightning bolt icon */}
              <path
                d="M24.6 12h-5.9l-4.1 9.4h4.4l-1.7 8.6 8.6-11.2h-4.3l3-6.8Z"
                fill="#ffffff"
                opacity="0.95"
              />
              {/* Selection ring */}
              {selected && (
                <circle
                  cx="22"
                  cy="19.6"
                  r="8"
                  fill="none"
                  stroke={color}
                  strokeWidth="2"
                  opacity="0.6"
                />
              )}
            </svg>
          </button>
        );
      })}

      {interactive && view ? (
        <div className="absolute bottom-3 right-3 z-40 flex flex-col overflow-hidden rounded-xl border border-border bg-card elev-2">
          <button
            type="button"
            aria-label="Zoom in"
            className="size-11 text-base font-semibold touch-target"
            onClick={() => setView({ ...view, z: Math.min(18, view.z + 1) })}
          >
            +
          </button>
          <button
            type="button"
            aria-label="Zoom out"
            className="size-11 border-t border-border text-base font-semibold touch-target"
            onClick={() => setView({ ...view, z: Math.max(3, view.z - 1) })}
          >
            −
          </button>
        </div>
      ) : null}

      <span className="absolute bottom-1 left-2 z-40 text-[10px] text-muted-foreground">
        © OpenStreetMap contributors
      </span>
    </div>
  );
}
