import type { Property } from "./pineev";

export type BookingState = "available" | "busy" | "booked";

/** Live booking state derived from the existing availability fields. */
export function bookingState(p: Pick<Property, "status" | "available_slots">): BookingState {
  const slots = Number(p.available_slots ?? 0);
  if (slots <= 0 || p.status === "offline") return "booked";
  if (p.status === "busy") return "busy";
  return "available";
}

/** Marker colour: green available, orange busy, red fully booked. */
export function bookingStateColor(state: BookingState) {
  if (state === "available") return "#16A34A";
  if (state === "busy") return "#F59E0B";
  return "#EF4444";
}

export function bookingStateLabel(
  p: Pick<Property, "status" | "available_slots">,
  state = bookingState(p),
) {
  if (state === "available") return "Available";
  if (state === "busy") {
    const slots = Number(p.available_slots ?? 0);
    return `${slots} ${slots === 1 ? "slot" : "slots"} left`;
  }
  return "Fully Booked";
}

export function bookingStateClasses(state: BookingState) {
  if (state === "available") return "bg-primary/10 text-primary";
  if (state === "busy") return "bg-warning/15 text-warning-foreground";
  return "bg-destructive/10 text-destructive";
}
