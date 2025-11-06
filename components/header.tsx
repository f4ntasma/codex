'use client'

import { useState, useEffect } from 'react'
import Link from "next/link"
import Image from "next/image"
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Code2, Upload, LogOut, User } from "lucide-react"
import { supabase } from '@/lib/supabase-client'

interface User {
  id: string
  email: string
  name: string
  role: 'student' | 'corporate' | 'admin'
  avatar?: string
}

export function Header() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Verificar sesión de Supabase
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session) {
          // Obtener perfil del usuario directamente desde Supabase
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (!error && profile) {
            setUser({
              id: profile.id,
              email: profile.email,
              name: profile.name,
              role: profile.role,
              avatar: profile.avatar || undefined
            })
          }
        }
      } catch (error) {
        // Silenciar errores - el usuario simplemente no está autenticado
        console.error('Auth check failed:', error)
      } finally {
        setLoading(false)
      }
    }
    
    checkAuth()

    // Escuchar cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        checkAuth()
      } else {
        setUser(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const getNavigationLinks = () => {
    if (!user) return null

    const baseLinks = [
      { href: '/', label: 'Inicio' }
    ]

    if (user.role === 'student' || user.role === 'admin') {
      baseLinks.push({ href: '/students', label: 'Estudiantes' })
    }

    if (user.role === 'corporate' || user.role === 'admin') {
      baseLinks.push({ href: '/proyectos', label: 'Proyectos' })
    }

    if (user.role === 'admin') {
      baseLinks.push({ href: '/admin', label: 'Admin' })
    }

    return baseLinks
  }

  const navigationLinks = getNavigationLinks()

  return (
    <header className="border-b border-border bg-card sticky z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-5 hover:opacity-80 transition-opacity">
          <Image 
            src="/symalog.webp" 
            alt="UniProjects Logo"
            loading="lazy" 
            width={150} 
            height={100}
            className="h-30 w-30 object-contain mt-6"
          />
        </Link>

        {user && (
          <nav className="hidden md:flex items-center gap-6">
            {navigationLinks?.map((link) => (
              <Link 
                key={link.href}
                href={link.href} 
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-3">
          {loading ? (
            <div className="h-8 w-20 bg-muted animate-pulse rounded" />
          ) : user ? (
            <>
              <div className="hidden md:flex items-center gap-2 text-sm">
                <User className="h-4 w-4" />
                <span className="text-muted-foreground">{user.name}</span>
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                  {user.role}
                </span>
              </div>
              <Link href="/subir-proyecto">
                <Button size="sm" className="gap-2">
                  <Upload className="h-4 w-4" />
                  Subir Proyecto
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Iniciar Sesión
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
