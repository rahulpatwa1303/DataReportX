import { createClient } from '@supabase/supabase-js';
import { createBrowserSupabaseClient, createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create a unified client
export const supabase = createPagesBrowserClient({
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,  // Use your Supabase URL
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,  // Use your Supabase anon key
});