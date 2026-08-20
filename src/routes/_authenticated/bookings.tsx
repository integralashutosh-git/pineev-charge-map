import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CalendarClock, Navigation, Loader2, Ticket } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { cancelBooking, listMyBookings } from "@/lib/booking.functions";
import { directionsUrl, formatINR } from "@/lib/pineev";

export const Route = createFileRoute("/_authenticated/bookings")({
  head: () => ({
    meta: [
      { title: "My bookings — PineEV" },
      {
        name: "description",
        content: "View, manage and cancel your reserved PineEV charging slots.",
      },
      { property: "og:title", content: "My bookings — PineEV" },
      { property: "og:description", content: "Your reserved EV charging slots on PineEV." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: BookingsPage,
});

interface BookingRow {
  id: string;
  booking_ref: string;
  booking_date: string;
  time_slot: string;
  amount: number;
  status: string;
  payment_method: string;
  property_id: string;
  properties: {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    category: string;
  } | null;
}

function BookingsPage() {
  const listFn = useServerFn(listMyBookings);
  const cancelFn = useServerFn(cancelBooking);
  const queryClient = useQueryClient();

  const { data = [], isLoading } = useQuery({
    queryKey: ["my-bookings"],
    queryFn: () => listFn() as Promise<BookingRow[]>,
  });

  const cancel = useMutation({
    mutationFn: (id: string) => cancelFn({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["taken-slots"] });
    },
  });

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-bold tracking-tight">My bookings</h1>
        <p className="mt-2 text-sm text-muted-foreground">Reserved charging slots, newest first.</p>

        {isLoading ? (
          <div className="mt-10 flex justify-center">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : data.length === 0 ? (
          <div className="mt-8 rounded-4xl border border-border bg-card p-10 text-center shadow-soft">
            <Ticket className="mx-auto size-10 text-muted-foreground" />
            <p className="mt-4 text-sm text-muted-foreground">No bookings yet.</p>
            <Link to="/find" className="mt-5 inline-block">
              <Button className="rounded-full touch-target">Find a charger</Button>
            </Link>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {data.map((booking) => (
              <div
                key={booking.id}
                className="rounded-3xl border border-border bg-card p-5 shadow-soft"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate font-display text-base font-bold">
                      {booking.properties?.name ?? "Charging host"}
                    </h2>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {booking.properties?.address}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      booking.status === "confirmed"
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {booking.status === "confirmed" ? "Confirmed" : "Cancelled"}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
                  <span className="inline-flex items-center gap-1.5 font-semibold">
                    <CalendarClock className="size-3.5 text-accent" />
                    {new Date(booking.booking_date).toLocaleDateString("en-IN", {
                      dateStyle: "medium",
                    })}{" "}
                    · {booking.time_slot}
                  </span>
                  <span className="font-semibold">{formatINR(Number(booking.amount))}</span>
                  <span className="text-muted-foreground">Ref {booking.booking_ref}</span>
                </div>

                <div className="mt-4 flex gap-2">
                  {booking.properties ? (
                    <a
                      href={directionsUrl(
                        Number(booking.properties.latitude),
                        Number(booking.properties.longitude),
                      )}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Button size="sm" variant="outline" className="rounded-full touch-target">
                        <Navigation className="mr-1.5 size-3.5" />
                        Directions
                      </Button>
                    </a>
                  ) : null}
                  <Link to="/property/$id" params={{ id: booking.property_id }}>
                    <Button size="sm" variant="ghost" className="rounded-full touch-target">
                      View spot
                    </Button>
                  </Link>
                  {booking.status === "confirmed" ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="ml-auto rounded-full text-destructive hover:text-destructive touch-target"
                      disabled={cancel.isPending}
                      onClick={() => cancel.mutate(booking.id)}
                    >
                      Cancel
                    </Button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
