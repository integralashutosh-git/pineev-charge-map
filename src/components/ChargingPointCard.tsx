import { Link } from "@tanstack/react-router";
import { Star, Zap, MapPin, IndianRupee } from "lucide-react";
import { StatusIndicator } from "./StatusIndicator";
import { formatDistance, type Property } from "@/lib/pineev";
import { useI18n } from "@/lib/i18n";

function hueFrom(id: string) {
  let sum = 0;
  for (let i = 0; i < id.length; i += 1) sum += id.charCodeAt(i);
  return sum % 360;
}

export function ChargingPointCard({
  property,
  distanceKm,
}: {
  property: Property;
  distanceKm?: number | null;
}) {
  const { t } = useI18n();
  const hue = hueFrom(property.id);

  return (
    <Link
      to="/charging-point/$id"
      params={{ id: property.id }}
      className="group block overflow-hidden rounded-2xl border border-border bg-card elev-1 transition-all duration-300 hover:-translate-y-1 hover:elev-3"
    >
      <div
        className="relative h-32"
        style={{
          backgroundImage: `linear-gradient(135deg, oklch(0.62 0.16 ${hue}) 0%, var(--primary) 78%)`,
        }}
      >
        <div className="absolute left-3 top-3">
          <StatusIndicator status={property.status} />
        </div>
        <span className="absolute bottom-3 right-3 rounded-full bg-card/85 px-2.5 py-1 text-xs font-semibold text-foreground backdrop-blur">
          {property.category}
        </span>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-base font-semibold leading-tight text-foreground">
            {property.name}
          </h3>
          <span className="flex shrink-0 items-center gap-1 text-sm font-semibold text-foreground">
            <Star className="size-3.5 fill-amber text-amber" />
            {Number(property.rating).toFixed(1)}
          </span>
        </div>

        <p className="mt-1 flex items-start gap-1.5 text-sm text-muted-foreground">
          <MapPin className="mt-0.5 size-3.5 shrink-0" />
          <span className="line-clamp-1">{property.address}</span>
        </p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-primary-container px-2.5 py-0.5 text-xs font-semibold text-primary">
            {property.charger_type}
          </span>
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            {property.available_slots}/{property.total_slots} slots
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-sm">
          <span className="flex items-center gap-1 font-semibold text-foreground">
            <Zap className="size-3.5 text-energy" />
            {property.power_kw} kW
          </span>
          <span className="text-muted-foreground">
            {distanceKm != null ? `${formatDistance(distanceKm)} ${t("common.away")}` : property.city}
          </span>
          <span className="flex items-center font-semibold text-foreground">
            <IndianRupee className="size-3.5" />
            {Number(property.price).toFixed(0)}
          </span>
        </div>
      </div>
    </Link>
  );
}
