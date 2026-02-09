// Ensure env vars are loaded first
import './env';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import logger from '../utils/logger';

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  logger.warn('Supabase credentials not configured. Set SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables.');
}

// Create Supabase client with service role key for backend operations
export const supabase: SupabaseClient = createClient(
  supabaseUrl || '',
  supabaseServiceKey || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export default supabase;
