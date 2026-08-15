import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Star, Zap, IndianRupee, Navigation, UserRound } from "lucide-react";
import { getPropertyDetail } from "@/lib/catalog.functions";
import { directionsUrl, type Charger, type Property } from "@/lib/pineev";
import { StatusIndicator } from "@/components/StatusIndicator";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { MapPanel } from "@/components/MapPanel";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/charging-point/$id")({
  head: () => ({
    meta: [
      { title: "Charging point details — PineEV" },
      {
        name: "description",
        content:
          "See connectors, power output, per-kWh pricing, amenities and host details for this PineEV charging point, then reserve a slot.",
      },
      { property: "og:title", content: "Charging point details — PineEV" },
      {
        property: "og:description",
        content: "Connectors, power, pricing and amenities for this verified PineEV host.",
      },
    ],
  }),
  component: ChargingPointPage,
});

const REVIEWS = [
  { name: "Aarti S.", rating: 5, text: "Clean bay, host helped me plug in. Charged 60% in 40 minutes." },
  { name: "Rohit M.", rating: 4, text: "Easy to find, cafe right next door while waiting." },
  { name: "Imran K.", rating: 5, text: "Best stop on this highway. Will book again." },
];

function ChargingPointPage() {
  const { id } = Route.useParams();
  const { t } = useI18n();

  const { data, isLoading } = useQuery({
    queryKey: ["property", id],
    queryFn: () => getPropertyDetail({ data: { id } }),
  });

  if (!isLoading && data && !data.property) throw notFound();

  const property = data?.property as Property | null | undefined;
  const chargers = (data?.chargers ?? []) as Charger[];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <SiteHeader />

      <div className="relative h-56 overflow-hidden md:h-72">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(135deg, color-mix(in oklch, var(--amber) 60%, transparent) 0%, var(--primary) 75%)",
          }}
        />
        <span className="orb left-[-10%] top-[-30%] size-64" />
        <div className="relative flex h-full flex-col justify-between pad-x py-4 md:pt-28">
          <Link
            to="/discover"
            className="inline-flex size-10 items-center justify-center rounded-full bg-card/85 text-foreground backdrop-blur"
            aria-label={t("common.back")}
          >
            <ArrowLeft className="size-5" />
          </Link>
          {property ? <StatusIndicator status={property.status} className="self-start" /> : null}
        </div>
      </div>

      <main className="mx-auto -mt-8 w-full max-w-5xl pad-x">
        {isLoading || !property ? (
          <p className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground elev-2">
            {t("common.loading")}
          </p>
        ) : (
          <>
            <section className="rounded-2xl border border-border bg-card card-pad elev-2">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h1 className="font-display text-2xl font-bold tracking-tight">
                    {property.name}
                  </h1>
                  <p className="mt-1 text-sm text-muted-foreground">{property.address}</p>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-muted px-3 py-2">
                  <Star className="size-4 fill-amber text-amber" />
                  <span className="font-semibold">{Number(property.rating).toFixed(1)}</span>
                  <span className="text-xs text-muted-foreground">({REVIEWS.length})</span>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-primary-container px-3 py-1 text-xs font-semibold text-primary">
                  {property.charger_type}
                </span>
                <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                  {property.power_kw} kW
                </span>
                <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                  ₹{Number(property.price).toFixed(0)} {t("common.perKwh")}
                </span>
              </div>

              <a
                href={directionsUrl(property.latitude, property.longitude)}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground elev-2"
              >
                <Navigation className="size-4" />
                {t("detail.directions")}
              </a>
            </section>

            <section className="mt-4 flex items-center gap-3 rounded-2xl border border-border bg-card card-pad elev-1">
              <span className="flex size-11 items-center justify-center rounded-full bg-primary-container text-primary">
                <UserRound className="size-5" />
              </span>
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  {t("detail.host")}
                </p>
                <p className="font-semibold">{property.name} · {property.city}</p>
              </div>
            </section>

            <section className="mt-6">
              <h2 className="font-display text-lg font-semibold">{t("detail.chargers")}</h2>
              <div className="mt-3 grid gap-3">
                {chargers.map((charger) => (
                  <div
                    key={charger.id}
                    className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card card-pad elev-1"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{charger.label}</p>
                      <p className="text-sm text-muted-foreground">
                        {charger.connector_type} · {charger.charger_type}
                      </p>
                    </div>
                    <span className="flex items-center gap-1 text-sm font-semibold">
                      <Zap className="size-4 text-energy" />
                      {charger.power_kw} kW
                    </span>
                    <span className="flex items-center text-sm font-semibold">
                      <IndianRupee className="size-3.5" />
                      {Number(charger.price).toFixed(0)}
                    </span>
                    <StatusIndicator status={charger.status} />
                    <Link
                      to="/book/$chargerId"
                      params={{ chargerId: charger.id }}
                      className="inline-flex h-10 items-center rounded-full bg-amber px-4 text-sm font-semibold text-amber-foreground elev-1"
                    >
                      {t("detail.book")}
                    </Link>
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-6 overflow-hidden rounded-2xl border border-border bg-card elev-1">
              <MapPanel
                properties={[property]}
                selectedId={property.id}
                focus={{ lat: property.latitude, lng: property.longitude }}
                zoom={15}
                className="h-64 w-full"
              />
            </section>

            <section className="mt-6">
              <h2 className="font-display text-lg font-semibold">{t("detail.amenities")}</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {property.amenities.map((amenity) => (
                  <span
                    key={amenity}
                    className="rounded-full border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </section>

            <section className="mt-6">
              <h2 className="font-display text-lg font-semibold">{t("detail.about")}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {property.description}
              </p>
            </section>

            <section className="mt-6">
              <h2 className="font-display text-lg font-semibold">{t("detail.reviews")}</h2>
              <div className="mt-3 grid gap-3">
                {REVIEWS.map((review) => (
                  <div
                    key={review.name}
                    className="rounded-2xl border border-border bg-card card-pad elev-1"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">{review.name}</p>
                      <span className="flex items-center gap-1 text-sm">
                        <Star className="size-3.5 fill-amber text-amber" />
                        {review.rating}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{review.text}</p>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
