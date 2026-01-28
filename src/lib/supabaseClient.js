import { createClient } from '@supabase/supabase-js'

// Expect the following env vars to be defined in your environment
// Create React App requires REACT_APP_ prefix
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Supabase configuration missing. Define REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY in .env.local and restart the dev server.')
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
