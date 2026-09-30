/// <reference types="vite/client" />
// SMARTMOVE Supabase Client
// Handles both real cloud Supabase connectivity and high-fidelity local reactive simulation engine

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mock-smartmove-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'mock-anon-key';

export const isRealSupabaseConfigured =
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('mock-smartmove') &&
  supabaseAnonKey.length > 20 &&
  !supabaseAnonKey.includes('mock');

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
