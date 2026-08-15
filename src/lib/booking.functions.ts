import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createPublicClient } from "./supabase-public.server";
import { makeBookingRef } from "./booking.server";

/** Slots already taken for a charger on a date (only slot labels are returned). */
export const getTakenSlots = createServerFn({ method: "GET" })
  .inputValidator((data) =>
    z.object({ chargerId: z.string().uuid(), date: z.string().min(8).max(10) }).parse(data),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("bookings")
      .select("time_slot")
      .eq("charger_id", data.chargerId)
      .eq("booking_date", data.date)
      .eq("status", "confirmed");
    if (error) throw new Error(error.message);
    return (rows ?? []).map((r) => r.time_slot);
  });

export const createBooking = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        propertyId: z.string().uuid(),
        chargerId: z.string().uuid(),
        date: z.string().min(8).max(10),
        timeSlot: z.string().min(5).max(20),
        paymentMethod: z.enum(["upi", "card"]),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const publicClient = createPublicClient();
    const { data: charger, error: chargerError } = await publicClient
      .from("chargers")
      .select("id,price,power_kw,property_id,status")
      .eq("id", data.chargerId)
      .eq("property_id", data.propertyId)
      .maybeSingle();
    if (chargerError) throw new Error(chargerError.message);
    if (!charger) throw new Error("Charger not found");
    if (charger.status === "offline") throw new Error("This charger is currently offline");

    const amount = Math.round(Number(charger.price) * Math.round(charger.power_kw * 0.7));

    const { data: booking, error } = await context.supabase
      .from("bookings")
      .insert({
        booking_ref: makeBookingRef(),
        user_id: context.userId,
        property_id: data.propertyId,
        charger_id: data.chargerId,
        booking_date: data.date,
        time_slot: data.timeSlot,
        amount,
        payment_method: data.paymentMethod,
        status: "confirmed",
      })
      .select("id,booking_ref,booking_date,time_slot,amount,payment_method")
      .single();

    if (error) {
      if (error.code === "23505" || error.code === "23P01" || error.code === "23505")
        throw new Error("That slot was just taken. Please pick another one.");
      throw new Error(error.message);
    }
    return booking;
  });

export const listMyBookings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("bookings")
      .select(
        "id,booking_ref,booking_date,time_slot,amount,status,payment_method,property_id,properties(name,address,latitude,longitude,category)",
      )
      .eq("user_id", context.userId)
      .order("booking_date", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const cancelBooking = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
