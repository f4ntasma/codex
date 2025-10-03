import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest, authConfig, User } from './auth'

export function requireAuth(request: NextRequest): User | null {
  const user = getUserFromRequest(request)
  
  if (!user) {
    return null
  }
  
  return user
}

export function requireRole(request: NextRequest, allowedRoles: User['role'][]): User | null {
  const user = requireAuth(request)
  
  if (!user || !allowedRoles.includes(user.role)) {
    return null
  }
  
  return user
}

export function requireStudent(request: NextRequest): User | null {
  return requireRole(request, ['student', 'admin'])
}

export function requireCorporate(request: NextRequest): User | null {
  return requireRole(request, ['corporate', 'admin'])
}

export function requireAdmin(request: NextRequest): User | null {
  return requireRole(request, ['admin'])
}

export function withAuth(handler: (request: NextRequest, user: User) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    const user = requireAuth(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'No autorizado', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }
    
    return handler(request, user)
  }
}

export function withRole(
  allowedRoles: User['role'][],
  handler: (request: NextRequest, user: User) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    const user = requireRole(request, allowedRoles)
    
    if (!user) {
      return NextResponse.json(
        { error: 'No tienes permisos para acceder a este recurso', code: 'FORBIDDEN' },
        { status: 403 }
      )
    }
    
    return handler(request, user)
  }
}

export function createAuthResponse(user: User, token: string) {
  const response = NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar
    },
    message: 'Autenticación exitosa'
  })

  // Set HTTP-only cookie
  response.cookies.set(authConfig.cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  })

  return response
}

export function createLogoutResponse() {
  const response = NextResponse.json({ message: 'Sesión cerrada exitosamente' })
  
  response.cookies.delete(authConfig.cookieName)
  
  return response
}