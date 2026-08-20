/// <reference types="google.maps" />

let loaderPromise: Promise<typeof google.maps> | null = null;

const CALLBACK_NAME = "__pineevMapsReady";

let authFailed = false;
const authListeners = new Set<() => void>();

/** True when Google rejected the key for this domain (RefererNotAllowedMapError). */
export function mapsAuthFailed() {
  return authFailed;
}

/** Flag the key as rejected for this domain so every map switches to the fallback. */
export function markMapsBlocked() {
  if (authFailed) return;
  authFailed = true;
  authListeners.forEach((cb) => cb());
}

/** Subscribe to Google Maps key/domain rejection. */
export function onMapsAuthFailure(cb: () => void) {
  if (authFailed) cb();
  authListeners.add(cb);
  return () => authListeners.delete(cb);
}

/** Loads the Google Maps JS API once, asynchronously, in the browser. */
export function loadGoogleMaps(): Promise<typeof google.maps> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Maps can only load in the browser"));
  }
  if (window.google?.maps) return Promise.resolve(window.google.maps);
  if (loaderPromise) return loaderPromise;

  const key = import.meta.env["VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY"] as
    string | undefined;
  const channel = import.meta.env["VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID"] as
    string | undefined;

  if (!key) {
    return Promise.reject(new Error("Google Maps key is not configured"));
  }

  (window as unknown as Record<string, unknown>)["gm_authFailure"] = () => {
    authFailed = true;
    authListeners.forEach((cb) => cb());
  };

  loaderPromise = new Promise<typeof google.maps>((resolve, reject) => {
    (window as unknown as Record<string, unknown>)[CALLBACK_NAME] = () => {
      resolve(window.google.maps);
    };
    const script = document.createElement("script");
    const params = new URLSearchParams({
      key,
      loading: "async",
      libraries: "places,marker",
      callback: CALLBACK_NAME,
      v: "weekly",
    });
    if (channel) params.set("channel", channel);
    script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
    script.async = true;
    script.onerror = () => {
      loaderPromise = null;
      reject(new Error("Failed to load Google Maps"));
    };
    document.head.appendChild(script);
  });

  return loaderPromise;
}

