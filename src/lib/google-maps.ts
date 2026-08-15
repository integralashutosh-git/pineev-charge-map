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
    | string
    | undefined;
  const channel = import.meta.env["VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID"] as
    | string
    | undefined;

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

/** Minimal, premium map styling — Google Maps look with less noise. */
export const MAP_STYLES: google.maps.MapTypeStyle[] = [
  { featureType: "poi.business", stylers: [{ visibility: "off" }] },
  { featureType: "poi.park", elementType: "labels.text", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { featureType: "administrative", elementType: "labels.text.fill", stylers: [{ color: "#4b5563" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#d7e7f5" }] },
  { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#f6f7f9" }] },
];

export function pinIcon(color: string, selected = false) {
  const scale = selected ? 1.25 : 1;
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${44 * scale}" height="${54 * scale}" viewBox="0 0 44 54">
  <g filter="url(#s)">
    <path d="M22 3c9.4 0 17 7.4 17 16.6 0 11.9-13.4 24.3-16 28.9a1.2 1.2 0 0 1-2 0C18.4 43.9 5 31.5 5 19.6C5 10.4 12.6 3 22 3Z" fill="${color}"/>
    <path d="M22 3c9.4 0 17 7.4 17 16.6 0 11.9-13.4 24.3-16 28.9a1.2 1.2 0 0 1-2 0C18.4 43.9 5 31.5 5 19.6C5 10.4 12.6 3 22 3Z" fill="none" stroke="rgba(255,255,255,.85)" stroke-width="2"/>
    <path d="M24.6 12h-5.9l-4.1 9.4h4.4l-1.7 8.6 8.6-11.2h-4.3l3-6.8Z" fill="#ffffff"/>
  </g>
  <defs>
    <filter id="s" x="0" y="0" width="44" height="54" filterUnits="userSpaceOnUse">
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(17,24,39,.35)"/>
    </filter>
  </defs>
</svg>`;
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new google.maps.Size(44 * scale, 54 * scale),
    anchor: new google.maps.Point(22 * scale, 52 * scale),
  } satisfies google.maps.Icon;
}

export function userDotIcon() {
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">
  <circle cx="14" cy="14" r="12" fill="#2563EB" opacity=".18"/>
  <circle cx="14" cy="14" r="6" fill="#2563EB" stroke="#ffffff" stroke-width="2.5"/>
</svg>`;
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new google.maps.Size(28, 28),
    anchor: new google.maps.Point(14, 14),
  } satisfies google.maps.Icon;
}
