import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { buildDashboard } from "./dashboard.server";

export const getDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: properties, error: propError } = await context.supabase
      .from("properties")
      .select("id,name,category,city,status,available_slots,total_slots,price,power_kw,charger_type")
      .eq("owner_id", context.userId)
      .order("created_at", { ascending: false });
    if (propError) throw new Error(propError.message);

    const ids = (properties ?? []).map((p) => p.id);
    if (ids.length === 0) {
      return buildDashboard([], [], []);
    }

    const [chargers, bookings] = await Promise.all([
      context.supabase
        .from("chargers")
        .select("id,property_id,label,connector_type,charger_type,power_kw,price,status")
        .in("property_id", ids),
      context.supabase
        .from("bookings")
        .select("id,booking_ref,booking_date,time_slot,amount,status,property_id")
        .in("property_id", ids)
        .order("booking_date", { ascending: false })
        .limit(300),
    ]);
    if (chargers.error) throw new Error(chargers.error.message);
    if (bookings.error) throw new Error(bookings.error.message);

    return buildDashboard(properties ?? [], chargers.data ?? [], bookings.data ?? []);
  });

export const claimProperty = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        name: z.string().min(2).max(120),
        category: z.string().min(2).max(40),
        address: z.string().min(4).max(240),
        city: z.string().min(2).max(80),
        latitude: z.coerce.number().min(-90).max(90),
        longitude: z.coerce.number().min(-180).max(180),
        price: z.coerce.number().min(1).max(500),
        charger_type: z.enum(["AC", "DC"]),
        power_kw: z.coerce.number().int().min(3).max(400),
        total_slots: z.coerce.number().int().min(1).max(200),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { data: property, error } = await context.supabase
      .from("properties")
      .insert({
        ...data,
        owner_id: context.userId,
        available_slots: data.total_slots,
        approved: false,
        images: [],
        amenities: ["Parking"],
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return property;
  });

export const addCharger = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        property_id: z.string().uuid(),
        label: z.string().min(1).max(40),
        connector_type: z.enum(["CCS2", "Type 2", "CHAdeMO"]),
        charger_type: z.enum(["AC", "DC"]),
        power_kw: z.coerce.number().int().min(3).max(400),
        price: z.coerce.number().min(1).max(500),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("chargers").insert(data);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const updateAvailability = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        propertyId: z.string().uuid(),
        available_slots: z.coerce.number().int().min(0).max(200),
        status: z.enum(["available", "busy", "offline"]),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("properties")
      .update({ available_slots: data.available_slots, status: data.status })
      .eq("id", data.propertyId)
      .eq("owner_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
