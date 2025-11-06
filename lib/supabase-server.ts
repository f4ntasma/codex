import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'

/**
 * Obtiene el token de acceso de Supabase desde el request
 */
export function getSupabaseAccessToken(request: NextRequest): string | null {
  // Intentar obtener desde el header Authorization
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.replace('Bearer ', '')
  }

  // Intentar obtener desde cookies de Supabase
  // Supabase guarda el token en cookies con nombres específicos
  // Formato: sb-<project-ref>-auth-token
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) return null
  
  // Extraer el project ref de la URL (ej: xqkqwktteaahfrsjnyvg de https://xqkqwktteaahfrsjnyvg.supabase.co)
  const urlMatch = supabaseUrl.match(/https?:\/\/([^.]+)\.supabase\.co/)
  const projectRef = urlMatch ? urlMatch[1] : null
  
  if (projectRef) {
    // Buscar cookie con formato: sb-<project-ref>-auth-token
    const cookieName = `sb-${projectRef}-auth-token`
    const cookie = request.cookies.get(cookieName)
    
    if (cookie?.value) {
      try {
        const cookieValue = JSON.parse(cookie.value)
        // El valor puede ser un objeto con access_token o directamente el token
        return cookieValue.access_token || cookieValue || null
      } catch {
        // Si no es JSON, puede ser el token directamente
        return cookie.value || null
      }
    }
  }

  // Buscar cualquier cookie que contenga 'sb-' y '-auth-token' como fallback
  const allCookies = request.cookies.getAll()
  for (const cookie of allCookies) {
    if (cookie.name.includes('sb-') && cookie.name.includes('-auth-token')) {
      try {
        const cookieValue = JSON.parse(cookie.value)
        return cookieValue.access_token || cookieValue || null
      } catch {
        return cookie.value || null
      }
    }
  }

  return null
}

/**
 * Crea un cliente de Supabase con el token del usuario desde el request
 */
export function createSupabaseServerClient(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  
  const accessToken = getSupabaseAccessToken(request)
  
  if (!accessToken) {
    return createClient(supabaseUrl, supabaseAnonKey)
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  })
}

/**
 * Verifica si el usuario está autenticado y retorna su información
 */
export async function getAuthenticatedUser(request: NextRequest) {
  const supabase = createSupabaseServerClient(request)
  
  const accessToken = getSupabaseAccessToken(request)
  
  if (!accessToken) {
    return null
  }

  const { data: { user }, error } = await supabase.auth.getUser(accessToken)
  
  if (error || !user) {
    return null
  }

  // Obtener el perfil
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return null
  }

  return {
    id: profile.id,
    email: profile.email,
    name: profile.name,
    role: profile.role,
    avatar: profile.avatar || null,
    university: profile.university || null,
    company: profile.company || null
  }
}

