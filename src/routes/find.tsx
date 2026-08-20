import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  LocateFixed,
  Star,
  Navigation,
  ChevronUp,
  ChevronDown,
  ArrowLeft,
  X,
  MapPin,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { MapPanel } from "@/components/MapPanel";
import { BookingFlow } from "@/components/BookingFlow";
import { getPropertyDetail, listProperties } from "@/lib/catalog.functions";
import { supabase } from "@/integrations/supabase/client";
import {
  bookingState,
  bookingStateClasses,
  bookingStateColor,
  bookingStateLabel,
} from "@/lib/map-status";
import {
  FILTERS,
  chargerSummary,
  directionsUrl,
  distanceKm,
  formatDistance,
  formatPrice,
  matchesFilter,
  type Charger,
  type Filter,
  type Property,
} from "@/lib/pineev";

const propertiesQuery = queryOptions({
  queryKey: ["properties"],
  queryFn: () => listProperties() as Promise<Property[]>,
});

const detailQuery = (id: string) =>
  queryOptions({
    queryKey: ["property", id],
    queryFn: () =>
      getPropertyDetail({ data: { id } }) as Promise<{
        property: Property | null;
        chargers: Charger[];
      }>,
  });

export const Route = createFileRoute("/find")({
  head: () => ({
    meta: [
      { title: "Find an EV charger near you — PineEV" },
      {
        name: "description",
        content:
          "Live map of verified PineEV charging destinations. Filter by fast DC, AC, hotels and dhabas, then reserve a slot instantly.",
      },
      { property: "og:title", content: "Find an EV charger near you — PineEV" },
      {
        property: "og:description",
        content: "Live availability, distance and pricing for verified EV charging hosts.",
      },
      { property: "og:image", content: "https://pineev.in/og-image.png" },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(propertiesQuery);
  },
  component: FindPage,
});

type Snap = "collapsed" | "half" | "full";

const SNAP_HEIGHT: Record<Snap, string> = {
  collapsed: "6.75rem",
  half: "46vh",
  full: "86vh",
};

const markerColorFor = (property: Property) => bookingStateColor(bookingState(property));

function FindPage() {
  const { data: properties } = useSuspenseQuery(propertiesQuery);
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("All");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [snap, setSnap] = useState<Snap>("half");
  const [bookingOpen, setBookingOpen] = useState(false);

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
    : null;

  const locate = useCallback((silent = false) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    if (!silent) setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }, []);

  // ask for location as soon as the map opens
  const askedRef = useRef(false);
  useEffect(() => {
    if (askedRef.current) return;
    askedRef.current = true;
    locate(true);
  }, [locate]);

  // live availability: refresh markers and slots without a reload
  useEffect(() => {
    const channel = supabase
      .channel("map-live-availability")
      .on("postgres_changes", { event: "*", schema: "public", table: "properties" }, () => {
        void queryClient.invalidateQueries({ queryKey: ["properties"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "chargers" }, () => {
        void queryClient.invalidateQueries({ queryKey: ["properties"] });
        void queryClient.invalidateQueries({ queryKey: ["property"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, () => {
        void queryClient.invalidateQueries({ queryKey: ["properties"] });
        void queryClient.invalidateQueries({ queryKey: ["taken-slots"] });
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // fit the user plus the nearest stations into view
  const nearest = results.slice(0, 5);
  const fitPoints = useMemo(() => {
    if (!userLocation) return undefined;
    return [
      userLocation,
      ...nearest.map((p) => ({ lat: Number(p.latitude), lng: Number(p.longitude) })),
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLocation, nearest.map((p) => p.id).join(",")]);
  const fitKey = fitPoints ? `${userLocation?.lat}-${nearest.map((p) => p.id).join(",")}` : "";

  const detail = useQuery({ ...detailQuery(selectedId ?? ""), enabled: Boolean(selectedId) });
  const chargers = detail.data?.chargers ?? [];

  function select(id: string) {
    setSelectedId(id);
    setSnap("half");
  }

  // drag handle
  const dragRef = useRef<{ y: number } | null>(null);
  function onHandleDown(e: React.PointerEvent) {
    dragRef.current = { y: e.clientY };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }
  function onHandleUp(e: React.PointerEvent) {
    const start = dragRef.current;
    dragRef.current = null;
    if (!start) return;
    const dy = e.clientY - start.y;
    if (Math.abs(dy) < 24) {
      setSnap((s) => (s === "full" ? "half" : s === "half" ? "collapsed" : "half"));
      return;
    }
    if (dy < 0) setSnap((s) => (s === "collapsed" ? "half" : "full"));
    else setSnap((s) => (s === "full" ? "half" : "collapsed"));
  }

  const visible =
    snap === "collapsed" ? results.slice(0, 1) : snap === "half" ? results.slice(0, 3) : results;

  return (
    <div className="relative h-screen w-full overflow-hidden bg-surface">
      <MapPanel
        properties={results}
        selectedId={selectedId}
        onSelect={select}
        userLocation={userLocation}
        focus={focus}
        colorFor={markerColorFor}
        fitPoints={fitPoints}
        fitKey={fitKey}
        cluster={true}
        className="absolute inset-0"
      />

      {/* Top search bar */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 p-3 sm:p-4">
        <div className="pointer-events-auto mx-auto w-full max-w-2xl">
          <div className="glass-panel flex items-center gap-2 rounded-full border border-border/60 px-2 py-2">
            <Link
              to="/"
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary touch-target"
              aria-label="Back to home"
            >
              <ArrowLeft className="size-4" />
            </Link>
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search hotel, dhaba, restaurant, address or city"
              className="h-9 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="inline-flex size-10 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary touch-target"
                aria-label="Clear search"
              >
                <X className="size-4" />
              </button>
            ) : null}
          </div>

          {query && results.length > 0 ? (
            <div className="glass-panel mt-2 overflow-hidden rounded-3xl border border-border/60">
              {results.slice(0, 5).map((property) => (
                <button
                  key={property.id}
                  type="button"
                  onClick={() => {
                    select(property.id);
                    setQuery("");
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-secondary touch-target"
                >
                  <MapPin className="size-4 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{property.name}</span>
                    <span className="block truncate text-[11px] text-muted-foreground">
                      {property.category} · {property.city}
                    </span>
                  </span>
                  {property.distance != null ? (
                    <span className="shrink-0 text-[11px] font-semibold text-accent">
                      {formatDistance(property.distance)}
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          ) : null}

          <div className="mt-2 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {FILTERS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                className={`shrink-0 rounded-full border px-4 py-2 text-xs font-semibold shadow-soft transition-colors touch-target ${
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
        onClick={() => locate()}
        aria-label="Use my location"
        className="absolute right-4 z-20 inline-flex size-12 items-center justify-center rounded-full border border-border/60 bg-card/95 text-foreground shadow-float backdrop-blur-xl transition-transform active:scale-95 touch-target"
        style={{ bottom: `calc(${SNAP_HEIGHT[snap]} + 1rem)` }}
      >
        <LocateFixed className={`size-5 ${locating ? "animate-locate-pulse text-accent" : ""}`} />
      </button>

      {/* Bottom sheet */}
      <div
        className="absolute inset-x-0 bottom-0 z-30 transition-[height] duration-300 ease-out"
        style={{ height: SNAP_HEIGHT[snap] }}
      >
        <div className="glass-panel mx-auto flex h-full w-full max-w-2xl flex-col rounded-t-4xl border-x border-t border-border/60">
          <div
            role="button"
            tabIndex={0}
            aria-label="Drag to resize nearby list"
            onPointerDown={onHandleDown}
            onPointerUp={onHandleUp}
            onKeyDown={(e) =>
              e.key === "Enter" && setSnap((s) => (s === "full" ? "collapsed" : "full"))
            }
            className="flex w-full cursor-grab touch-none items-center justify-center px-5 pb-3 pt-4 touch-target"
          >
            <span className="h-2 w-12 rounded-full bg-border" />
          </div>

          <div className="flex items-center justify-between px-5 pb-3">
            <p className="text-sm font-semibold">
              {results.length} charging {results.length === 1 ? "spot" : "spots"}
              {userLocation ? " near you" : ""}
            </p>
            <button
              type="button"
              onClick={() => setSnap((s) => (s === "full" ? "collapsed" : "full"))}
              className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground touch-target py-2"
            >
              {snap === "full" ? (
                <>
                  Hide <ChevronDown className="size-4" />
                </>
              ) : (
                <>
                  Show all <ChevronUp className="size-4" />
                </>
              )}
            </button>
          </div>

          <div className="flex-1 space-y-2.5 overflow-y-auto px-3 pb-6">
            {results.length === 0 ? (
              <p className="px-2 py-8 text-center text-sm text-muted-foreground">
                No charging spots match that search yet.
              </p>
            ) : null}

            {selected ? (
              <PropertyCard
                property={selected}
                distance={selected.distance}
                expanded
                onBook={() => setBookingOpen(true)}
              />
            ) : null}

            {visible
              .filter((p) => p.id !== selectedId)
              .map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  distance={property.distance}
                  onSelect={() => select(property.id)}
                />
              ))}
          </div>
        </div>
      </div>

      {/* Booking flow — existing component, charger pre-filled */}
      <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
        <DialogContent className="max-h-[92vh] max-w-xl overflow-y-auto rounded-4xl p-0">
          <DialogTitle className="sr-only">
            Reserve a slot{selected ? ` at ${selected.name}` : ""}
          </DialogTitle>
          {selected && detail.data?.property ? (
            <BookingFlow property={detail.data.property} chargers={chargers} />
          ) : (
            <div className="flex h-48 items-center justify-center">
              <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface CardProps {
  property: Property;
  distance: number | null;
  expanded?: boolean;
  onSelect?: () => void;
  onBook?: () => void;
}

function PropertyCard({ property, distance, expanded, onSelect, onBook }: CardProps) {
  const state = bookingState(property);
  const booked = state === "booked";

  return (
    <div
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onClick={onSelect}
      onKeyDown={(e) => e.key === "Enter" && onSelect?.()}
      className={`rounded-3xl border bg-card p-3.5 text-left shadow-soft transition-colors ${
        expanded ? "border-primary" : "border-border/70"
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
              className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${bookingStateClasses(state)}`}
            >
              {bookingStateLabel(property, state)}
            </span>
            <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold text-secondary-foreground">
              {chargerSummary(property)}
            </span>
            <span className="text-[11px] font-semibold text-muted-foreground">
              {formatPrice(property.price)}
            </span>
            {distance != null ? (
              <span className="text-[11px] font-semibold text-accent">
                {formatDistance(distance)}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {expanded ? (
        <div className="animate-rise">
          <p className="mt-3 flex items-start gap-1.5 text-xs text-muted-foreground">
            <MapPin className="mt-0.5 size-3.5 shrink-0" />
            {property.address}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-semibold text-muted-foreground">
            <span className="inline-flex items-center gap-1 text-foreground">
              <Zap className="size-3.5 text-primary" />
              {property.power_kw}kW {property.charger_type}
            </span>
            <span>
              {Number(property.available_slots)} of {Number(property.total_slots)} slots free
            </span>
            <span>{property.open_status}</span>
          </div>

          <div className="mt-3 flex gap-2">
            {booked ? (
              <Button
                size="sm"
                disabled
                className="flex-1 rounded-full bg-muted text-muted-foreground touch-target"
              >
                Booked
              </Button>
            ) : (
              <Button size="sm" className="flex-1 rounded-full touch-target" onClick={onBook}>
                Book Now
              </Button>
            )}
            <a
              href={directionsUrl(Number(property.latitude), Number(property.longitude))}
              target="_blank"
              rel="noreferrer"
              className="shrink-0"
            >
              <Button size="sm" variant="outline" className="rounded-full touch-target">
                <Navigation className="mr-1.5 size-4" />
                Navigate
              </Button>
            </a>
          </div>
        </div>
      ) : null}
    </div>
  );
}
