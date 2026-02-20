// Mock Supabase client structure
// In a real app, you would import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = {
  auth: {
    signInWithOAuth: async (provider: any) => {
      console.log('Mock SignIn with', provider);
      return { error: null };
    },
    signOut: async () => {
      console.log('Mock SignOut');
      return { error: null };
    },
    getSession: async () => {
      return { data: { session: null }, error: null };
    },
  },
  from: (table: string) => {
    return {
      select: () => Promise.resolve({ data: [], error: null }),
      insert: (data: any) => Promise.resolve({ data, error: null }),
      update: (data: any) => Promise.resolve({ data, error: null }),
      delete: () => Promise.resolve({ data: null, error: null }),
    };
  },
};
