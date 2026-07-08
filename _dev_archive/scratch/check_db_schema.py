import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Try to find .env file
dotenv.config({ path: 'biomed-maintenance-app/.env' })
dotenv.config({ path: 'biomed-maintenance-app/.env.local' })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env or .env.local")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSchema() {
  const { data, error } = await supabase
    .from('correctivos_husj')
    .select('*')
    .limit(1)

  if (error) {
    console.error("Error fetching data:", error)
  } else if (data && data.length > 0) {
    console.log("Columns found in correctivos_husj:", Object.keys(data[0]))
  } else {
    console.log("No data found in correctivos_husj, but query succeeded.")
  }
}

checkSchema()
