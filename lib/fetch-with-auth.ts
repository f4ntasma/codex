/**
 * Helper para hacer fetch con autenticación de Supabase
 * Obtiene automáticamente el token de la sesión y lo incluye en los headers
 */
import { supabase } from './supabase-client'

export async function fetchWithAuth(
  url: string, 
  options: RequestInit = {}
): Promise<Response> {
  // Obtener el token de Supabase
  const { data: { session } } = await supabase.auth.getSession()
  const accessToken = session?.access_token

  // Preparar headers
  const headers = new Headers(options.headers)
  
  // Si no hay Content-Type, agregarlo por defecto para JSON
  if (!headers.has('Content-Type') && options.method !== 'GET') {
    headers.set('Content-Type', 'application/json')
  }

  // Agregar token de autorización si existe
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`)
  }

  // Realizar fetch con headers actualizados
  return fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Incluir cookies si existen
  })
}

