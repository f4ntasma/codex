import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

export interface User {
  id: string
  email: string
  name: string
  role: 'student' | 'corporate' | 'admin'
  avatar?: string
  university?: string
  company?: string
}

export interface JWTPayload {
  userId: string
  email: string
  role: string
  iat?: number
  exp?: number
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const JWT_EXPIRES_IN = '7d'

export function generateToken(user: User): string {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role
  }

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

export function extractTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  
  const cookieToken = request.cookies.get('auth-token')?.value
  return cookieToken || null
}

export function getUserFromRequest(request: NextRequest): User | null {
  const token = extractTokenFromRequest(request)
  if (!token) return null

  const payload = verifyToken(token)
  if (!payload) return null

  return {
    id: payload.userId,
    email: payload.email,
    name: payload.email.split('@')[0], // Default name from email
    role: payload.role as User['role']
  }
}

export function isStudentEmail(email: string): boolean {
  const studentDomains = [
    'edu.co',
    'university.edu',
    'estudiantes.edu',
    'student.edu'
  ]
  
  const domain = email.split('@')[1]?.toLowerCase()
  return studentDomains.some(studentDomain => domain?.includes(studentDomain)) || 
         domain?.includes('.edu')
}

export function isCorporateEmail(email: string): boolean {
  const corporateDomains = [
    'intercorp.com',
    'intercorp.pe',
    'corporate.com',
    'company.com'
  ]
  
  const domain = email.split('@')[1]?.toLowerCase()
  return corporateDomains.some(corpDomain => domain?.includes(corpDomain))
}

export function determineUserRole(email: string): User['role'] {
  if (isStudentEmail(email)) return 'student'
  if (isCorporateEmail(email)) return 'corporate'
  return 'student' // Default role
}

export const authConfig = {
  jwtSecret: JWT_SECRET,
  jwtExpiresIn: JWT_EXPIRES_IN,
  cookieName: 'auth-token',
  protectedRoutes: ['/admin', '/students', '/proyectos'],
  publicRoutes: ['/login', '/', '/subir-proyecto']
}
