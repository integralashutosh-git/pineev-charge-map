import { useEffect, useRef, useState, useCallback } from "react";
import type { MarkerClusterer } from "@googlemaps/markerclusterer";
import {
  loadGoogleMaps,
  mapsAuthFailed,
  onMapsAuthFailure,
  markMapsBlocked,
  MAP_STYLES,
  pinIcon,
  userDotIcon,
  clusterIcon,
} from "@/lib/google-maps";
import FallbackMap from "./FallbackMap";
import { DEFAULT_CENTER, statusColor, type Property } from "@/lib/pineev";
import { MapPin, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MapViewProps {
  properties: Property[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  userLocation?: { lat: number; lng: number } | null;
  focus?: { lat: number; lng: number } | null;
  zoom?: number;
  cluster?: boolean;
  className?: string;
  interactive?: boolean;
  /** Optional per-property marker colour override. */
  colorFor?: (property: Property) => string;
  /** Points to fit into view (user + nearby stations). Refit when the key changes. */
  fitPoints?: { lat: number; lng: number }[] | undefined;
  fitKey?: string | undefined;
}

export default function MapView({
  properties,
  selectedId,
  onSelect,
  userLocation,
  focus,
  zoom = 11,
  cluster = true,
  className = "size-full",
  interactive = true,
  colorFor,
  fitPoints,
  fitKey,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<Map<string, google.maps.Marker>>(new Map());
  const clustererRef = useRef<MarkerClusterer | null>(null);
  const userMarkerRef = useRef<google.maps.Marker | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blocked, setBlocked] = useState(() => mapsAuthFailed());

  useEffect(() => {
    const unsubscribe = onMapsAuthFailure(() => setBlocked(true));
    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    loadGoogleMaps()
      .then((maps) => {
        if (cancelled || !containerRef.current) return;
        const first = properties[0];
        const initialCenter =
          focus ??
          (first ? { lat: Number(first.latitude), lng: Number(first.longitude) } : DEFAULT_CENTER);
        mapRef.current = new maps.Map(containerRef.current, {
          center: initialCenter,

          zoom,
          styles: MAP_STYLES,
          disableDefaultUI: true,
          zoomControl: interactive,
          gestureHandling: interactive ? "greedy" : "none",
          clickableIcons: false,
        });
        setReady(true);
      })
      .catch((err: Error) => setError(err.message));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Google shows an in-map error panel for RefererNotAllowedMapError without
  // calling gm_authFailure — detect it and swap in the keyless fallback map.
  useEffect(() => {
    if (!ready) return;
    const timer = window.setTimeout(() => {
      const el = containerRef.current;
      if (!el) return;
      const errored = el.querySelector(".gm-err-container");
      if (errored) markMapsBlocked();
    }, 2200);
    return () => window.clearTimeout(timer);
  }, [ready]);

  // markers
  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;

    const existing = markersRef.current;
    const nextIds = new Set(properties.map((p) => p.id));

    for (const [id, marker] of existing) {
      if (!nextIds.has(id)) {
        marker.setMap(null);
        clustererRef.current?.removeMarker(marker);
        existing.delete(id);
      }
    }

    const created: google.maps.Marker[] = [];
    // Stagger animation for new markers
    for (let i = 0; i < properties.length; i++) {
      const property = properties[i]!;
      const selected = property.id === selectedId;
      let marker = existing.get(property.id);
      if (!marker) {
        marker = new google.maps.Marker({
          position: { lat: Number(property.latitude), lng: Number(property.longitude) },
          title: property.name,
          animation: google.maps.Animation.DROP,
        });
        marker.addListener("click", () => onSelect?.(property.id));
        existing.set(property.id, marker);
        created.push(marker);
        
        // Stagger the drop animation
        if (typeof google !== "undefined" && google.maps.Animation) {
          // Capture marker in closure to avoid possibly-undefined narrowing
          const m = marker;
          setTimeout(() => {
            if (m.getMap()) {
              m.setAnimation(google.maps.Animation.DROP);
            }
          }, i * 30);
        }
      }
      marker.setIcon(pinIcon(colorFor?.(property) ?? statusColor(property.status), selected));
      marker.setZIndex(selected ? 999 : 1);
      
      // Add bounce animation when selected
      if (selected && !marker.getAnimation()) {
        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(() => marker.setAnimation(null), 1400);
      } else if (!selected && marker.getAnimation()) {
        marker.setAnimation(null);
      }
    }

    if (cluster) {
      if (!clustererRef.current) {
        void import("@googlemaps/markerclusterer").then((mod) => {
          if (clustererRef.current) {
            clustererRef.current.addMarkers(created);
            return;
          }
          clustererRef.current = new mod.MarkerClusterer({
            map,
            markers: created,
            algorithm: new mod.SuperClusterAlgorithm({ maxZoom: 16 }),
            renderer: {
              render: ({ count, position }) => {
                return new google.maps.Marker({
                  position,
                  icon: clusterIcon(count),
                  zIndex: 100,
                });
              },
            },
          });
        });
      } else if (created.length) {
        clustererRef.current.addMarkers(created);
      }
    } else {
      created.forEach((m) => m.setMap(map));
    }
  }, [ready, properties, selectedId, cluster, onSelect, colorFor]);

  // user location marker
  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    if (!userLocation) {
      userMarkerRef.current?.setMap(null);
      userMarkerRef.current = null;
      return;
    }
    if (!userMarkerRef.current) {
      userMarkerRef.current = new google.maps.Marker({
        map,
        icon: userDotIcon(),
        zIndex: 500,
        position: userLocation,
      });
    } else {
      userMarkerRef.current.setPosition(userLocation);
    }
  }, [ready, userLocation]);

  // fit user + nearby stations into view
  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map || !fitPoints || fitPoints.length < 2) return;
    const bounds = new google.maps.LatLngBounds();
    fitPoints.forEach((point) => bounds.extend(point));
    map.fitBounds(bounds, 64);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, fitKey]);

  // smooth zoom to focus
  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map || !focus) return;
    map.panTo(focus);
    const current = map.getZoom() ?? 0;
    if (current < 15) {
      let next = Math.max(current, 12);
      const step = () => {
        next += 1;
        map.setZoom(next);
        if (next < 15) window.setTimeout(step, 110);
      };
      window.setTimeout(step, 160);
    }
  }, [ready, focus]);

  // Map controls - only show when interactive
  const MapControls = useCallback(() => {
    if (!interactive || !ready || !mapRef.current) return null;

    const map = mapRef.current;
    const handleZoomIn = () => map.setZoom((map.getZoom() ?? 10) + 1);
    const handleZoomOut = () => map.setZoom((map.getZoom() ?? 10) - 1);
    const handleLocate = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const center = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            map.panTo(center);
            map.setZoom(15);
          },
          () => {
            // Silently fail - user denied location
          },
          { enableHighAccuracy: true, timeout: 10000 }
        );
      }
    };

    return (
      <div className="absolute right-3 top-3 z-20 flex flex-col gap-1.5">
        <div className="flex flex-col gap-1.5">
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="shadow-elev-1 hover:shadow-elev-2"
            onClick={handleZoomIn}
            aria-label="Zoom in"
          >
            <Plus className="size-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="shadow-elev-1 hover:shadow-elev-2"
            onClick={handleZoomOut}
            aria-label="Zoom out"
          >
            <Minus className="size-4" />
          </Button>
        </div>
        <Button
          type="button"
          size="icon"
          variant="outline"
          className="shadow-elev-1 hover:shadow-elev-2"
          onClick={handleLocate}
          aria-label="Locate me"
        >
          <MapPin className="size-4" />
        </Button>
      </div>
    );
  }, [interactive, ready]);

  if (blocked || error) {
    return (
      <FallbackMap
        properties={properties}
        selectedId={selectedId}
        onSelect={onSelect}
        userLocation={userLocation}
        focus={focus}
        zoom={zoom}
        className={className}
        interactive={interactive}
        colorFor={colorFor}
        fitPoints={fitPoints}
        fitKey={fitKey}
      />
    );
  }

  const hasPosition = /(?:^|\s)(?:absolute|fixed|relative|sticky)(?:\s|$)/.test(className);

  return (
    <div className={`${hasPosition ? "" : "relative"} ${className}`}>
      <div ref={containerRef} className="size-full" />
      {!ready ? (
        <div className="absolute inset-0 flex items-center justify-center bg-surface">
          <div className="text-center">
            <div className="mx-auto size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="mt-3 text-xs font-medium text-muted-foreground">
              {error ?? "Loading map…"}
            </p>
          </div>
        </div>
      ) : null}
      {interactive && <MapControls />}
    </div>
  );
}
