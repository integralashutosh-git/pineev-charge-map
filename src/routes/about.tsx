import { createFileRoute, Link } from "@tanstack/react-router";
import { Target, Leaf, MapPinned, HeartHandshake } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About PineEV — verified EV charging, reserved in advance" },
      {
        name: "description",
        content:
          "PineEV's mission is to connect EV drivers with verified commercial properties so charging is planned, not improvised.",
      },
      { property: "og:title", content: "About PineEV" },
      {
        property: "og:description",
        content: "Why we are building a reservation-first EV charging network.",
      },
    ],
  }),
  component: AboutPage,
});

const VALUES = [
  {
    icon: Target,
    title: "Certainty first",
    body: "A charging stop should never be a gamble. Every PineEV slot is reserved before you drive.",
  },
  {
    icon: MapPinned,
    title: "Map-native",
    body: "The map is the product. No dashboards to learn, no clutter — just what's around you.",
  },
  {
    icon: HeartHandshake,
    title: "Verified hosts",
    body: "Every property is checked for safe parking, working chargers and honest pricing.",
  },
  {
    icon: Leaf,
    title: "Built for the switch",
    body: "Better charging access is the fastest way to get more people into electric vehicles.",
  },
];

function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto w-full max-w-4xl pad-x section-y">
          <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            We're making EV charging{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              predictable
            </span>
          </h1>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
            PineEV connects EV drivers with verified commercial properties to reserve parking and
            charging. Hotels, dhabas, cafés and offices already have the two things drivers need —
            space and power. We turn them into a dependable charging network with a single tap
            reservation flow.
          </p>

          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            {VALUES.map((item) => (
              <div key={item.title} className="rounded-3xl border border-border bg-card p-6 shadow-soft">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                  <item.icon className="size-5" />
                </div>
                <h2 className="mt-4 text-lg font-bold">{item.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-4xl border border-border bg-surface p-8">
            <h2 className="text-2xl font-bold tracking-tight">Our mission</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Connect EV drivers with verified commercial properties to reserve parking and
              charging — so range anxiety becomes a planning problem we solve for you, not a risk
              you carry on every trip.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/find">
                <Button className="rounded-full">Find a charger</Button>
              </Link>
              <Link to="/partner">
                <Button variant="outline" className="rounded-full">
                  Partner with us
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
