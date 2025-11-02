'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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
import PillNav from '@/components/PillNav'
import { supabase } from '@/lib/supabase-client'  // cliente público
const logoSrc = '/symaicon.webp'

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

function isE164(phone: string) {
  return /^\+?[1-9]\d{7,14}$/.test(phone.trim())
}

function LoginPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab') === 'signup' ? 'signup' : 'login'

  // --------- UI ----------
  const [mode, setMode] = useState<'login' | 'signup'>(tabParam)
  useEffect(() => setMode(tabParam), [tabParam])

  const activeHref = useMemo(
    () => (mode === 'signup' ? '/login?tab=signup' : '/login?tab=login'),
    [mode]
  )

  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // --------- Login ----------
  const [formData, setFormData] = useState<LoginFormData>({ email: '', password: '' })

  // --------- Signup ----------
  const [sname, setSName] = useState('')
  const [srole, setSRole] = useState<'student' | 'corporate'>('student')
  const [semail, setSEmail] = useState('')
  const [spass, setSPass] = useState('')
  const [sphone, setSPhone] = useState('') // E.164
  const [smsStep, setSmsStep] = useState<null | { phone: string }>(null)
  const [smsCode, setSmsCode] = useState('')

  // ¿ya está autenticado?
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const userData = await response.json()
          setIsAuthenticated(true)
          redirectUser(userData.user.role)
        }
      } catch {
        // no-op
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
    setFormData(prev => ({ ...prev, [field]: value }))
    setError(null)
  }

  const redirectUser = (role: string) => {
    switch (role) {
      case 'student':   router.push('/students');  break
      case 'corporate': router.push('/proyectos'); break
      case 'admin':     router.push('/admin');     break
      default:          router.push('/')
    }
  }

  // ------------ LOGIN ------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError(null)

    try {
      if (!formData.email || !formData.password) throw new Error('Por favor completa todos los campos')
      if (!formData.email.includes('@')) throw new Error('Por favor ingresa un email válido')

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Error al iniciar sesión')

      setIsAuthenticated(true)
      redirectUser(data.user.role)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  // ------------ SIGNUP + SMS ------------
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError(null)

    try {
      if (!isE164(sphone)) throw new Error('Teléfono inválido. Usa formato internacional (ej: +51..., +34..., +1...)')

      // 1) Crear cuenta
      const { data: su, error: e1 } = await supabase.auth.signUp({
        email: semail.trim(),
        password: spass,
        options: {
          data: { role: srole, name: sname },
          emailRedirectTo: `${location.origin}/auth/callback`,
        }
      })
      if (e1) throw e1

      // 2) Guardar teléfono -> envía OTP
      const { error: e2 } = await supabase.auth.updateUser({ phone: sphone.trim() })
      if (e2) throw e2

      // 3) Guardar perfil (RLS debe permitir upsert del propio usuario)
      const uid = su.user?.id
      if (uid) {
        await supabase.from('profiles').upsert({
          id: uid,
          email: semail.trim(),
          phone: sphone.trim(),
          role: srole,
          name: sname
        })
      }

      setSmsStep({ phone: sphone.trim() })
      if (mode !== 'signup') router.replace('/login?tab=signup')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'No se pudo crear la cuenta'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifySms = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!smsStep) return
    setLoading(true); setError(null)

    try {
      const { error } = await supabase.auth.verifyOtp({
        phone: smsStep.phone,
        token: smsCode.trim(),
        type: 'sms'
      })
      if (error) throw error

      // Obtener rol desde profiles y redirigir
      const { data: userRes } = await supabase.auth.getUser()
      const uid = userRes.user?.id
      let finalRole: 'student' | 'corporate' | 'admin' = 'student'
      if (uid) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', uid)
          .single()
        if (profile?.role) finalRole = profile.role as 'student' | 'corporate' | 'admin'
      }
      redirectUser(finalRole)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'No se pudo verificar el código'
      setError(msg)
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
      {/* py-12 -> py-4 para menos espacio arriba/abajo */}
      <main className="container mx-auto px-4 py-4">
        <div className="max-w-4xl mx-auto">
          {/* mb-8 -> mb-6, mt-2 -> mt-0, y h1 mb-0 */}
          <div className="text-center mb-6 mt-5">
            <h1 className="text-4xl font-bold text-foreground mb-0 mt-0">Bienvenido a Syma</h1>
            <p className="text-lg text-muted-foreground">
              Conecta estudiantes talentosos con oportunidades empresariales
            </p>
          </div>

          {/* gap-20 -> gap-12, pb-8 mb-20 -> pb-4 mb-8 para menos espacio vertical columna */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pb-4 mb-8">
            {/* Card izquierda: Login / Registro */}
            <Card>
              <CardHeader className="pb-2">
                {/* Título sin ícono */}
                <CardTitle className="w-full h-full">
                  {mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
                </CardTitle>

                {/* PillNav DENTRO del formulario (en el header del card) */}
                <div className="relative mt-3">
                  {/* Este contenedor reserva espacio para el PillNav, ya que por defecto
                      el componente trae un wrapper absolute. */}
                  <div className="relative h-[64px]">
                    <PillNav
                      logo={logoSrc}
                      logoAlt="Syma"
                      items={[
                        { label: 'Iniciar', href: '/login?tab=login' },
                        { label: 'Registro', href: '/login?tab=signup' },
                      ]}
                      activeHref={activeHref}
                      className="!relative !top-0 !w-auto"
                      ease="power2.easeOut"
                      baseColor="#0d5426ff"
                      pillColor="#ffffffff"
                      hoveredPillTextColor="#f6f1f1ff"
                      pillTextColor="#202020ff"
                    />
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {/* LOGIN */}
                {mode === 'login' && (
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
                        placeholder="pepe@universidad.edu"
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
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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

                    <Button type="submit" className="w-full gap-2" disabled={loading}>
                      {loading ? (<><Loader2 className="h-4 w-4 animate-spin" /> Iniciando sesión...</>) : 'Iniciar Sesión'}
                    </Button>
                  </form>
                )}

                {/* SIGNUP + SMS */}
                {mode === 'signup' && (
                  !smsStep ? (
                    <form onSubmit={handleSignup} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Nombre</label>
                          <Input value={sname} onChange={e => setSName(e.target.value)} placeholder="Tu nombre" />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Rol</label>
                          <select
                            className="w-full border rounded-md px-3 py-2 bg-background"
                            value={srole}
                            onChange={e => setSRole(e.target.value as 'student' | 'corporate')}
                          >
                            <option value="student">Estudiante</option>
                            <option value="corporate">Intercorp</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium">Email</label>
                        <Input type="email" value={semail} onChange={e => setSEmail(e.target.value)} required placeholder="pepe@correo.com" />
                      </div>

                      <div>
                        <label className="text-sm font-medium">Contraseña</label>
                        <Input type="password" value={spass} onChange={e => setSPass(e.target.value)} required placeholder="Mín. 6 caracteres" />
                      </div>

                      <div>
                        <label className="text-sm font-medium">Teléfono (SMS – formato internacional)</label>
                        <Input value={sphone} onChange={e => setSPhone(e.target.value)} placeholder="+51 999 999 999" required />
                      </div>

                      {error && (
                        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-destructive" />
                            <p className="text-destructive text-sm">{error}</p>
                          </div>
                        </div>
                      )}

                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? (<><Loader2 className="h-4 w-4 animate-spin" /> Creando cuenta...</>) : 'Crear cuenta y enviar SMS'}
                      </Button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifySms} className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">
                          Ingresa el código enviado por SMS a <span className="font-semibold">{smsStep.phone}</span>
                        </label>
                        <Input
                          inputMode="numeric"
                          pattern="\d*"
                          value={smsCode}
                          onChange={e => setSmsCode(e.target.value)}
                          placeholder="Código de 6 dígitos"
                          required
                        />
                      </div>

                      {error && (
                        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-destructive" />
                            <p className="text-destructive text-sm">{error}</p>
                          </div>
                        </div>
                      )}

                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? (<><Loader2 className="h-4 w-4 animate-spin" /> Verificando...</>) : 'Verificar SMS'}
                      </Button>
                    </form>
                  )
                )}
              </CardContent>
            </Card>

            {/* Info de roles */}
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
                    <span className="text-sm text-muted-foreground">Correo institucional (.edu)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Intercorp</Badge>
                    <span className="text-sm text-muted-foreground">Correo corporativo (intercorp.com)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Admin</Badge>
                    <span className="text-sm text-muted-foreground">Acceso especial</span>
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

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  )
}