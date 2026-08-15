import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, Navigation, Star, Zap, Clock, MapPin, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MapPanel } from "@/components/MapPanel";
import { BookingFlow } from "@/components/BookingFlow";
import { getPropertyDetail } from "@/lib/catalog.functions";
import {
  chargerSummary,
  directionsUrl,
  formatPrice,
  statusClasses,
  statusLabel,
  type Charger,
  type Property,
} from "@/lib/pineev";

const detailQuery = (id: string) =>
  queryOptions({
    queryKey: ["property", id],
    queryFn: () =>
      getPropertyDetail({ data: { id } }) as Promise<{
        property: Property | null;
        chargers: Charger[];
      }>,
  });

export const Route = createFileRoute("/property/$id")({
  loader: async ({ context, params }) => {
    const result = await context.queryClient.ensureQueryData(detailQuery(params.id));
    if (!result.property) throw notFound();
    return { name: result.property.name, city: result.property.city };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Charging spot unavailable — PineEV" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const title = `${loaderData.name}, ${loaderData.city} — Reserve EV charging | PineEV`;
    const description = `Reserve a verified EV charging slot at ${loaderData.name} in ${loaderData.city} with PineEV.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: PropertyDetail,
  notFoundComponent: PropertyNotFound,
});

function PropertyNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 text-center">
      <div>
        <h1 className="text-2xl font-bold">This charging spot isn't available</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          It may have been removed or is awaiting verification.
        </p>
        <Link to="/find" className="mt-6 inline-block">
          <Button className="rounded-full">Back to map</Button>
        </Link>
      </div>
    </div>
  );
}

function PropertyDetail() {
  const { id } = Route.useParams();
  const { data } = useSuspenseQuery(detailQuery(id));
  const property = data.property!;
  const position = { lat: Number(property.latitude), lng: Number(property.longitude) };

  return (
    <div className="min-h-screen bg-surface pb-28">
      {/* Gallery */}
      <div className="relative">
        <div className="aspect-[4/3] w-full overflow-hidden bg-muted sm:aspect-[21/9]">
          {property.images?.[0] ? (
            <img
              src={property.images[0]}
              alt={property.name}
              className="size-full object-cover"
            />
          ) : null}
        </div>
        <Link
          to="/find"
          aria-label="Back to map"
          className="absolute left-4 top-4 inline-flex size-10 items-center justify-center rounded-full bg-card/90 shadow-float backdrop-blur-xl"
        >
          <ArrowLeft className="size-4" />
        </Link>
      </div>

      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
        <div className="-mt-8 rounded-4xl border border-border bg-card p-5 shadow-float sm:p-7">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusClasses(property.status)}`}
            >
              {statusLabel(property.status)}
            </span>
            <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-secondary-foreground">
              {property.category}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold">
              <Star className="size-3.5 fill-warning text-warning" />
              {Number(property.rating).toFixed(1)}
            </span>
          </div>

          <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">{property.name}</h1>
          <p className="mt-1.5 flex items-start gap-1.5 text-sm text-muted-foreground">
            <MapPin className="mt-0.5 size-4 shrink-0" />
            {property.address}
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { icon: Zap, label: "Charger", value: chargerSummary(property) },
              { icon: Clock, label: "Timings", value: property.open_status || "Open now" },
              {
                icon: Check,
                label: "Free slots",
                value: `${property.available_slots}/${property.total_slots}`,
              },
              { icon: Zap, label: "Price", value: formatPrice(property.price) },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl bg-surface p-3.5">
                <item.icon className="size-4 text-primary" />
                <p className="mt-2 text-[11px] font-semibold text-muted-foreground">
                  {item.label}
                </p>
                <p className="text-sm font-bold">{item.value}</p>
              </div>
            ))}
          </div>

          {property.description ? (
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
              {property.description}
            </p>
          ) : null}

          {property.amenities?.length ? (
            <div className="mt-5">
              <h2 className="text-sm font-bold">Amenities</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {property.amenities.map((amenity) => (
                  <span
                    key={amenity}
                    className="rounded-full border border-border px-3 py-1.5 text-xs font-medium"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {/* Map + directions */}
        <div className="mt-6 overflow-hidden rounded-4xl border border-border bg-card shadow-soft">
          <div className="h-56 w-full sm:h-72">
            <MapPanel
              properties={[property]}
              selectedId={property.id}
              focus={position}
              cluster={false}
              zoom={15}
              interactive={false}
            />
          </div>
          <div className="flex items-center justify-between gap-3 p-4">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{property.city}</p>
              <p className="truncate text-xs text-muted-foreground">{property.address}</p>
            </div>
            <a href={directionsUrl(position.lat, position.lng)} target="_blank" rel="noreferrer">
              <Button variant="outline" size="sm" className="rounded-full">
                <Navigation className="mr-1.5 size-4" />
                Directions
              </Button>
            </a>
          </div>
        </div>

        {/* Booking */}
        <div className="mt-6">
          <BookingFlow property={property} chargers={data.chargers} />
        </div>
      </div>
    </div>
  );
}
