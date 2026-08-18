import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createPublicClient, PROPERTY_COLUMNS, CHARGER_COLUMNS } from "./supabase-public.server";

export const listProperties = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("properties")
    .select(PROPERTY_COLUMNS)
    .eq("approved", true)
    .order("rating", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getPropertyDetail = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const supabase = createPublicClient();
    const [property, chargers] = await Promise.all([
      supabase
        .from("properties")
        .select(PROPERTY_COLUMNS)
        .eq("id", data.id)
        .eq("approved", true)
        .maybeSingle(),
      supabase.from("chargers").select(CHARGER_COLUMNS).eq("property_id", data.id).order("label"),
    ]);
    if (property.error) throw new Error(property.error.message);
    if (chargers.error) throw new Error(chargers.error.message);
    return { property: property.data, chargers: chargers.data ?? [] };
  });

export const submitPartnerApplication = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z
      .object({
        business_name: z.string().min(2).max(120),
        category: z.string().min(2).max(40),
        contact_name: z.string().min(2).max(80),
        email: z.string().email().max(160),
        phone: z.string().min(6).max(20),
        city: z.string().min(2).max(80),
        address: z.string().max(240).default(""),
        parking_slots: z.coerce.number().int().min(1).max(500),
        message: z.string().max(1000).default(""),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const supabase = createPublicClient();
    const { error } = await supabase.from("partner_applications").insert(data);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const submitContactMessage = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z
      .object({
        name: z.string().min(2).max(80),
        email: z.string().email().max(160),
        subject: z.string().max(120).default(""),
        message: z.string().min(5).max(2000),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const supabase = createPublicClient();
    const { error } = await supabase.from("contact_messages").insert(data);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
