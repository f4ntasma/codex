'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  GraduationCap,
  Building2,
  Shield
} from "lucide-react"
import Image from "next/image"

interface LoginFormData {
  email: string
  password: string
}

interface UserRole {
  role: 'student' | 'corporate' | 'admin'
  title: string
  description: string
  icon: React.ReactNode
  color: string
}

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Verificar si ya está autenticado perra xD
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const userData = await response.json()
          setIsAuthenticated(true)
          redirectUser(userData.user.role)
        }
      } catch (error) {
        // No autenticado, continuar con login perra xD
      }
    }
    
    checkAuth()
  }, [])

  const userRoles: UserRole[] = [
    {
      role: 'student',
      title: 'Estudiante',
      description: 'Acceso a proyectos y perfil estudiantil',
      icon: <GraduationCap className="h-6 w-6" />,
      color: 'bg-blue-500'
    },
    {
      role: 'corporate',
      title: 'Intercorp',
      description: 'Acceso a proyectos y funciones de contratación',
      icon: <Building2 className="h-6 w-6" />,
      color: 'bg-green-500'
    },
    {
      role: 'admin',
      title: 'Administrador',
      description: 'Acceso completo al panel de administración',
      icon: <Shield className="h-6 w-6" />,
      color: 'bg-purple-500'
    }
  ]

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    setError(null)
  }

  const redirectUser = (role: string) => {
    switch (role) {
      case 'student':
        router.push('/students')
        break
      case 'corporate':
        router.push('/proyectos')
        break
      case 'admin':
        router.push('/admin')
        break
      default:
        router.push('/')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Validaciones básicas perra xD
      if (!formData.email || !formData.password) {
        throw new Error('Por favor completa todos los campos')
      }

      if (!formData.email.includes('@')) {
        throw new Error('Por favor ingresa un email válido')
      }

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al iniciar sesión')
      }

      // Login exitoso perra xD
      setIsAuthenticated(true)
      redirectUser(data.user.role)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">¡Bienvenido!</h2>
          <p className="text-muted-foreground">Redirigiendo...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header perra xD */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Image 
                src="/blacklog.jpg" 
                alt="Codex" 
                width={200} 
                height={80}
                className="h-16 w-auto"
              />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Bienvenido a Codex
            </h1>
            <p className="text-lg text-muted-foreground">
              Conecta estudiantes talentosos con oportunidades empresariales
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Formulario de Login perra xD */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Iniciar Sesión
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      <Mail className="h-4 w-4 inline mr-1" />
                      Correo Electrónico
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="tu@universidad.edu"
                      required
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      <Lock className="h-4 w-4 inline mr-1" />
                      Contraseña
                    </label>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        placeholder="Tu contraseña"
                        required
                        className="w-full pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-destructive" />
                        <p className="text-destructive text-sm">{error}</p>
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full gap-2"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Iniciando sesión...
                      </>
                    ) : (
                      'Iniciar Sesión'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Información de Roles perra xD */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tipos de Usuario</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {userRoles.map((role) => (
                    <div key={role.role} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <div className={`p-2 rounded-full ${role.color} text-white`}>
                        {role.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{role.title}</h3>
                        <p className="text-sm text-muted-foreground">{role.description}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Requisitos de Acceso</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Estudiantes</Badge>
                    <span className="text-sm text-muted-foreground">
                      Correo institucional (.edu)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Intercorp</Badge>
                    <span className="text-sm text-muted-foreground">
                      Correo corporativo (intercorp.com)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Admin</Badge>
                    <span className="text-sm text-muted-foreground">
                      Acceso especial
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