/** Premium, minimal map styling — Apple/Google Maps aesthetic with PineEV brand. */
export const MAP_STYLES: google.maps.MapTypeStyle[] = [
  // Clean base
  { featureType: "all", elementType: "geometry", stylers: [{ color: "#fafafa" }] },
  { featureType: "all", elementType: "labels.text.fill", stylers: [{ color: "#374151" }] },
  { featureType: "all", elementType: "labels.text.stroke", stylers: [{ color: "#ffffff" }, { weight: 0.5 }] },

  // Water - subtle brand accent
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#dbeafe" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#2563eb" }] },

  // Landscape - clean light
  { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#f8fafc" }] },
  { featureType: "landscape.natural", elementType: "geometry", stylers: [{ color: "#f1f5f9" }] },

  // Roads - minimal, high contrast
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#e5e7eb" }, { weight: 0.8 }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#d1d5db" }, { weight: 1.2 }] },
  { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#e5e7eb" }] },
  { featureType: "road.local", elementType: "geometry", stylers: [{ color: "#f3f4f6" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#6b7280" }, { visibility: "on" }] },
  { featureType: "road", elementType: "labels.icon", stylers: [{ visibility: "off" }] },

  // Transit - hidden
  { featureType: "transit", stylers: [{ visibility: "off" }] },

  // POI - reduced clutter
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#f3f4f6" }] },
  { featureType: "poi", elementType: "labels.text", stylers: [{ visibility: "off" }] },
  { featureType: "poi.business", stylers: [{ visibility: "off" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#dcfce7" }] },
  { featureType: "poi.park", elementType: "labels.text", stylers: [{ visibility: "off" }] },

  // Administrative - subtle boundaries
  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#e5e7eb" }, { weight: 0.5 }] },
  { featureType: "administrative", elementType: "labels.text.fill", stylers: [{ color: "#4b5563" }] },
  { featureType: "administrative.land_parcel", stylers: [{ visibility: "off" }] },
  { featureType: "administrative.neighborhood", stylers: [{ visibility: "off" }] },
];

export function pinIcon(color: string, selected = false) {
  const scale = selected ? 1.3 : 1;
  const baseSize = 44;
  const baseHeight = 54;
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${baseSize * scale}" height="${baseHeight * scale}" viewBox="0 0 ${baseSize} ${baseHeight}">
  <defs>
    <filter id="pin-shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="rgba(17,24,39,0.3)" flood-opacity="0.4"/>
    </filter>
    <filter id="pin-glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="4" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <g filter="url(#pin-shadow)" ${selected ? 'filter="url(#pin-glow)"' : ''}>
    <!-- Pin shadow base -->
    <path d="M22 3c9.4 0 17 7.4 17 16.6 0 11.9-13.4 24.3-16 28.9a1.2 1.2 0 0 1-2 0C18.4 43.9 5 31.5 5 19.6C5 10.4 12.6 3 22 3Z" fill="${color}"/>
    <!-- White highlight stroke -->
    <path d="M22 3c9.4 0 17 7.4 17 16.6 0 11.9-13.4 24.3-16 28.9a1.2 1.2 0 0 1-2 0C18.4 43.9 5 31.5 5 19.6C5 10.4 12.6 3 22 3Z" fill="none" stroke="rgba(255,255,255,0.9)" stroke-width="1.5"/>
    <!-- Inner white detail (lightning bolt) -->
    <path d="M24.6 12h-5.9l-4.1 9.4h4.4l-1.7 8.6 8.6-11.2h-4.3l3-6.8Z" fill="#ffffff" opacity="0.95"/>
    ${selected ? '<circle cx="22" cy="19.6" r="8" fill="none" stroke="' + color + '" stroke-width="2" opacity="0.6"/>' : ''}
  </g>
</svg>`;
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new google.maps.Size(baseSize * scale, baseHeight * scale),
    anchor: new google.maps.Point(22 * scale, 52 * scale),
  } satisfies google.maps.Icon;
}

export function userDotIcon() {
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
  <defs>
    <filter id="user-glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <!-- Outer pulse ring (animated via CSS would be better, but this is static) -->
  <circle cx="18" cy="18" r="15" fill="#2563EB" opacity="0.12" filter="url(#user-glow)"/>
  <!-- Middle ring -->
  <circle cx="18" cy="18" r="11" fill="#2563EB" opacity="0.2"/>
  <!-- Inner dot -->
  <circle cx="18" cy="18" r="7" fill="#2563EB" stroke="#ffffff" stroke-width="3"/>
  <!-- Center accent -->
  <circle cx="18" cy="18" r="3" fill="#ffffff"/>
</svg>`;
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new google.maps.Size(36, 36),
    anchor: new google.maps.Point(18, 18),
  } satisfies google.maps.Icon;
}

/** Cluster icon generator for marker clusters */
export function clusterIcon(clusterSize: number): google.maps.Icon {
  const isLarge = clusterSize >= 100;
  const isMedium = clusterSize >= 10;
  const size = isLarge ? 56 : isMedium ? 48 : 40;
  const fontSize = isLarge ? 16 : isMedium ? 14 : 12;
  
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <filter id="cluster-shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="rgba(17,24,39,0.3)"/>
    </filter>
  </defs>
  <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 2}" fill="#16A34A" filter="url(#cluster-shadow)"/>
  <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 4}" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1.5"/>
  <text x="${size/2}" y="${size/2 + fontSize/3}" font-family="system-ui, -apple-system, sans-serif" font-size="${fontSize}" font-weight="700" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">${clusterSize}</text>
</svg>`;
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new google.maps.Size(size, size),
    anchor: new google.maps.Point(size / 2, size / 2),
  } satisfies google.maps.Icon;
}
