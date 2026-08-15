import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import {
  IndianRupee,
  CalendarCheck,
  Zap,
  Gauge,
  Loader2,
  Plus,
  Building2,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { claimProperty, getDashboard, updateAvailability } from "@/lib/dashboard.functions";
import { CATEGORIES, formatINR, statusClasses, statusLabel } from "@/lib/pineev";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Business dashboard — PineEv partners" },
      {
        name: "description",
        content: "Track bookings, revenue and slot availability for your PineEv charging listings.",
      },
      { property: "og:title", content: "Business dashboard — PineEv" },
      { property: "og:description", content: "Your PineEv partner performance at a glance." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const dashboardFn = useServerFn(getDashboard);
  const claimFn = useServerFn(claimProperty);
  const availabilityFn = useServerFn(updateAvailability);
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => dashboardFn() as Promise<Awaited<ReturnType<typeof getDashboard>>>,
  });

  const availability = useMutation({
    mutationFn: (vars: { propertyId: string; available_slots: number; status: string }) =>
      availabilityFn({ data: vars as never }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });

  const [form, setForm] = useState({
    name: "",
    category: "Hotel",
    address: "",
    city: "",
    latitude: "",
    longitude: "",
    price: "18",
    charger_type: "DC",
    power_kw: "60",
    total_slots: "4",
  });

  const claim = useMutation({
    mutationFn: () => claimFn({ data: form as never }),
    onSuccess: () => {
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  const stats = data?.stats;
  const maxBookings = Math.max(1, ...(data?.days ?? []).map((d) => d.bookings));

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Business dashboard</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Everything you need, nothing you don't.
            </p>
          </div>
          <Button className="rounded-full" onClick={() => setShowForm((v) => !v)}>
            <Plus className="mr-1.5 size-4" />
            Add listing
          </Button>
        </div>

        {isLoading ? (
          <div className="mt-16 flex justify-center">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {showForm ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  claim.mutate();
                }}
                className="mt-6 grid gap-4 rounded-4xl border border-border bg-card p-6 shadow-float sm:grid-cols-2"
              >
                <h2 className="text-lg font-bold sm:col-span-2">New charging listing</h2>
                {(
                  [
                    ["name", "Property name", "text"],
                    ["city", "City", "text"],
                    ["address", "Address", "text"],
                    ["latitude", "Latitude", "number"],
                    ["longitude", "Longitude", "number"],
                    ["price", "Price per kWh (₹)", "number"],
                    ["power_kw", "Power (kW)", "number"],
                    ["total_slots", "Total slots", "number"],
                  ] as const
                ).map(([key, label, type]) => (
                  <div key={key}>
                    <Label className="text-xs">{label}</Label>
                    <Input
                      required
                      type={type}
                      step="any"
                      value={form[key]}
                      onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                      className="mt-1.5 rounded-xl"
                    />
                  </div>
                ))}
                <div>
                  <Label className="text-xs">Category</Label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                    className="mt-1.5 h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-xs">Charger type</Label>
                  <select
                    value={form.charger_type}
                    onChange={(e) => setForm((p) => ({ ...p, charger_type: e.target.value }))}
                    className="mt-1.5 h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
                  >
                    <option value="DC">DC</option>
                    <option value="AC">AC</option>
                  </select>
                </div>
                {claim.isError ? (
                  <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive sm:col-span-2">
                    {(claim.error as Error).message}
                  </p>
                ) : null}
                <div className="sm:col-span-2">
                  <Button type="submit" className="rounded-full" disabled={claim.isPending}>
                    {claim.isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                    Submit for verification
                  </Button>
                  <p className="mt-2 text-xs text-muted-foreground">
                    New listings appear on the map once our team verifies them.
                  </p>
                </div>
              </form>
            ) : null}

            {/* Stats */}
            <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[
                {
                  icon: CalendarCheck,
                  label: "Bookings today",
                  value: String(stats?.todaysBookings ?? 0),
                },
                {
                  icon: IndianRupee,
                  label: "Revenue this month",
                  value: formatINR(stats?.monthlyRevenue ?? 0),
                },
                { icon: Zap, label: "Active chargers", value: String(stats?.activeChargers ?? 0) },
                { icon: Gauge, label: "Utilisation", value: `${stats?.utilization ?? 0}%` },
              ].map((card) => (
                <div key={card.label} className="rounded-3xl border border-border bg-card p-5 shadow-soft">
                  <card.icon className="size-4 text-primary" />
                  <p className="mt-3 text-xs font-semibold text-muted-foreground">{card.label}</p>
                  <p className="font-display text-2xl font-bold">{card.value}</p>
                </div>
              ))}
            </div>

            {/* Weekly bar chart */}
            <div className="mt-4 rounded-4xl border border-border bg-card p-6 shadow-soft">
              <h2 className="text-sm font-bold">Last 7 days</h2>
              <div className="mt-5 flex h-36 items-end gap-3">
                {(data?.days ?? []).map((day) => (
                  <div key={day.date} className="flex flex-1 flex-col items-center gap-2">
                    <div className="flex w-full flex-1 items-end">
                      <div
                        className="w-full rounded-t-xl bg-gradient-to-t from-primary/70 to-primary"
                        style={{ height: `${Math.max(4, (day.bookings / maxBookings) * 100)}%` }}
                        title={`${day.bookings} bookings · ${formatINR(day.revenue)}`}
                      />
                    </div>
                    <span className="text-[11px] font-semibold text-muted-foreground">
                      {day.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Listings */}
            <div className="mt-4 rounded-4xl border border-border bg-card p-6 shadow-soft">
              <h2 className="text-sm font-bold">Your listings</h2>
              {(data?.properties ?? []).length === 0 ? (
                <div className="py-10 text-center">
                  <Building2 className="mx-auto size-9 text-muted-foreground" />
                  <p className="mt-3 text-sm text-muted-foreground">
                    No listings yet. Add one above or{" "}
                    <Link to="/partner" className="font-semibold text-primary">
                      apply as a partner
                    </Link>
                    .
                  </p>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {(data?.properties ?? []).map((property) => (
                    <div
                      key={property.id}
                      className="flex flex-wrap items-center gap-3 rounded-3xl bg-surface p-4"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold">{property.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {property.category} · {property.city} · {property.power_kw}kW{" "}
                          {property.charger_type}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusClasses(property.status)}`}
                      >
                        {statusLabel(property.status)}
                      </span>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min={0}
                          max={property.total_slots}
                          defaultValue={property.available_slots}
                          className="h-9 w-16 rounded-xl"
                          onBlur={(e) =>
                            availability.mutate({
                              propertyId: property.id,
                              available_slots: Number(e.target.value),
                              status: property.status,
                            })
                          }
                        />
                        <span className="text-xs text-muted-foreground">
                          / {property.total_slots} free
                        </span>
                        <select
                          value={property.status}
                          onChange={(e) =>
                            availability.mutate({
                              propertyId: property.id,
                              available_slots: property.available_slots,
                              status: e.target.value,
                            })
                          }
                          className="h-9 rounded-xl border border-input bg-background px-2 text-xs"
                        >
                          <option value="available">Available</option>
                          <option value="busy">Busy</option>
                          <option value="offline">Offline</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent bookings */}
            <div className="mt-4 rounded-4xl border border-border bg-card p-6 shadow-soft">
              <h2 className="text-sm font-bold">Recent bookings</h2>
              {(data?.recent ?? []).length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Bookings will appear here as drivers reserve slots.
                </p>
              ) : (
                <ul className="mt-3 divide-y divide-border">
                  {(data?.recent ?? []).map((booking) => (
                    <li key={booking.id} className="flex items-center justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{booking.propertyName}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(booking.booking_date).toLocaleDateString("en-IN", {
                            dateStyle: "medium",
                          })}{" "}
                          · {booking.time_slot} · {booking.booking_ref}
                        </p>
                      </div>
                      <span className="shrink-0 text-sm font-bold">
                        {formatINR(booking.amount)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
