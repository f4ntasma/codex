'use client'

import { useState, useEffect } from 'react'
import Link from "next/link"
import Image from "next/image"
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Code2, Upload, LogOut, User } from "lucide-react"

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
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
      } finally {
        setLoading(false)
      }
    }
    
    checkAuth()
  }, [])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
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
