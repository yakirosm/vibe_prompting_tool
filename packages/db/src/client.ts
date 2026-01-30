import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

export type SupabaseClient = ReturnType<typeof createClient<Database>>;

export function createSupabaseClient(supabaseUrl: string, supabaseKey: string): SupabaseClient {
  return createClient<Database>(supabaseUrl, supabaseKey);
}
