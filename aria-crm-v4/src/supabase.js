import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://rzbkuoabrhnalrtlveaf.supabase.co'
const SUPABASE_KEY = 'sb_publishable_z_b3RHZlQNuBrAUbZONfWQ_rpN28DAx'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
