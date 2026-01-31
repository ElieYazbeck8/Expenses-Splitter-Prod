import { createBrowserClient } from "@supabase/ssr";

// Replace with your Supabase URL and key from Dashboard > Settings > API
// Use the Publishable key (sb_publishable_...) or Legacy anon key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://YOUR_PROJECT.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "YOUR_ANON_KEY";

export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
