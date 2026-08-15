import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { listProperties } from "@/lib/catalog.functions";
import { FILTERS, matchesFilter, distanceKm, type Filter, type Property } from "@/lib/pineev";
import { ChargingPointCard } from "@/components/ChargingPointCard";
import { FilterChip } from "@/components/FilterChip";
import { MapPanel } from "@/components/MapPanel";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useI18n } from "@/lib/i18n";
import { bookingStateColor } from "@/lib/map-status";

export const Route = createFileRoute("/discover")({
  head: () => ({
    meta: [
      { title: "Discover EV chargers near you — PineEV" },
      {
        name: "description",
        content:
          "Browse verified PineEV host chargers across India. Filter by connector, power and category, then reserve a slot in seconds.",
      },
      { property: "og:title", content: "Discover EV chargers near you — PineEV" },
      {
        property: "og:description",
        content: "Live availability, real pricing and instant slot reservations on the PineEV network.",
      },
    ],
  }),
  component: DiscoverPage,
});

function DiscoverPage() {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("All");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["properties"],
    queryFn: () => listProperties(),
  });

  const properties = (data ?? []) as Property[];

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = properties.filter((p) => {
      if (!matchesFilter(p, filter)) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q)
      );
    });
    if (!userLocation) return list;
    return [...list].sort(
      (a, b) =>
        distanceKm(userLocation, { lat: a.latitude, lng: a.longitude }) -
        distanceKm(userLocation, { lat: b.latitude, lng: b.longitude }),
    );
  }, [properties, query, filter, userLocation]);

  const locate = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) =>
      setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
    );
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <SiteHeader />

      <main className="mx-auto w-full max-w-7xl pad-x pt-6 md:pt-28">
        <h1 className="font-display text-3xl font-bold tracking-tight">{t("discover.title")}</h1>

        <div className="mt-4 flex items-center gap-2 rounded-full border border-border bg-card px-4 elev-1">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={locate}
            placeholder={t("discover.search")}
            className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>

        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map((item) => (
            <FilterChip key={item} active={filter === item} onClick={() => setFilter(item)}>
              {item}
            </FilterChip>
          ))}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
          <section>
            <p className="text-sm text-muted-foreground">
              {isLoading ? t("common.loading") : `${results.length} ${t("discover.results")}`}
            </p>

            {!isLoading && results.length === 0 ? (
              <p className="mt-10 text-center text-sm text-muted-foreground">
                {t("discover.empty")}
              </p>
            ) : (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {results.map((property) => (
                  <ChargingPointCard
                    key={property.id}
                    property={property}
                    distanceKm={
                      userLocation
                        ? distanceKm(userLocation, {
                            lat: property.latitude,
                            lng: property.longitude,
                          })
                        : null
                    }
                  />
                ))}
              </div>
            )}
          </section>

          <aside className="hidden lg:block">
            <div className="sticky top-28 overflow-hidden rounded-2xl border border-border bg-card elev-2">
              <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                <span className="pulse-dot" />
                <span className="text-sm font-semibold">{t("discover.map")}</span>
              </div>
              <MapPanel
                properties={results}
                userLocation={userLocation}
                colorFor={bookingStateColor}
                fitPoints={results.map((p) => ({ lat: p.latitude, lng: p.longitude }))}
                fitKey={String(results.length)}
                className="h-[560px] w-full"
              />
            </div>
          </aside>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
