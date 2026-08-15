import { useEffect, useRef, useState } from "react";
import type { MarkerClusterer } from "@googlemaps/markerclusterer";
import {
  loadGoogleMaps,
  mapsAuthFailed,
  onMapsAuthFailure,
  markMapsBlocked,
  MAP_STYLES,
  pinIcon,
  userDotIcon,
} from "@/lib/google-maps";
import FallbackMap from "./FallbackMap";
import { DEFAULT_CENTER, statusColor, type Property } from "@/lib/pineev";


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
    for (const property of properties) {
      const selected = property.id === selectedId;
      let marker = existing.get(property.id);
      if (!marker) {
        marker = new google.maps.Marker({
          position: { lat: Number(property.latitude), lng: Number(property.longitude) },
          title: property.name,
        });
        marker.addListener("click", () => onSelect?.(property.id));
        existing.set(property.id, marker);
        created.push(marker);
      }
      marker.setIcon(pinIcon(colorFor?.(property) ?? statusColor(property.status), selected));
      marker.setZIndex(selected ? 999 : 1);

    }

    if (cluster) {
      if (!clustererRef.current) {
        void import("@googlemaps/markerclusterer").then((mod) => {
          if (clustererRef.current) {
            clustererRef.current.addMarkers(created);
            return;
          }
          clustererRef.current = new mod.MarkerClusterer({ map, markers: created });
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
    </div>
  );
}
