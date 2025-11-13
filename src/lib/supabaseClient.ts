/**
 * Supabase client initialization
 * Only initialized in production mode
 */

import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfig, isProductionMode } from "./config";

let supabaseClient: ReturnType<typeof createClient> | null = null;

/**
 * Get or create Supabase client
 * Returns null in demo mode
 */
export function getSupabaseClient() {
  if (!isProductionMode()) {
    return null;
  }

  if (supabaseClient) {
    return supabaseClient;
  }

  const config = getSupabaseConfig();
  
  if (!config.url || !config.anonKey) {
    console.warn(
      "Supabase configuration missing. Falling back to demo mode. " +
      "Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY for production mode."
    );
    return null;
  }

  supabaseClient = createClient(config.url, config.anonKey);
  return supabaseClient;
}

