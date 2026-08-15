import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { BadgeIndianRupee, Users, LineChart, Loader2, CheckCircle2 } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitPartnerApplication } from "@/lib/catalog.functions";
import { CATEGORIES } from "@/lib/pineev";

export const Route = createFileRoute("/partner")({
  head: () => ({
    meta: [
      { title: "Become a PineEv partner — earn from your parking" },
      {
        name: "description",
        content:
          "List your hotel, café, dhaba or office parking on PineEv. Earn from every EV charging session and bring new customers in.",
      },
      { property: "og:title", content: "Become a PineEv partner" },
      {
        property: "og:description",
        content: "Turn idle parking into recurring EV charging revenue with PineEv.",
      },
    ],
  }),
  component: PartnerPage,
});

const BENEFITS = [
  {
    icon: BadgeIndianRupee,
    title: "New revenue stream",
    body: "Earn on every charging session plus the spend that comes with it — meals, rooms, coffee.",
  },
  {
    icon: Users,
    title: "High-intent footfall",
    body: "EV drivers stay 30–60 minutes while charging. That is guaranteed dwell time at your business.",
  },
  {
    icon: LineChart,
    title: "Simple controls",
    body: "Manage slots, pricing and availability from one clean dashboard. No complicated setup.",
  },
];

function PartnerPage() {
  const submit = useServerFn(submitPartnerApplication);
  const [form, setForm] = useState({
    business_name: "",
    category: "Hotel",
    contact_name: "",
    email: "",
    phone: "",
    city: "",
    address: "",
    parking_slots: "4",
    message: "",
  });

  const mutation = useMutation({
    mutationFn: () =>
      submit({
        data: { ...form, parking_slots: Number(form.parking_slots) },
      }),
  });

  function set(key: keyof typeof form) {
    return (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    ) => setForm((prev) => ({ ...prev, [key]: e.target.value }));
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground shadow-soft">
              For property owners
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              Turn your parking into a{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                charging destination
              </span>
            </h1>
            <p className="mt-4 text-base text-muted-foreground">
              PineEv verifies your property, lists it on our live map and sends EV drivers your way
              with pre-paid reservations.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {BENEFITS.map((item) => (
              <div key={item.title} className="rounded-3xl border border-border bg-card p-6 shadow-soft">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <item.icon className="size-5" />
                </div>
                <h2 className="mt-4 text-lg font-bold">{item.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-border bg-surface">
          <div className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6">
            {mutation.isSuccess ? (
              <div className="rounded-4xl border border-border bg-card p-8 text-center shadow-float">
                <CheckCircle2 className="mx-auto size-12 text-primary" />
                <h2 className="mt-4 text-2xl font-bold">Application received</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Our partnerships team will reach out within 2 business days to verify your
                  property and set up your listing.
                </p>
              </div>
            ) : (
              <div className="rounded-4xl border border-border bg-card p-6 shadow-float sm:p-8">
                <h2 className="text-2xl font-bold tracking-tight">Apply to list your property</h2>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Takes two minutes. No setup fees.
                </p>

                <form
                  className="mt-6 grid gap-4 sm:grid-cols-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    mutation.mutate();
                  }}
                >
                  <Field label="Business name">
                    <Input required value={form.business_name} onChange={set("business_name")} className="rounded-xl" />
                  </Field>
                  <Field label="Category">
                    <select
                      value={form.category}
                      onChange={set("category")}
                      className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
                    >
                      {CATEGORIES.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Contact person">
                    <Input required value={form.contact_name} onChange={set("contact_name")} className="rounded-xl" />
                  </Field>
                  <Field label="Phone">
                    <Input required value={form.phone} onChange={set("phone")} className="rounded-xl" placeholder="+91 98765 43210" />
                  </Field>
                  <Field label="Email">
                    <Input required type="email" value={form.email} onChange={set("email")} className="rounded-xl" />
                  </Field>
                  <Field label="City">
                    <Input required value={form.city} onChange={set("city")} className="rounded-xl" />
                  </Field>
                  <Field label="Address" className="sm:col-span-2">
                    <Input value={form.address} onChange={set("address")} className="rounded-xl" />
                  </Field>
                  <Field label="Parking slots available">
                    <Input
                      required
                      type="number"
                      min={1}
                      max={500}
                      value={form.parking_slots}
                      onChange={set("parking_slots")}
                      className="rounded-xl"
                    />
                  </Field>
                  <Field label="Anything else?" className="sm:col-span-2">
                    <Textarea
                      value={form.message}
                      onChange={set("message")}
                      rows={4}
                      className="rounded-2xl"
                      placeholder="Existing chargers, power availability, operating hours…"
                    />
                  </Field>

                  {mutation.isError ? (
                    <p className="sm:col-span-2 rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
                      {(mutation.error as Error).message}
                    </p>
                  ) : null}

                  <div className="sm:col-span-2">
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full rounded-full shadow-soft"
                      disabled={mutation.isPending}
                    >
                      {mutation.isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                      Submit application
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label className="text-xs">{label}</Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
