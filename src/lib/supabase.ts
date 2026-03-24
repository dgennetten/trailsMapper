import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL ?? '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim();

let client: SupabaseClient<Database> | null = null;

/**
 * Returns a Supabase client when VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.
 * Otherwise returns null so the app can still load (map + bundled data).
 *
 * Patrol data uses PostgREST table routes only (`/rest/v1/trailPatrols`), not the
 * OpenAPI root (`/rest/v1/`), which Supabase is restricting for anon keys.
 */
export function getSupabase(): SupabaseClient<Database> | null {
  if (!supabaseUrl || !supabaseAnonKey) return null;
  if (!client) {
    client = createClient<Database>(supabaseUrl, supabaseAnonKey);
  }
  return client;
}
