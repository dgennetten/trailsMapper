import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Get Supabase URL and anon key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('URL present:', !!supabaseUrl);
  console.error('Key present:', !!supabaseAnonKey);
  console.error('Please check your .env file and make sure:');
  console.error('1. File is named .env (not .env.example)');
  console.error('2. Variables start with VITE_');
  console.error('3. You restarted the dev server after creating .env');
}

export const supabase = createClient<Database>(
  supabaseUrl || '',
  supabaseAnonKey || ''
);
