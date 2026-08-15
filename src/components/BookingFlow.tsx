import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Check, Zap, CreditCard, Smartphone, Loader2, PartyPopper } from "lucide-react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { createBooking, getTakenSlots } from "@/lib/booking.functions";
import {
  TIME_SLOTS,
  estimatedAmount,
  formatINR,
  formatPrice,
  statusClasses,
  statusLabel,
  type Charger,
  type Property,
} from "@/lib/pineev";

function nextDays(count: number) {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      value: d.toISOString().slice(0, 10),
      weekday: d.toLocaleDateString("en-IN", { weekday: "short" }),
      day: d.getDate(),
      month: d.toLocaleDateString("en-IN", { month: "short" }),
    };
  });
}

interface BookingFlowProps {
  property: Property;
  chargers: Charger[];
}

export function BookingFlow({ property, chargers }: BookingFlowProps) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const days = useMemo(() => nextDays(7), []);

  const usable = chargers.filter((c) => c.status !== "offline");
  const [chargerId, setChargerId] = useState<string>(usable[0]?.id ?? "");
  const [date, setDate] = useState<string>(days[0]!.value);
  const [slot, setSlot] = useState<string | null>(null);
  const [method, setMethod] = useState<"upi" | "card">("upi");
  const [qr, setQr] = useState<string | null>(null);

  const charger = chargers.find((c) => c.id === chargerId) ?? null;
  const amount = charger
    ? estimatedAmount(Number(charger.price), Number(charger.power_kw))
    : estimatedAmount(Number(property.price), Number(property.power_kw));

  const takenSlotsFn = useServerFn(getTakenSlots);
  const { data: taken = [] } = useQuery({
    queryKey: ["taken-slots", chargerId, date],
    queryFn: () => takenSlotsFn({ data: { chargerId, date } }) as Promise<string[]>,
    enabled: Boolean(chargerId && date),
  });

  const createBookingFn = useServerFn(createBooking);
  const booking = useMutation({
    mutationFn: () =>
      createBookingFn({
        data: { propertyId: property.id, chargerId, date, timeSlot: slot!, paymentMethod: method },
      }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["taken-slots"] });
      queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
      void QRCode.toDataURL(`PINEEV:${result.booking_ref}`, {
        width: 320,
        margin: 1,
        color: { dark: "#111827", light: "#ffffff" },
      }).then(setQr);
    },
  });

  useEffect(() => {
    setSlot(null);
  }, [chargerId, date]);

  if (booking.data) {
    const result = booking.data;
    return (
      <div className="rounded-4xl border border-border bg-card p-6 text-center shadow-float sm:p-10">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <PartyPopper className="size-7" />
        </div>
        <h2 className="mt-4 text-2xl font-bold tracking-tight">Slot reserved</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Show this QR at {property.name} to start charging.
        </p>
        {qr ? (
          <img
            src={qr}
            alt={`Booking QR for ${result.booking_ref}`}
            className="mx-auto mt-6 size-44 rounded-3xl border border-border bg-white p-2"
          />
        ) : (
          <div className="mx-auto mt-6 size-44 animate-pulse rounded-3xl bg-surface" />
        )}
        <p className="mt-4 font-display text-lg font-bold tracking-wide">{result.booking_ref}</p>
        <dl className="mx-auto mt-5 max-w-xs space-y-2 text-sm">
          {[
            ["Date", new Date(result.booking_date).toLocaleDateString("en-IN", { dateStyle: "medium" })],
            ["Time", result.time_slot],
            ["Paid", formatINR(Number(result.amount))],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4">
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-7 flex flex-wrap justify-center gap-2">
          <Link to="/bookings">
            <Button className="rounded-full">My bookings</Button>
          </Link>
          <Link to="/find">
            <Button variant="outline" className="rounded-full">
              Back to map
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-4xl border border-border bg-card p-5 shadow-float sm:p-7">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold">Reserve your bay</h2>
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusClasses(property.status)}`}>
          {statusLabel(property.status)}
        </span>
      </div>

      {/* Chargers */}
      <p className="mt-5 text-xs font-semibold text-muted-foreground">1 · Pick a charger</p>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {chargers.map((item) => {
          const offline = item.status === "offline";
          const active = item.id === chargerId;
          return (
            <button
              key={item.id}
              type="button"
              disabled={offline}
              onClick={() => setChargerId(item.id)}
              className={`flex items-center gap-3 rounded-2xl border p-3.5 text-left transition-colors disabled:opacity-50 ${
                active ? "border-primary bg-primary/5" : "border-border hover:bg-surface"
              }`}
            >
              <span className="flex size-9 items-center justify-center rounded-xl bg-secondary text-primary">
                <Zap className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold">{item.label}</span>
                <span className="block text-xs text-muted-foreground">
                  {item.power_kw}kW {item.charger_type} · {item.connector_type} ·{" "}
                  {formatPrice(Number(item.price))}
                </span>
              </span>
              {active ? <Check className="size-4 text-primary" /> : null}
            </button>
          );
        })}
        {chargers.length === 0 ? (
          <p className="text-sm text-muted-foreground">No chargers listed yet.</p>
        ) : null}
      </div>

      {/* Date */}
      <p className="mt-6 text-xs font-semibold text-muted-foreground">2 · Choose a day</p>
      <div className="mt-2 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {days.map((day) => (
          <button
            key={day.value}
            type="button"
            onClick={() => setDate(day.value)}
            className={`shrink-0 rounded-2xl border px-4 py-2.5 text-center transition-colors ${
              date === day.value ? "border-primary bg-primary text-primary-foreground" : "border-border"
            }`}
          >
            <span className="block text-[11px] font-semibold opacity-80">{day.weekday}</span>
            <span className="block text-base font-bold leading-tight">{day.day}</span>
            <span className="block text-[11px] opacity-80">{day.month}</span>
          </button>
        ))}
      </div>

      {/* Slots */}
      <p className="mt-6 text-xs font-semibold text-muted-foreground">3 · Pick a time slot</p>
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {TIME_SLOTS.map((item) => {
          const isTaken = taken.includes(item);
          return (
            <button
              key={item}
              type="button"
              disabled={isTaken}
              onClick={() => setSlot(item)}
              className={`rounded-2xl border px-2 py-2.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:line-through ${
                slot === item ? "border-primary bg-primary text-primary-foreground" : "border-border"
              }`}
            >
              {item}
            </button>
          );
        })}
      </div>

      {/* Payment */}
      <p className="mt-6 text-xs font-semibold text-muted-foreground">4 · Payment (simulated)</p>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {[
          { id: "upi" as const, label: "UPI", hint: "Pay instantly via any UPI app", icon: Smartphone },
          { id: "card" as const, label: "Card", hint: "Visa, Mastercard, RuPay", icon: CreditCard },
        ].map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setMethod(option.id)}
            className={`flex items-center gap-3 rounded-2xl border p-3.5 text-left transition-colors ${
              method === option.id ? "border-accent bg-accent/5" : "border-border hover:bg-surface"
            }`}
          >
            <span className="flex size-9 items-center justify-center rounded-xl bg-secondary text-accent">
              <option.icon className="size-4" />
            </span>
            <span>
              <span className="block text-sm font-bold">{option.label}</span>
              <span className="block text-xs text-muted-foreground">{option.hint}</span>
            </span>
          </button>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 rounded-3xl bg-surface p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Estimated session total</span>
          <span className="font-display text-xl font-bold">{formatINR(amount)}</span>
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">
          Based on a 1-hour session. Final amount is settled at the property.
        </p>
      </div>

      {booking.isError ? (
        <p className="mt-3 rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {(booking.error as Error).message}
        </p>
      ) : null}

      <div className="mt-4">
        {loading ? (
          <Button disabled className="w-full rounded-full" size="lg">
            <Loader2 className="mr-2 size-4 animate-spin" />
            Checking session
          </Button>
        ) : !user ? (
          <Button
            size="lg"
            className="w-full rounded-full"
            onClick={() =>
              navigate({
                to: "/auth",
                search: { redirect: `/property/${property.id}` },
              })
            }
          >
            Sign in to reserve
          </Button>
        ) : (
          <Button
            size="lg"
            className="w-full rounded-full shadow-float"
            disabled={!slot || !chargerId || booking.isPending}
            onClick={() => booking.mutate()}
          >
            {booking.isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Confirming payment…
              </>
            ) : (
              <>Pay {formatINR(amount)} & reserve</>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
