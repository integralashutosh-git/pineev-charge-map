interface DashProperty {
  id: string;
  name: string;
  category: string;
  city: string;
  status: string;
  available_slots: number;
  total_slots: number;
  price: number;
  power_kw: number;
  charger_type: string;
}

interface DashCharger {
  id: string;
  property_id: string;
  label: string;
  connector_type: string;
  charger_type: string;
  power_kw: number;
  price: number;
  status: string;
}

interface DashBooking {
  id: string;
  booking_ref: string;
  booking_date: string;
  time_slot: string;
  amount: number;
  status: string;
  property_id: string;
}

function isoDay(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function buildDashboard(
  properties: DashProperty[],
  chargers: DashCharger[],
  bookings: DashBooking[],
) {
  const today = isoDay(new Date());
  const monthPrefix = today.slice(0, 7);
  const confirmed = bookings.filter((b) => b.status === "confirmed");

  const todaysBookings = confirmed.filter((b) => b.booking_date === today).length;
  const monthlyRevenue = confirmed
    .filter((b) => b.booking_date.startsWith(monthPrefix))
    .reduce((sum, b) => sum + Number(b.amount), 0);
  const activeChargers = chargers.filter((c) => c.status !== "offline").length;

  const capacity = properties.reduce((sum, p) => sum + p.total_slots, 0);
  const inUse = properties.reduce(
    (sum, p) => sum + Math.max(0, p.total_slots - p.available_slots),
    0,
  );
  const utilization = capacity === 0 ? 0 : Math.round((inUse / capacity) * 100);

  // last 7 days series
  const days: { label: string; date: string; bookings: number; revenue: number }[] = [];
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = isoDay(d);
    const dayBookings = confirmed.filter((b) => b.booking_date === key);
    days.push({
      label: d.toLocaleDateString("en-IN", { weekday: "short" }),
      date: key,
      bookings: dayBookings.length,
      revenue: dayBookings.reduce((sum, b) => sum + Number(b.amount), 0),
    });
  }

  const peakBuckets: [string, number, number][] = [
    ["06-09", 6, 9],
    ["09-12", 9, 12],
    ["12-15", 12, 15],
    ["15-18", 15, 18],
    ["18-21", 18, 21],
    ["21-24", 21, 24],
  ];
  const peakHours = peakBuckets.map(([bucket, from, to]) => {
    const count = confirmed.filter((b) => {
      const hour = Number(b.time_slot.slice(0, 2));
      return hour >= from && hour < to;
    }).length;
    return { bucket, sessions: count };
  });

  const nameById = new Map(properties.map((p) => [p.id, p.name]));
  const recent = confirmed.slice(0, 10).map((b) => ({
    ...b,
    amount: Number(b.amount),
    propertyName: nameById.get(b.property_id) ?? "—",
  }));

  return {
    stats: { todaysBookings, monthlyRevenue, activeChargers, utilization },
    days,
    peakHours,
    recent,
    properties: properties.map((p) => ({ ...p, price: Number(p.price) })),
    chargers: chargers.map((c) => ({ ...c, price: Number(c.price) })),
  };
}
