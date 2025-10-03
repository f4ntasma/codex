import { NextRequest, NextResponse } from 'next/server'
import { generateToken, determineUserRole, isStudentEmail, isCorporateEmail } from '@/lib/auth'
import { createAuthResponse } from '@/lib/auth-middleware'

// Datos de usuarios de ejemplo (en producción vendrían de una base de datos)
const users = [
  {
    id: '1',
    email: 'admin@university.edu',
    password: 'admin123',
    name: 'Administrador',
    role: 'admin' as const,
    avatar: '/placeholder-user.jpg'
  },
  {
    id: '2',
    email: 'estudiante@university.edu',
    password: 'student123',
    name: 'María González',
    role: 'student' as const,
    avatar: '/placeholder-user.jpg',
    university: 'Universidad Nacional'
  },
  {
    id: '3',
    email: 'empleado@intercorp.com',
    password: 'corp123',
    name: 'Carlos Ramírez',
    role: 'corporate' as const,
    avatar: '/placeholder-user.jpg',
    company: 'Intercorp'
  },
  {
    id: '4',
    email: 'juan@estudiantes.edu',
    password: 'juan123',
    name: 'Juan Pérez',
    role: 'student' as const,
    avatar: '/placeholder-user.jpg',
    university: 'Universidad Tecnológica'
  },
  {
    id: '5',
    email: 'ana@intercorp.pe',
    password: 'ana123',
    name: 'Ana Martínez',
    role: 'corporate' as const,
    avatar: '/placeholder-user.jpg',
    company: 'Intercorp Perú'
  }
]

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validaciones básicas
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      )
    }

    // Buscar usuario por email
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase())
    
    if (!user) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      )
    }

    // Verificar contraseña (en producción usar bcrypt)
    if (user.password !== password) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      )
    }

    // Determinar rol basado en el email si no está definido
    let userRole = user.role
    if (!userRole || userRole === 'student') {
      if (isStudentEmail(email)) {
        userRole = 'student'
      } else if (isCorporateEmail(email)) {
        userRole = 'corporate'
      } else {
        userRole = determineUserRole(email)
      }
    }

    // Crear objeto de usuario
    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: userRole,
      avatar: user.avatar,
      university: user.university,
      company: user.company
    }

    // Generar token JWT
    const token = generateToken(userData)

    // Crear respuesta con cookie
    return createAuthResponse(userData, token)

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
