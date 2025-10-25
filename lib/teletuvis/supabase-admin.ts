import 'server-only' // Garantiza que este módulo NO se pueda importar en el cliente
import { createClient } from '@supabase/supabase-js'

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,     // o process.env.SUPABASE_URL si lo prefieres privado
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
)