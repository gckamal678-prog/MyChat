import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl?.startsWith('https://') &&
  supabaseKey &&
  !supabaseKey.includes('तपाईंको_पूरै_key')
);

let supabaseClient = null;
export let supabaseConfigError = '';

if (isSupabaseConfigured) {
  try {
    supabaseClient = createClient(supabaseUrl, supabaseKey);
  } catch (error) {
    supabaseConfigError = error.message;
  }
}

export const supabase = supabaseClient;
