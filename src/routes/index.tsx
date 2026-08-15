import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { Search, CalendarCheck, Zap, ReceiptIndianRupee, Plug, ShieldCheck, Languages } from "lucide-react";
import { listProperties } from "@/lib/catalog.functions";
import type { Property } from "@/lib/pineev";
import { AmbientBackground } from "@/components/AmbientBackground";
import { LusionButton } from "@/components/LusionButton";
import { ChargingPointCard } from "@/components/ChargingPointCard";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useI18n, type TranslationKey } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PineEV — Find it. Reserve it. Charge it." },
      {
        name: "description",
        content:
          "PineEV connects EV drivers with verified hotels, malls and businesses hosting chargers across India. Reserve a slot in seconds and charge with confidence.",
      },
      { property: "og:title", content: "PineEV — Find it. Reserve it. Charge it." },
      {
        property: "og:description",
        content: "Live availability, transparent per-kWh pricing and instant reservations on the PineEV network.",
      },
    ],
  }),
  component: LandingPage,
});

const STEPS: { icon: typeof Search; title: TranslationKey; body: TranslationKey }[] = [
  { icon: Search, title: "how.1.title", body: "how.1.body" },
  { icon: CalendarCheck, title: "how.2.title", body: "how.2.body" },
  { icon: Zap, title: "how.3.title", body: "how.3.body" },
  { icon: ReceiptIndianRupee, title: "how.4.title", body: "how.4.body" },
];

const TRUST: { icon: typeof Plug; title: TranslationKey; body: TranslationKey }[] = [
  { icon: Plug, title: "trust.1.title", body: "trust.1.body" },
  { icon: ShieldCheck, title: "trust.2.title", body: "trust.2.body" },
  { icon: Languages, title: "trust.3.title", body: "trust.3.body" },
];

function LandingPage() {
  const { t } = useI18n();
  const { data } = useQuery({ queryKey: ["properties"], queryFn: () => listProperties() });
  const featured = ((data ?? []) as Property[]).slice(0, 4);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <SiteHeader />

      <section className="relative isolate overflow-hidden">
        <AmbientBackground className="absolute inset-0 -z-10" />
        <div className="mx-auto w-full max-w-6xl pad-x pb-16 pt-14 md:pb-24 md:pt-40">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground backdrop-blur"
          >
            <span className="pulse-dot" />
            {t("hero.badge")}
          </motion.span>

          <h1 className="rise-in mt-6 max-w-3xl font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
            {t("hero.title")}
          </h1>
          <p className="rise-in mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
            {t("hero.sub")}
          </p>

          <div className="rise-in mt-8 flex flex-wrap items-center gap-3">
            <LusionButton to="/discover" className="h-13 px-8">
              {t("hero.primary")}
            </LusionButton>
            <LusionButton to="/host" variant="outline" className="h-13 px-8">
              {t("hero.secondary")}
            </LusionButton>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl pad-x section-y">
        <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          {t("how.title")}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">{t("how.sub")}</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: index * 0.06 }}
              className="rounded-2xl border border-border bg-card card-pad elev-1"
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary-container text-primary">
                <step.icon className="size-5" />
              </span>
              <h3 className="mt-3 font-display font-semibold">{t(step.title)}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t(step.body)}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl pad-x pb-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
              {t("preview.title")}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">{t("preview.sub")}</p>
          </div>
          <Link to="/discover" className="text-sm font-semibold text-primary underline">
            {t("preview.all")}
          </Link>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((property) => (
            <ChargingPointCard key={property.id} property={property} distanceKm={null} />
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl pad-x section-y">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card card-pad elev-2">
          <span className="orb right-[-10%] top-[-50%] size-80" />
          <div className="relative grid gap-6 md:grid-cols-2 md:items-center">
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
                {t("host.title")}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t("host.body")}</p>
              <div className="mt-6">
                <LusionButton to="/partner" variant="primary" className="h-12">
                  {t("host.cta")}
                </LusionButton>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {TRUST.map((item) => (
                <div key={item.title} className="rounded-xl bg-muted px-4 py-4">
                  <item.icon className="size-5 text-primary" />
                  <h3 className="mt-2 text-sm font-semibold">{t(item.title)}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{t(item.body)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
