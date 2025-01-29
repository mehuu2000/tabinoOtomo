import { createClient } from '@supabase/supabase-js'
 
const supabaseUrl =process.env.SUPABASE_URL as string

const supabaseProjectUrl = process.env.SUPABASE_PROJECT_URL as string
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY as string
export const supabase = createClient(supabaseProjectUrl, supabaseAnonKey)