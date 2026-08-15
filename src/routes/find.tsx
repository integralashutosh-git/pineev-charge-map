import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  Search,
  LocateFixed,
  Star,
  Navigation,
  ChevronUp,
  ChevronDown,
  ArrowLeft,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPanel } from "@/components/MapPanel";
import { listProperties } from "@/lib/catalog.functions";
import {
  FILTERS,
  chargerSummary,
  directionsUrl,
  distanceKm,
  formatDistance,
  formatPrice,
  matchesFilter,
  statusClasses,
  statusLabel,
  type Filter,
  type Property,
} from "@/lib/pineev";

const propertiesQuery = queryOptions({
  queryKey: ["properties"],
  queryFn: () => listProperties() as Promise<Property[]>,
});

export const Route = createFileRoute("/find")({
  head: () => ({
    meta: [
      { title: "Find an EV charger near you — PineEv" },
      {
        name: "description",
        content:
          "Live map of verified PineEv charging destinations. Filter by fast DC, AC, hotels and dhabas, then reserve a slot instantly.",
      },
      { property: "og:title", content: "Find an EV charger near you — PineEv" },
      {
        property: "og:description",
        content: "Live availability, distance and pricing for verified EV charging hosts.",
      },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(propertiesQuery);
  },
  component: FindPage,
});

function FindPage() {
  const { data: properties } = useSuspenseQuery(propertiesQuery);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("All");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(true);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return properties
      .filter((p) => matchesFilter(p, filter))
      .filter(
        (p) =>
          !q ||
          p.name.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q) ||
          p.address.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q),
      )
      .map((p) => ({
        ...p,
        distance: userLocation
          ? distanceKm(userLocation, { lat: Number(p.latitude), lng: Number(p.longitude) })
          : null,
      }))
      .sort((a, b) => {
        if (a.distance != null && b.distance != null) return a.distance - b.distance;
        return Number(b.rating) - Number(a.rating);
      });
  }, [properties, query, filter, userLocation]);

  const selected = results.find((p) => p.id === selectedId) ?? null;
  const focus = selected
    ? { lat: Number(selected.latitude), lng: Number(selected.longitude) }
    : userLocation;

  function locate() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-surface">
      <MapPanel
        properties={results}
        selectedId={selectedId}
        onSelect={(id) => {
          setSelectedId(id);
          setSheetOpen(true);
        }}
        userLocation={userLocation}
        focus={focus}
        className="absolute inset-0"
      />

      {/* Top search bar */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 p-3 sm:p-4">
        <div className="pointer-events-auto mx-auto w-full max-w-2xl">
          <div className="glass-panel flex items-center gap-2 rounded-full border border-border/60 px-2 py-2">
            <Link
              to="/"
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary"
              aria-label="Back to home"
            >
              <ArrowLeft className="size-4" />
            </Link>
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search destination, city or host"
              className="h-9 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary"
                aria-label="Clear search"
              >
                <X className="size-4" />
              </button>
            ) : null}
          </div>

          <div className="mt-2 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {FILTERS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold shadow-soft transition-colors ${
                  filter === item
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border/60 bg-card/90 text-foreground backdrop-blur-xl hover:bg-card"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Locate button */}
      <button
        type="button"
        onClick={locate}
        aria-label="Use my location"
        className="absolute right-4 z-20 inline-flex size-11 items-center justify-center rounded-full border border-border/60 bg-card/95 text-foreground shadow-float backdrop-blur-xl transition-transform active:scale-95"
        style={{ bottom: sheetOpen ? "calc(var(--sheet-h) + 1rem)" : "5.5rem" }}
      >
        <LocateFixed className={`size-5 ${locating ? "animate-locate-pulse text-accent" : ""}`} />
      </button>

      {/* Bottom sheet */}
      <div
        className="absolute inset-x-0 bottom-0 z-30 transition-transform duration-300 ease-out"
        style={{
          ["--sheet-h" as string]: "50vh",
          transform: sheetOpen ? "translateY(0)" : "translateY(calc(100% - 4.25rem))",
        }}
      >
        <div className="glass-panel mx-auto w-full max-w-2xl rounded-t-4xl border-x border-t border-border/60">
          <button
            type="button"
            onClick={() => setSheetOpen((v) => !v)}
            className="flex w-full items-center justify-between px-5 pb-2 pt-3"
          >
            <span className="mx-auto h-1.5 w-10 rounded-full bg-border" />
          </button>
          <div className="flex items-center justify-between px-5 pb-3">
            <p className="text-sm font-semibold">
              {results.length} charging {results.length === 1 ? "spot" : "spots"}
              {userLocation ? " near you" : ""}
            </p>
            <button
              type="button"
              onClick={() => setSheetOpen((v) => !v)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground"
            >
              {sheetOpen ? (
                <>
                  Hide <ChevronDown className="size-4" />
                </>
              ) : (
                <>
                  Show <ChevronUp className="size-4" />
                </>
              )}
            </button>
          </div>

          <div className="max-h-[46vh] space-y-2.5 overflow-y-auto px-3 pb-6">
            {results.length === 0 ? (
              <p className="px-2 py-8 text-center text-sm text-muted-foreground">
                No charging spots match that search yet.
              </p>
            ) : null}
            {results.map((property) => (
              <div
                key={property.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedId(property.id)}
                onKeyDown={(e) => e.key === "Enter" && setSelectedId(property.id)}
                className={`rounded-3xl border bg-card p-3.5 text-left shadow-soft transition-colors ${
                  selectedId === property.id ? "border-primary" : "border-border/70"
                }`}
              >
                <div className="flex gap-3">
                  <div className="size-20 shrink-0 overflow-hidden rounded-2xl bg-surface">
                    {property.images?.[0] ? (
                      <img
                        src={property.images[0]}
                        alt={property.name}
                        loading="lazy"
                        className="size-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="truncate font-display text-sm font-bold">{property.name}</h3>
                      <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold">
                        <Star className="size-3.5 fill-warning text-warning" />
                        {Number(property.rating).toFixed(1)}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {property.category} · {property.city}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusClasses(property.status)}`}
                      >
                        {statusLabel(property.status)}
                      </span>
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold text-secondary-foreground">
                        {chargerSummary(property)}
                      </span>
                      <span className="text-[11px] font-semibold text-muted-foreground">
                        {formatPrice(property.price)}
                      </span>
                      {property.distance != null ? (
                        <span className="text-[11px] font-semibold text-accent">
                          {formatDistance(property.distance)}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                {selectedId === property.id ? (
                  <div className="mt-3 flex gap-2 animate-rise">
                    <Link
                      to="/property/$id"
                      params={{ id: property.id }}
                      className="flex-1"
                    >
                      <Button size="sm" className="w-full rounded-full">
                        Reserve slot
                      </Button>
                    </Link>
                    <a
                      href={directionsUrl(Number(property.latitude), Number(property.longitude))}
                      target="_blank"
                      rel="noreferrer"
                      className="shrink-0"
                    >
                      <Button size="sm" variant="outline" className="rounded-full">
                        <Navigation className="mr-1.5 size-4" />
                        Directions
                      </Button>
                    </a>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
