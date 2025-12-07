/**
 * Application configuration and mode detection
 */

export type AppMode = "demo" | "production";

/**
 * Get the current application mode
 * Defaults to "demo" if not specified
 */
export function getAppMode(): AppMode {
  const mode = import.meta.env.VITE_APP_MODE || "demo";
  return mode === "production" ? "production" : "demo";
}

/**
 * Check if we're in production mode
 */
export function isProductionMode(): boolean {
  return getAppMode() === "production";
}

/**
 * Check if we're in demo mode
 */
export function isDemoMode(): boolean {
  return getAppMode() === "demo";
}

/**
 * Get Supabase configuration
 */
export function getSupabaseConfig() {
  return {
    url: import.meta.env.VITE_SUPABASE_URL || "",
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || "",
  };
}

