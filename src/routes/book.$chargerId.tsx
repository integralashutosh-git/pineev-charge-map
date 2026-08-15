import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Check, CreditCard, Smartphone, Zap } from "lucide-react";
import { getChargerDetail } from "@/lib/catalog.functions";
import { createBooking, getTakenSlots } from "@/lib/booking.functions";
import { TIME_SLOTS, type Charger, type Property } from "@/lib/pineev";
import { VEHICLES } from "@/lib/vehicles";
import { LusionButton } from "@/components/LusionButton";
import { SiteHeader } from "@/components/SiteHeader";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/book/$chargerId")({
  head: () => ({
    meta: [
      { title: "Reserve your charging slot — PineEV" },
      {
        name: "description",
        content:
          "Pick your vehicle, choose a date and time slot, and confirm your PineEV charging reservation in a few taps.",
      },
      { property: "og:title", content: "Reserve your charging slot — PineEV" },
      {
        property: "og:description",
        content: "A three-step reservation flow for verified PineEV charging points.",
      },
    ],
  }),
  component: BookPage,
});

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function nextDays(count: number) {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().slice(0, 10);
  });
}

function BookPage() {
  const { chargerId } = Route.useParams();
  const { t } = useI18n();
  const navigate = useNavigate();
  const { user } = useAuth();
  const submitBooking = useServerFn(createBooking);

  const [step, setStep] = useState(0);
  const [vehicleId, setVehicleId] = useState(VEHICLES[0]!.id);
  const [date, setDate] = useState(todayISO());
  const [slot, setSlot] = useState<string | null>(null);
  const [method, setMethod] = useState<"upi" | "card">("upi");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data } = useQuery({
    queryKey: ["charger", chargerId],
    queryFn: () => getChargerDetail({ data: { chargerId } }),
  });
  const charger = data?.charger as Charger | null | undefined;
  const property = data?.property as Property | null | undefined;

  const { data: taken } = useQuery({
    queryKey: ["taken-slots", chargerId, date],
    queryFn: () => getTakenSlots({ data: { chargerId, date } }),
  });
  const takenSlots = taken ?? [];

  const vehicle = VEHICLES.find((v) => v.id === vehicleId)!;
  const estimate = useMemo(() => {
    if (!charger) return { kwh: 0, amount: 0 };
    const kwh = Math.round(charger.power_kw * 0.7);
    return { kwh, amount: Math.round(Number(charger.price) * kwh) };
  }, [charger]);

  const steps = [t("book.step1"), t("book.step2"), t("book.step3")];

  const confirm = async () => {
    if (!charger || !property || !slot) return;
    if (!user) {
      void navigate({ to: "/auth" });
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const booking = await submitBooking({
        data: {
          propertyId: property.id,
          chargerId: charger.id,
          date,
          timeSlot: slot,
          paymentMethod: method,
        },
      });
      void navigate({ to: "/session/$id", params: { id: booking.id } });
    } catch (e) {
      setError(e instanceof Error ? e.message : t("common.error"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-28 md:pb-0">
      <SiteHeader />

      <main className="mx-auto w-full max-w-2xl pad-x pt-6 md:pt-28">
        <div className="flex items-center gap-3">
          {property ? (
            <Link
              to="/charging-point/$id"
              params={{ id: property.id }}
              className="inline-flex size-10 items-center justify-center rounded-full border border-border bg-card"
              aria-label={t("common.back")}
            >
              <ArrowLeft className="size-5" />
            </Link>
          ) : null}
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">{t("book.title")}</h1>
            <p className="text-sm text-muted-foreground">
              {property ? `${property.name} · ${charger?.label ?? ""}` : t("common.loading")}
            </p>
          </div>
        </div>

        <ol className="mt-6 flex items-center gap-2">
          {steps.map((label, index) => (
            <li key={label} className="flex flex-1 items-center gap-2">
              <span
                className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  index <= step
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {index < step ? <Check className="size-3.5" /> : index + 1}
              </span>
              <span className="hidden text-xs font-medium text-muted-foreground sm:block">
                {label}
              </span>
              {index < steps.length - 1 ? <span className="h-px flex-1 bg-border" /> : null}
            </li>
          ))}
        </ol>

        <section className="mt-6 rounded-2xl border border-border bg-card card-pad elev-2">
          {step === 0 ? (
            <div className="grid gap-3">
              <h2 className="font-display text-lg font-semibold">{t("book.step1")}</h2>
              {VEHICLES.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setVehicleId(v.id)}
                  className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors ${
                    vehicleId === v.id
                      ? "border-primary bg-primary-container"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  <span>
                    <span className="block font-semibold">
                      {v.make} {v.model}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {v.batteryKwh} kWh · {v.connector}
                    </span>
                  </span>
                  {vehicleId === v.id ? <Check className="size-4 text-primary" /> : null}
                </button>
              ))}
            </div>
          ) : null}

          {step === 1 ? (
            <div>
              <h2 className="font-display text-lg font-semibold">{t("book.step2")}</h2>
              <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
                {nextDays(7).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => {
                      setDate(d);
                      setSlot(null);
                    }}
                    className={`shrink-0 rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${
                      date === d
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    {new Date(d).toLocaleDateString(undefined, {
                      weekday: "short",
                      day: "numeric",
                    })}
                  </button>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
                {TIME_SLOTS.map((s) => {
                  const isTaken = takenSlots.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      disabled={isTaken}
                      onClick={() => setSlot(s)}
                      className={`rounded-xl border px-2 py-2 text-xs font-semibold transition-colors ${
                        isTaken
                          ? "border-border bg-muted text-muted-foreground/50 line-through"
                          : slot === s
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border hover:bg-muted"
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div>
              <h2 className="font-display text-lg font-semibold">{t("book.step3")}</h2>
              <dl className="mt-3 grid gap-2 text-sm">
                <Row label={t("book.vehicle")} value={`${vehicle.make} ${vehicle.model}`} />
                <Row label={t("book.when")} value={`${date} · ${slot ?? "—"}`} />
                <Row
                  label={t("book.energy")}
                  value={`≈ ${estimate.kwh} kWh @ ₹${Number(charger?.price ?? 0).toFixed(0)}`}
                />
                <Row label={t("book.total")} value={`₹${estimate.amount}`} strong />
              </dl>

              <div className="mt-4 grid grid-cols-2 gap-2">
                {(
                  [
                    { id: "upi" as const, label: "UPI", icon: Smartphone },
                    { id: "card" as const, label: "Card", icon: CreditCard },
                  ]
                ).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMethod(m.id)}
                    className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${
                      method === m.id
                        ? "border-primary bg-primary-container text-primary"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    <m.icon className="size-4" />
                    {m.label}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{t("book.simulated")}</p>
              {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
            </div>
          ) : null}
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-14 z-40 border-t border-border bg-card/95 pad-x py-3 backdrop-blur-xl md:bottom-0">
        <div className="mx-auto flex w-full max-w-2xl items-center gap-3">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="h-12 rounded-full border border-border px-5 text-sm font-semibold"
            >
              {t("common.back")}
            </button>
          ) : null}
          <div className="ml-auto flex items-center gap-3">
            <span className="flex items-center gap-1 text-sm font-semibold">
              <Zap className="size-4 text-energy" />₹{estimate.amount}
            </span>
            {step < 2 ? (
              <LusionButton
                className="h-12 px-6"
                disabled={step === 1 && !slot}
                onClick={() => setStep((s) => s + 1)}
              >
                {t("common.continue")}
              </LusionButton>
            ) : (
              <LusionButton className="h-12 px-6" disabled={busy || !slot} onClick={() => void confirm()}>
                {busy ? t("common.loading") : t("book.pay")}
              </LusionButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-border pb-2 last:border-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={strong ? "font-display text-lg font-bold" : "font-medium"}>{value}</dd>
    </div>
  );
}
