import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://gzdspkhpxkibjxbfdeuc.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseAnonKey) {
  throw new Error("Missing VITE_SUPABASE_ANON_KEY in environment");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
