import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useState } from "react";
import {
  Search,
  Zap,
  ShieldCheck,
  Clock,
  MapPin,
  Star,
  ArrowRight,
  ChevronDown,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { MapPanel } from "@/components/MapPanel";
import { SiteFooter } from "@/components/SiteFooter";
import { AmbientBackground } from "@/components/AmbientBackground";
import { Button } from "@/components/ui/button";
import { LusionButton } from "@/components/ui/LusionButton";
import { RollText } from "@/components/ui/RollText";
import { listProperties } from "@/lib/catalog.functions";
import {
  chargerSummary,
  formatPrice,
  statusClasses,
  statusLabel,
  type Property,
} from "@/lib/pineev";

const propertiesQuery = queryOptions({
  queryKey: ["properties"],
  queryFn: () => listProperties() as Promise<Property[]>,
});

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PineEV — Find it. Reserve it. Charge it." },
      {
        name: "description",
        content:
          "PineEV connects EV drivers with verified hotels, cafés, dhabas and offices to reserve parking and charging in seconds.",
      },
      { property: "og:title", content: "PineEV — Find it. Reserve it. Charge it." },
      {
        property: "og:description",
        content:
          "Reserve verified EV parking and charging at trusted commercial properties on a live map.",
      },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(propertiesQuery);
  },
  component: Landing,
});

const STEPS = [
  {
    icon: Search,
    title: "Find it",
    body: "Open the live map and see verified charging spots near you with real-time availability.",
  },
  {
    icon: Clock,
    title: "Reserve it",
    body: "Pick a charger and a time slot. Your bay is held for you — no queues, no guessing.",
  },
  {
    icon: Zap,
    title: "Charge it",
    body: "Scan your booking QR at the property, plug in and top up while you eat or work.",
  },
];

/** CTA row: Find a charger  ·  or  ·  List your property (with roll-text on hover) */
function ListPropertyCTA() {
  const [btnHovered, setBtnHovered] = useState(false);

  return (
    <div className="mt-7 flex flex-wrap items-center gap-4">
      <LusionButton to="/find" variant="accent">
        <MapPin className="mr-2 size-4" />
        Find a charger
      </LusionButton>
      <span className="text-sm font-medium text-muted-foreground">or</span>
      {/* outer div owns the hover so the full pill triggers the roll */}
      <div
        onMouseEnter={() => setBtnHovered(true)}
        onMouseLeave={() => setBtnHovered(false)}
        className="flex"
      >
        <Link to="/partner" className="flex">
          <Button
            size="lg"
            className="rounded-full px-6 h-14 shadow-float overflow-hidden pointer-events-none"
            tabIndex={-1}
          >
            <RollText
              from="List your property"
              to="Start earning now"
              hovered={btnHovered}
              charDelay={25}
            />
          </Button>
        </Link>
      </div>
    </div>
  );
}

