import { useEffect, useRef, useState } from "react";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import { loadGoogleMaps, MAP_STYLES, pinIcon, userDotIcon } from "@/lib/google-maps";
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
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<Map<string, google.maps.Marker>>(new Map());
  const clustererRef = useRef<MarkerClusterer | null>(null);
  const userMarkerRef = useRef<google.maps.Marker | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      marker.setIcon(pinIcon(statusColor(property.status), selected));
      marker.setZIndex(selected ? 999 : 1);
    }

    if (cluster) {
      if (!clustererRef.current) {
        clustererRef.current = new MarkerClusterer({ map, markers: created });
      } else if (created.length) {
        clustererRef.current.addMarkers(created);
      }
    } else {
      created.forEach((m) => m.setMap(map));
    }
  }, [ready, properties, selectedId, cluster, onSelect]);

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

  // pan to focus
  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map || !focus) return;
    map.panTo(focus);
    if ((map.getZoom() ?? 0) < 13) map.setZoom(14);
  }, [ready, focus]);

  return (
    <div className={`relative ${className}`}>
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
