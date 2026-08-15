import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { IndianRupee, Zap, CalendarCheck, Gauge } from "lucide-react";
import { getDashboard } from "@/lib/dashboard.functions";
import { LusionButton } from "@/components/LusionButton";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/host")({
  head: () => ({
    meta: [
      { title: "Host a charger and earn — PineEV for properties" },
      {
        name: "description",
        content:
          "List your hotel, mall or dhaba parking on PineEV, set your rate, and earn from every EV charging session with live utilisation insights.",
      },
      { property: "og:title", content: "Host a charger and earn — PineEV for properties" },
      {
        property: "og:description",
        content: "Turn idle parking into recurring EV charging income with PineEV.",
      },
    ],
  }),
  component: HostPage,
});

function HostPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const fetchDashboard = useServerFn(getDashboard);

  const { data } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => fetchDashboard(),
    enabled: Boolean(user),
  });

  const stats = data?.stats;

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <SiteHeader />

      <main className="mx-auto w-full max-w-5xl pad-x pt-8 md:pt-28">
        <section className="relative overflow-hidden rounded-2xl border border-border bg-card card-pad elev-2">
          <span className="orb right-[-15%] top-[-40%] size-72" />
          <div className="relative max-w-xl">
            <h1 className="font-display text-3xl font-bold tracking-tight">{t("host.title")}</h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t("host.body")}</p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <LusionButton to="/partner" className="h-12">
                {t("host.cta")}
              </LusionButton>
              <Link
                to="/dashboard"
                className="inline-flex h-12 items-center rounded-full border border-border px-5 text-sm font-semibold"
              >
                {t("nav.host")} dashboard
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric
            icon={IndianRupee}
            label={t("host.earnings")}
            value={stats ? `₹${stats.monthlyRevenue}` : "₹—"}
          />
          <Metric
            icon={CalendarCheck}
            label={t("host.sessions")}
            value={stats ? String(stats.todaysBookings) : "—"}
          />
          <Metric
            icon={Zap}
            label={t("host.energy")}
            value={stats ? `${stats.activeChargers} live` : "—"}
          />
          <Metric
            icon={Gauge}
            label="Utilisation"
            value={stats ? `${stats.utilization}%` : "—"}
          />
        </section>

        {!user ? (
          <p className="mt-4 text-sm text-muted-foreground">
            <Link to="/auth" className="font-semibold text-primary underline">
              {t("nav.signin")}
            </Link>{" "}
            to see your live host numbers.
          </p>
        ) : null}
      </main>

      <SiteFooter />
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Zap;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card card-pad elev-1">
      <Icon className="size-5 text-primary" />
      <p className="mt-2 text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="font-display text-xl font-bold">{value}</p>
    </div>
  );
}