function Landing() {
  const { data: properties } = useSuspenseQuery(propertiesQuery);
  const featured = properties.slice(0, 6);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <AmbientBackground />
          <div className="mx-auto grid w-full max-w-6xl items-center gap-10 pad-x section-y md:grid-cols-2">
            <div className="animate-rise">
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground shadow-soft">
                <span className="size-2 rounded-full bg-primary" />
                {properties.length}+ verified charging destinations
              </span>
              <h1 className="mt-5 text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
                Find it.
                <br />
                Reserve it.
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {" "}
                  Charge it.
                </span>
              </h1>
              <p className="mt-5 max-w-md text-base text-muted-foreground sm:text-lg">
                PineEV connects EV drivers with verified commercial properties — hotels, cafés,
                dhabas and offices — to reserve parking and charging in a few taps.
              </p>
              <ListPropertyCTA />
              <dl className="mt-9 grid max-w-md grid-cols-3 gap-4">
                {[
                  ["4.8★", "Avg. rating"],
                  ["60s", "To reserve"],
                  ["100%", "Verified hosts"],
                ].map(([value, label]) => (
                  <div key={label}>
                    <dt className="font-display text-xl font-bold">{value}</dt>
                    <dd className="text-xs text-muted-foreground">{label}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="animate-rise">
              <div className="group relative block overflow-hidden rounded-4xl border border-border bg-card shadow-float">
                <div className="aspect-[4/5] w-full sm:aspect-[5/4]">
                  <MapPanel
                    properties={properties}
                    cluster
                    interactive={false}
                    zoom={5}
                    className="size-full"
                    fitPoints={properties.map((p) => ({
                      lat: Number(p.latitude),
                      lng: Number(p.longitude),
                    }))}
                    fitKey={`landing-${properties.length}`}
                  />
                </div>
                <div className="pointer-events-none absolute inset-x-4 bottom-4 rounded-3xl border border-border/70 bg-card/90 p-4 backdrop-blur-xl">
                  <p className="text-xs font-semibold text-primary">
                    {properties.length} registered hosts live
                  </p>
                  <p className="mt-1 font-display text-base font-bold">
                    {featured[0]?.name ?? "Verified charging host"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {featured[0] ? chargerSummary(featured[0]) : "60kW DC"} ·{" "}
                    {featured[0] ? formatPrice(featured[0].price) : "₹18/kWh"}
                  </p>
                </div>
                <Link
                  to="/find"
                  aria-label="Open the live charger map"
                  className="absolute inset-0"
                />
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="flex justify-center pb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500 fill-mode-both">
            <button
              onClick={() => window.scrollBy({ top: window.innerHeight * 0.8, behavior: "smooth" })}
              className="group flex flex-col items-center gap-2 text-muted-foreground transition-colors hover:text-primary"
            >
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-80 group-hover:opacity-100 transition-opacity">
                Explore
              </span>
              <ChevronDown className="size-4 animate-bounce opacity-80 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>
        </section>

        {/* How it works */}
        <section className="border-y border-border bg-surface">
          <div className="mx-auto w-full max-w-6xl pad-x section-y">
            <h2 className="text-center text-3xl font-bold tracking-tight">How PineEV works</h2>
            <p className="mx-auto mt-3 max-w-lg text-center text-sm text-muted-foreground">
              Three taps between you and a guaranteed charging bay.
            </p>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {STEPS.map((step, index) => (
                <div
                  key={step.title}
                  className="rounded-3xl border border-border bg-card p-6 shadow-soft"
                >
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <step.icon className="size-5" />
                  </div>
                  <p className="mt-4 text-xs font-semibold text-muted-foreground">
                    Step {index + 1}
                  </p>
                  <h3 className="mt-1 text-lg font-bold">{step.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured */}
        <section className="mx-auto w-full max-w-6xl pad-x section-y">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Popular destinations</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Verified hosts drivers keep coming back to.
              </p>
            </div>
            <Link
              to="/find"
              className="hidden items-center gap-1.5 text-sm font-semibold text-primary sm:inline-flex"
            >
              View map <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((property) => (
              <Link
                key={property.id}
                to="/property/$id"
                params={{ id: property.id }}
                className="group overflow-hidden rounded-3xl border border-border bg-card shadow-soft transition-shadow hover:shadow-float"
              >
                <div className="aspect-[16/10] overflow-hidden bg-surface">
                  {property.images?.[0] ? (
                    <img
                      src={property.images[0]}
                      alt={property.name}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : null}
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusClasses(property.status)}`}
                    >
                      {statusLabel(property.status)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold">
                      <Star className="size-3.5 fill-warning text-warning" />
                      {Number(property.rating).toFixed(1)}
                    </span>
                  </div>
                  <h3 className="mt-3 font-display text-base font-bold">{property.name}</h3>
                  <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                    {property.address}
                  </p>
                  <div className="mt-4 flex items-center justify-between text-xs">
                    <span className="font-semibold text-primary">{chargerSummary(property)}</span>
                    <span className="font-semibold">{formatPrice(property.price)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Partner CTA */}
        <section className="mx-auto w-full max-w-6xl pad-x pb-14 md:pb-20">
          <div className="overflow-hidden rounded-4xl bg-gradient-to-br from-primary to-accent p-8 text-primary-foreground shadow-float sm:p-12">
            <div className="max-w-xl">
              <ShieldCheck className="size-8" />
              <h2 className="mt-4 text-3xl font-bold tracking-tight">
                Turn your parking into revenue
              </h2>
              <p className="mt-3 text-sm opacity-90">
                Hotels, restaurants, dhabas and offices earn from every session while EV drivers
                discover your business. Onboarding takes minutes.
              </p>
              <Link to="/partner" className="mt-6 inline-block">
                <Button size="lg" variant="secondary" className="rounded-full px-6">
                  Become a partner
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
