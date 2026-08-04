import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vcpeghsekglbwsolntvo.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_KPX6N5hqzwNQ2R_TC3r8YQ_EkJA25GR'
  );
}
