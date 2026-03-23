import { createClient } from '@supabase/supabase-js'

// Vercel → Settings → Environment Variables:
// VITE_SUPABASE_URL   = https://xxxx.supabase.co
// VITE_SUPABASE_ANON_KEY = sb_publishable_...
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://rzbkuoabrhnalrtlveaf.supabase.co'
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_z_b3RHZlQNuBrAUbZONfWQ_rpN28DAx'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
