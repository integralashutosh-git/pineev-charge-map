export type PropertyStatus = "available" | "busy" | "offline";

export interface Property {
  id: string;
  name: string;
  category: string;
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  rating: number;
  price: number;
  charger_type: string;
  power_kw: number;
  total_slots: number;
  available_slots: number;
  images: string[];
  amenities: string[];
  status: string;
  open_status: string;
  description: string;
}

export interface Charger {
  id: string;
  property_id: string;
  label: string;
  connector_type: string;
  charger_type: string;
  power_kw: number;
  price: number;
  status: string;
}

export const CATEGORIES = ["Hotel", "Dhaba", "Restaurant", "Cafe", "Office", "Parking"] as const;

export const FILTERS = ["All", "Fast DC", "AC", "Hotel", "Dhaba", "Restaurant", "Parking"] as const;

export type Filter = (typeof FILTERS)[number];

export const DEFAULT_CENTER = { lat: 28.6139, lng: 77.209 };

export function statusLabel(status: string) {
  if (status === "available") return "Available";
  if (status === "busy") return "Busy";
  return "Offline";
}

export function statusColor(status: string) {
  if (status === "available") return "#16A34A";
  if (status === "busy") return "#F59E0B";
  return "#9CA3AF";
}

export function statusClasses(status: string) {
  if (status === "available") return "bg-primary/10 text-primary";
  if (status === "busy") return "bg-warning/15 text-warning-foreground";
  return "bg-muted text-muted-foreground";
}

export function chargerSummary(p: Pick<Property, "power_kw" | "charger_type">) {
  return `${p.power_kw}kW ${p.charger_type}`;
}

export function formatPrice(price: number) {
  return `₹${Number(price).toFixed(0)}/kWh`;
}

export function formatINR(amount: number) {
  return `₹${Number(amount).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

/** Haversine distance in km */
export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function formatDistance(km: number | null) {
  if (km == null) return "—";
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

export function matchesFilter(property: Property, filter: Filter) {
  switch (filter) {
    case "All":
      return true;
    case "Fast DC":
      return property.charger_type === "DC" && property.power_kw >= 30;
    case "AC":
      return property.charger_type === "AC";
    default:
      return property.category === filter;
  }
}

export function directionsUrl(lat: number, lng: number) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
}

export const TIME_SLOTS = [
  "06:00 - 07:00",
  "07:00 - 08:00",
  "08:00 - 09:00",
  "09:00 - 10:00",
  "10:00 - 11:00",
  "11:00 - 12:00",
  "12:00 - 13:00",
  "13:00 - 14:00",
  "14:00 - 15:00",
  "15:00 - 16:00",
  "16:00 - 17:00",
  "17:00 - 18:00",
  "18:00 - 19:00",
  "19:00 - 20:00",
  "20:00 - 21:00",
  "21:00 - 22:00",
];

export function estimatedAmount(pricePerKwh: number, powerKw: number) {
  // 1 hour session, assume 70% effective charge rate
  const kwh = Math.round(powerKw * 0.7);
  return Math.round(pricePerKwh * kwh);
}
