// Middleware de autenticación simple para el panel de administración
// Este archivo maneja la verificación de tokens de acceso para rutas protegidas

import { NextRequest } from 'next/server'
import { securityConfig } from './config'

// Interfaz para el usuario autenticado
export interface AuthUser {
  id: string
  email: string
  role: 'admin' | 'user'
  name?: string
}

// Función para verificar si un token es válido
export function verifyAuthToken(token: string): AuthUser | null {
  try {
    // En desarrollo, usar un token simple
    // En producción, esto debería usar JWT o Auth0
    if (token === securityConfig.adminToken) {
      return {
        id: 'admin-1',
        email: 'admin@uniprojects.com',
        role: 'admin',
        name: 'Administrador'
      }
    }
    
    // Aquí podrías agregar verificación JWT real
    // const decoded = jwt.verify(token, process.env.JWT_SECRET)
    // return decoded as AuthUser
    
    return null
  } catch (error) {
    console.error('Error verificando token:', error)
    return null
  }
}

// Función para extraer el token de autorización de la request
export function extractAuthToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  
  return authHeader.substring(7) // Remover "Bearer "
}

// Función para verificar si el usuario tiene permisos de administrador
export function isAdmin(user: AuthUser | null): boolean {
  return user?.role === 'admin'
}

// Función para crear un token de respuesta de error de autenticación
export function createAuthErrorResponse(message: string = 'No autorizado', status: number = 401) {
  return new Response(
    JSON.stringify({ 
      error: message,
      code: 'UNAUTHORIZED',
      timestamp: new Date().toISOString()
    }),
    { 
      status,
      headers: {
        'Content-Type': 'application/json',
        'WWW-Authenticate': 'Bearer'
      }
    }
  )
}

// Middleware para proteger rutas API que requieren autenticación
export function requireAuth(request: NextRequest): AuthUser | Response {
  const token = extractAuthToken(request)
  
  if (!token) {
    return createAuthErrorResponse('Token de autorización requerido')
  }
  
  const user = verifyAuthToken(token)
  
  if (!user) {
    return createAuthErrorResponse('Token inválido o expirado')
  }
  
  return user
}

// Middleware para proteger rutas que requieren permisos de administrador
export function requireAdmin(request: NextRequest): AuthUser | Response {
  const authResult = requireAuth(request)
  
  if (authResult instanceof Response) {
    return authResult // Error de autenticación
  }
  
  if (!isAdmin(authResult)) {
    return createAuthErrorResponse('Se requieren permisos de administrador', 403)
  }
  
  return authResult
}

// Función para generar un token temporal (solo para desarrollo)
export function generateTempToken(user: Partial<AuthUser>): string {
  // En producción, usar JWT real
  // return jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '24h' })
  
  // Para desarrollo, retornar el token simple
  if (user.role === 'admin') {
    return securityConfig.adminToken
  }
  
  return 'user-token-' + Date.now()
}
