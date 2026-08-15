import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Zap, Clock, IndianRupee, CheckCircle2 } from "lucide-react";
import { listMyBookings } from "@/lib/booking.functions";
import { ProgressRing } from "@/components/ProgressRing";
import { LusionButton } from "@/components/LusionButton";
import { SiteHeader } from "@/components/SiteHeader";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/session/$id")({
  head: () => ({
    meta: [
      { title: "Live charging session — PineEV" },
      {
        name: "description",
        content:
          "Track energy delivered, elapsed time and running cost for your active PineEV charging session in real time.",
      },
      { property: "og:title", content: "Live charging session — PineEV" },
      {
        property: "og:description",
        content: "Live progress, energy delivered and running cost for your PineEV session.",
      },
    ],
  }),
  component: SessionPage,
});

const TARGET_KWH = 24;
const RATE_PER_KWH = 18;

function SessionPage() {
  const { id } = Route.useParams();
  const { t } = useI18n();
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(true);

  const { data } = useQuery({ queryKey: ["my-bookings"], queryFn: () => listMyBookings() });
  const booking = (data ?? []).find((b) => b.id === id);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(timer);
  }, [running]);

  const delivered = Math.min(TARGET_KWH, +(seconds * 0.06).toFixed(2));
  const percent = Math.round((delivered / TARGET_KWH) * 100);
  const cost = Math.round(delivered * RATE_PER_KWH);
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  const complete = !running || percent >= 100;

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0">
      <SiteHeader />

      <main className="mx-auto w-full max-w-xl pad-x pt-8 md:pt-28">
        <div className="flex items-center gap-2">
          <span className={complete ? "" : "pulse-dot"} />
          <h1 className="font-display text-2xl font-bold tracking-tight">
            {complete ? t("session.done") : t("session.title")}
          </h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {booking?.booking_ref ? `#${booking.booking_ref}` : t("common.loading")}
        </p>

        <section className="mt-6 flex flex-col items-center rounded-2xl border border-border bg-card card-pad elev-3">
          <ProgressRing
            progress={percent / 100}
            size={220}
            value={`${percent}%`}
            sub={`${delivered.toFixed(1)} kWh`}
          />

          <div className="mt-6 grid w-full grid-cols-3 gap-3">
            <Stat icon={Zap} label={t("session.delivered")} value={`${delivered.toFixed(1)} kWh`} />
            <Stat icon={Clock} label={t("session.elapsed")} value={`${mm}:${ss}`} />
            <Stat icon={IndianRupee} label={t("session.cost")} value={`₹${cost}`} />
          </div>

          <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full bg-energy ${complete ? "" : "energy-flow"}`}
              style={{ width: `${Math.max(4, percent)}%` }}
            />
          </div>
        </section>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          {complete ? (
            <>
              <span className="inline-flex items-center gap-2 rounded-full bg-primary-container px-4 py-2 text-sm font-semibold text-primary">
                <CheckCircle2 className="size-4" />
                {t("session.done")}
              </span>
              <Link
                to="/bookings"
                className="inline-flex h-12 items-center rounded-full border border-border px-5 text-sm font-semibold"
              >
                {t("session.receipt")}
              </Link>
              <LusionButton to="/" variant="primary" className="h-12">
                {t("session.home")}
              </LusionButton>
            </>
          ) : (
            <LusionButton className="h-12" onClick={() => setRunning(false)}>
              {t("session.stop")}
            </LusionButton>
          )}
        </div>
      </main>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Zap;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-muted px-3 py-3 text-center">
      <Icon className="mx-auto size-4 text-primary" />
      <p className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="font-display text-sm font-bold">{value}</p>
    </div>
  );
}
