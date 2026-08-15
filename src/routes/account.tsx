import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Car, CreditCard, History, Star } from "lucide-react";
import { listMyBookings } from "@/lib/booking.functions";
import { VEHICLES } from "@/lib/vehicles";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { LusionButton } from "@/components/LusionButton";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "My account — PineEV bookings and vehicles" },
      {
        name: "description",
        content:
          "Manage your PineEV profile: saved vehicles, booking history, payment methods and the reviews you have left for hosts.",
      },
      { property: "og:title", content: "My account — PineEV bookings and vehicles" },
      {
        property: "og:description",
        content: "Your PineEV vehicles, bookings, payments and reviews in one place.",
      },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const fetchBookings = useServerFn(listMyBookings);

  const { data } = useQuery({
    queryKey: ["my-bookings"],
    queryFn: () => fetchBookings(),
    enabled: Boolean(user),
  });
  const bookings = data ?? [];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <SiteHeader />

      <main className="mx-auto w-full max-w-3xl pad-x pt-8 md:pt-28">
        <h1 className="font-display text-3xl font-bold tracking-tight">{t("account.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{user?.email ?? t("nav.signin")}</p>

        {!user ? (
          <div className="mt-6">
            <LusionButton to="/auth" className="h-12">
              {t("nav.signin")}
            </LusionButton>
          </div>
        ) : null}

        <Section icon={Car} title={t("account.vehicles")}>
          <div className="grid gap-2 sm:grid-cols-2">
            {VEHICLES.slice(0, 2).map((v) => (
              <div key={v.id} className="rounded-xl bg-muted px-4 py-3">
                <p className="font-semibold">
                  {v.make} {v.model}
                </p>
                <p className="text-xs text-muted-foreground">
                  {v.batteryKwh} kWh · {v.connector}
                </p>
              </div>
            ))}
          </div>
        </Section>

        <Section icon={History} title={t("account.history")}>
          {bookings.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("account.empty")}</p>
          ) : (
            <div className="grid gap-2">
              {bookings.slice(0, 6).map((b) => (
                <Link
                  key={b.id}
                  to="/session/$id"
                  params={{ id: b.id }}
                  className="flex items-center justify-between rounded-xl bg-muted px-4 py-3 transition-colors hover:bg-primary-container"
                >
                  <span>
                    <span className="block font-semibold">#{b.booking_ref}</span>
                    <span className="text-xs text-muted-foreground">
                      {b.booking_date} · {b.time_slot}
                    </span>
                  </span>
                  <span className="font-display font-bold">₹{b.amount}</span>
                </Link>
              ))}
            </div>
          )}
        </Section>

        <Section icon={CreditCard} title={t("account.payments")}>
          <p className="text-sm text-muted-foreground">UPI · Card (simulated)</p>
        </Section>

        <Section icon={Star} title={t("account.reviews")}>
          <p className="text-sm text-muted-foreground">
            Reviews you leave after a session will appear here.
          </p>
        </Section>
      </main>

      <SiteFooter />
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Car;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-6 rounded-2xl border border-border bg-card card-pad elev-1">
      <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
        <Icon className="size-4 text-primary" />
        {title}
      </h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}
