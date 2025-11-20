'use client'

import { useState, useEffect, useMemo, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
} from 'lucide-react'
import PillNav from '@/components/PillNav'
import { supabase } from '@/lib/supabase-client'

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

function LoginPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab') === 'signup' ? 'signup' : 'login'

  const [mode, setMode] = useState<'login' | 'signup'>(tabParam)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [needsRoleSelection, setNeedsRoleSelection] = useState(false)
  const [pendingUser, setPendingUser] = useState<{ id: string; email: string; name?: string } | null>(null)
  const [selectedRole, setSelectedRole] = useState<'student' | 'corporate'>('student')

  const [formData, setFormData] = useState<LoginFormData>({ email: '', password: '' })
  const [sname, setSName] = useState('')
  const [semail, setSEmail] = useState('')
  const [spass, setSPass] = useState('')

  const activeHref = useMemo(
    () => (mode === 'signup' ? '/login?tab=signup' : '/login?tab=login'),
    [mode]
  )

  useEffect(() => setMode(tabParam), [tabParam])

  const redirectUser = useCallback(
    (role: string) => {
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
          router.push('/students')
      }
    },
    [router]
  )

  const fetchOrCreateProfile = useCallback(async (userId: string, email: string, name?: string) => {
    try {
      const { data: existing } = await supabase
        .from('profiles')
        .select('id, email, name, role')
        .eq('id', userId)
        .single()

      if (existing) return existing

      const fallbackName = name || email?.split('@')[0] || 'Usuario'
      const { data: created, error: insertError } = await supabase
        .from('profiles')
        .insert([{ id: userId, email, name: fallbackName, role: null }])
        .select()
        .single()

      if (insertError) throw insertError
      return created
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'No se pudo obtener el perfil'
      throw new Error(msg)
    }
  }, [])

  const handlePostAuth = useCallback(
    async (user: any) => {
      const email = user?.email || ''
      const displayName = user?.user_metadata?.name || email.split('@')[0] || 'Usuario'

      const profile = await fetchOrCreateProfile(user.id, email, displayName)

      if (!profile?.role) {
        setPendingUser({ id: profile.id, email: profile.email, name: profile.name })
        setNeedsRoleSelection(true)
        return
      }

      setIsAuthenticated(true)
      redirectUser(profile.role)
    },
    [fetchOrCreateProfile, redirectUser]
  )

  // ¿ya está autenticado? Solo verificar si no hay un login en proceso
  useEffect(() => {
    if (loading || needsRoleSelection) return

    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          await handlePostAuth(session.user)
        }
      } catch {
        // no-op
      }
    }
    checkAuth()
  }, [loading, needsRoleSelection, handlePostAuth])

  const userRoles: UserRole[] = [
    {
      role: 'student',
      title: 'Estudiante',
      description: 'Acceso a proyectos y perfil estudiantil',
      icon: <GraduationCap className="h-6 w-6" />,
      color: 'bg-blue-500',
    },
    {
      role: 'corporate',
      title: 'Empresa',
      description: 'Acceso a proyectos y funciones de contratación',
      icon: <Building2 className="h-6 w-6" />,
      color: 'bg-green-500',
    },
  ]

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError(null)
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError(null)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/login?tab=login` : undefined,
        },
      })

      if (error) throw error
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'No se pudo iniciar sesión con Google'
      setError(msg)
      setLoading(false)
    }
  }

  // ---------- LOGIN ----------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!formData.email || !formData.password) throw new Error('Por favor completa todos los campos')

      // Login directo con Supabase en el cliente (correo y contraseña)
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email.trim(),
        password: formData.password,
      })

      if (error || !data.user) {
        throw new Error(error?.message || 'Credenciales inválidas')
      }

      // Verificar que la sesión está disponible (Supabase ya la establece inmediatamente)
      const {
        data: { session: newSession },
      } = await supabase.auth.getSession()
      if (!newSession) {
        throw new Error('Error al establecer la sesión')
      }

      await handlePostAuth(data.user)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  // ---------- SIGNUP ----------
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!semail.toLowerCase().endsWith('@gmail.com')) {
        throw new Error('Usa un correo de Gmail para registrarte')
      }

      // Crear cuenta en Supabase
      const { error } = await supabase.auth.signUp({
        email: semail.trim(),
        password: spass,
        options: {
          data: { name: sname },
          emailRedirectTo: `${location.origin}/auth/callback`,
        },
      })
      if (error) throw error

      alert('Cuenta creada exitosamente. Revisa tu correo de Gmail para validar e inicia sesión.')
      router.push('/login?tab=login')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'No se pudo crear la cuenta'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveRole = async () => {
    if (!pendingUser) return
    setLoading(true)
    setError(null)

    try {
      const fallbackName = pendingUser.name || pendingUser.email.split('@')[0] || 'Usuario'
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: pendingUser.id,
          email: pendingUser.email,
          name: fallbackName,
          role: selectedRole,
        })
        .select()
        .single()

      if (error) throw error

      setIsAuthenticated(true)
      redirectUser(selectedRole)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'No se pudo guardar tu rol'
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

  if (needsRoleSelection && pendingUser) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-10">
          <div className="max-w-3xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Elige tu rol</CardTitle>
                <p className="text-muted-foreground text-sm">
                  Tu cuenta de Gmail/Google se creó. Selecciona cómo quieres usar la plataforma.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userRoles.map(role => (
                    <button
                      key={role.role}
                      type="button"
                      onClick={() => setSelectedRole(role.role)}
                      className={`text-left p-4 rounded-lg border transition-all ${
                        selectedRole === role.role ? 'border-primary bg-primary/10 shadow-sm' : 'border-border hover:border-primary/50'
                      }`}
                      disabled={loading}
                    >
                      <div className={`inline-flex p-2 rounded-full ${role.color} text-white mb-3`}>{role.icon}</div>
                      <h3 className="font-semibold text-foreground">{role.title}</h3>
                      <p className="text-sm text-muted-foreground">{role.description}</p>
                    </button>
                  ))}
                </div>

                {error && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-destructive" />
                      <p className="text-destructive text-sm">{error}</p>
                    </div>
                  </div>
                )}

                <Button className="w-full" onClick={handleSaveRole} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Guardando rol...
                    </>
                  ) : (
                    'Guardar y continuar'
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6 mt-5">
            <h1 className="text-4xl font-bold text-foreground mb-0 mt-0">Bienvenido a Syma</h1>
            <p className="text-lg text-muted-foreground">Conecta estudiantes talentosos con oportunidades empresariales</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pb-4 mb-8">
            {/* Card izquierda: Login / Registro */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="w-full h-full">{mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}</CardTitle>
                <div className="relative mt-3">
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
                        Correo de Gmail
                      </label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={e => handleInputChange('email', e.target.value)}
                        placeholder="tu.nombre@gmail.com"
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
                          onChange={e => handleInputChange('password', e.target.value)}
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

                    <div className="space-y-2">
                      <Button type="submit" className="w-full gap-2" disabled={loading}>
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" /> Iniciando sesión...
                          </>
                        ) : (
                          'Iniciar sesión con correo'
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full gap-2"
                        onClick={handleGoogleLogin}
                        disabled={loading}
                      >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />} Ingresar con
                        Google
                      </Button>
                    </div>
                  </form>
                )}

                {/* SIGNUP */}
                {mode === 'signup' && (
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Nombre</label>
                      <Input value={sname} onChange={e => setSName(e.target.value)} placeholder="Tu nombre completo" />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Correo de Gmail</label>
                      <Input
                        type="email"
                        value={semail}
                        onChange={e => setSEmail(e.target.value)}
                        required
                        placeholder="tu.nombre@gmail.com"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Contraseña</label>
                      <Input
                        type="password"
                        value={spass}
                        onChange={e => setSPass(e.target.value)}
                        required
                        placeholder="Mín. 6 caracteres"
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
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" /> Creando cuenta...
                        </>
                      ) : (
                        'Crear cuenta'
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>

            {/* Info de roles */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tipos de usuario</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {userRoles.map(role => (
                    <div key={role.role} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <div className={`p-2 rounded-full ${role.color} text-white`}>{role.icon}</div>
                      <div>
                        <h3 className="font-semibold text-foreground">{role.title}</h3>
                        <p className="text-sm text-muted-foreground">{role.description}</p>
                      </div>
                    </div>
                  ))}
                  <div className="text-sm text-muted-foreground">
                    Elige si eres estudiante o empresa después de iniciar sesión. Puedes cambiarlo luego desde tu perfil.
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Formas de acceso</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Correo</Badge>
                    <span className="text-sm text-muted-foreground">Usa tu correo @gmail.com y tu contraseña</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Google</Badge>
                    <span className="text-sm text-muted-foreground">Inicia sesión directamente con tu cuenta de Google</span>
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
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando...</p>
          </div>
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  )
}
