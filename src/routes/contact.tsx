import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Mail, Phone, MapPin, Loader2, CheckCircle2 } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitContactMessage } from "@/lib/catalog.functions";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact PineEV — support for drivers and partners" },
      {
        name: "description",
        content:
          "Questions about a booking, a charger or a partnership? Reach the PineEV team and we'll reply within one business day.",
      },
      { property: "og:title", content: "Contact PineEV" },
      {
        property: "og:description",
        content: "Support for EV drivers and property partners on PineEV.",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const submit = useServerFn(submitContactMessage);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const mutation = useMutation({ mutationFn: () => submit({ data: form }) });

  function set(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto grid w-full max-w-5xl gap-8 px-4 py-14 sm:px-6 md:grid-cols-5">
          <div className="md:col-span-2">
            <h1 className="text-4xl font-bold leading-tight tracking-tight">Talk to us</h1>
            <p className="mt-4 text-sm text-muted-foreground">
              Whether you're a driver with a booking question or a property owner exploring a
              partnership, we're here.
            </p>
            <ul className="mt-8 space-y-4 text-sm">
              {[
                { icon: Mail, label: "support@pineev.in" },
                { icon: Phone, label: "+91 80 4718 2200" },
                { icon: MapPin, label: "Indiranagar, Bengaluru 560038" },
              ].map((item) => (
                <li key={item.label} className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <item.icon className="size-4" />
                  </span>
                  <span className="font-medium">{item.label}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3">
            {mutation.isSuccess ? (
              <div className="rounded-4xl border border-border bg-card p-8 text-center shadow-float">
                <CheckCircle2 className="mx-auto size-12 text-primary" />
                <h2 className="mt-4 text-2xl font-bold">Message sent</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  We usually reply within one business day.
                </p>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  mutation.mutate();
                }}
                className="space-y-4 rounded-4xl border border-border bg-card p-6 shadow-float sm:p-8"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label className="text-xs">Name</Label>
                    <Input required value={form.name} onChange={set("name")} className="mt-1.5 rounded-xl" />
                  </div>
                  <div>
                    <Label className="text-xs">Email</Label>
                    <Input
                      required
                      type="email"
                      value={form.email}
                      onChange={set("email")}
                      className="mt-1.5 rounded-xl"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Subject</Label>
                  <Input value={form.subject} onChange={set("subject")} className="mt-1.5 rounded-xl" />
                </div>
                <div>
                  <Label className="text-xs">Message</Label>
                  <Textarea
                    required
                    rows={6}
                    value={form.message}
                    onChange={set("message")}
                    className="mt-1.5 rounded-2xl"
                  />
                </div>
                {mutation.isError ? (
                  <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {(mutation.error as Error).message}
                  </p>
                ) : null}
                <Button type="submit" size="lg" className="w-full rounded-full" disabled={mutation.isPending}>
                  {mutation.isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                  Send message
                </Button>
              </form>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
