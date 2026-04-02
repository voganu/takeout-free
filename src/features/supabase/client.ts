import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Missing required Supabase environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
  }
}

export const supabase = createClient<Database>(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
