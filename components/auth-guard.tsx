'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

interface User {
  id: string
  email: string
  name: string
  role: 'student' | 'corporate' | 'admin'
  avatar?: string
  university?: string
  company?: string
}

interface AuthGuardProps {
  children: React.ReactNode
  allowedRoles?: ('student' | 'corporate' | 'admin')[]
  redirectTo?: string
}

export function AuthGuard({ children, allowedRoles, redirectTo = '/login' }: AuthGuardProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        
        if (!response.ok) {
          router.push(redirectTo)
          return
        }

        const data = await response.json()
        const userData = data.user

        // Verificar roles permitidos
        if (allowedRoles && !allowedRoles.includes(userData.role)) {
          router.push('/unauthorized')
          return
        }

        setUser(userData)
      } catch (error) {
        console.error('Auth check failed:', error)
        router.push(redirectTo)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [allowedRoles, redirectTo, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}

// Componentes específicos para cada rol
export function StudentGuard({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={['student', 'admin']}>
      {children}
    </AuthGuard>
  )
}

export function CorporateGuard({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={['corporate', 'admin']}>
      {children}
    </AuthGuard>
  )
}

export function AdminGuard({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={['admin']}>
      {children}
    </AuthGuard>
  )
}
