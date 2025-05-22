// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase-types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create a single supabase client for the entire application
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Helper function for handling errors
export const handleSupabaseError = (error: unknown) => {
  if (error instanceof Error) {
    console.error('Supabase error:', error.message);
    return error.message;
  }
  console.error('Unknown error:', error);
  return 'An unknown error occurred';
};