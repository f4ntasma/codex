'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase-client'

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
    let isMounted = true

    const checkAuth = async () => {
      try {
        // Verificar sesión de Supabase inmediatamente (sin delay inicial)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (!isMounted) return
        
        if (sessionError || !session) {
          router.replace(redirectTo)
          setLoading(false)
          return
        }

        // Obtener perfil del usuario
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (!isMounted) return

        if (profileError || !profile) {
          console.error('Profile error:', profileError)
          router.replace(redirectTo)
          setLoading(false)
          return
        }

        const userData: User = {
          id: profile.id,
          email: profile.email,
          name: profile.name,
          role: profile.role,
          avatar: profile.avatar || undefined,
          university: profile.university || undefined,
          company: profile.company || undefined
        }

        // Verificar roles permitidos
        if (allowedRoles && !allowedRoles.includes(userData.role)) {
          router.replace('/unauthorized')
          setLoading(false)
          return
        }

        if (isMounted) {
          setUser(userData)
          setLoading(false)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        if (isMounted) {
          router.replace(redirectTo)
          setLoading(false)
        }
      }
    }

    checkAuth()

    // Escuchar cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return
      
      if (!session) {
        setUser(null)
        router.replace(redirectTo)
      } else {
        checkAuth()
      }
    })

    return () => {
      isMounted = false
      if (subscription) {
        subscription.unsubscribe()
      }
    }
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
