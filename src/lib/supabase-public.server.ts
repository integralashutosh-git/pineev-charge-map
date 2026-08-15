import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

/** Publishable-key client for public, read-only (or public-insert) access. */
export function createPublicClient() {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) throw new Error("Supabase environment is not configured");

  return createClient<Database>(url, key, {
    auth: {
      storage: undefined,
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export const PROPERTY_COLUMNS =
  "id,name,category,latitude,longitude,address,city,rating,price,charger_type,power_kw,total_slots,available_slots,images,amenities,status,open_status,description";

export const CHARGER_COLUMNS =
  "id,property_id,label,connector_type,charger_type,power_kw,price,status";
